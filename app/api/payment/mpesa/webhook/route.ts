import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus, PaymentPurpose, PaymentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Safaricom wraps the payload in a Body.stkCallback object
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode; // 0 means success (number or string)
    const resultDesc = stkCallback.ResultDesc;
    const normalizedResultCode =
      typeof resultCode === "number" ? resultCode : Number(resultCode);

    // We must find the active payment for this request
    const payment = await prisma.payment.findFirst({
      where: {
        referenceId: checkoutRequestID,
        NOT: { status: PaymentStatus.COMPLETED },
      },
    });

    if (!payment) {
      console.warn(`M-Pesa Webhook: No pending payment found for MerchantRequestID ${checkoutRequestID}`);
      // Return 200 so Safaricom stops retrying, even though we didn't process it.
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
    }

    if (normalizedResultCode === 0) {
      // Payment Successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item;
      let mpesaReceiptNumber = "";

      if (callbackMetadata && Array.isArray(callbackMetadata)) {
        const receiptItem = callbackMetadata.find((item: any) => item.Name === "MpesaReceiptNumber");
        if (receiptItem) {
          mpesaReceiptNumber = receiptItem.Value;
        }
      }

      // Marketplace: order id is in merchantReference; purpose must match (do not rely on merchantReference alone)
      if (
        payment.purpose === PaymentPurpose.MARKETPLACE_PURCHASE &&
        payment.merchantReference
      ) {
        await prisma.$transaction(async (tx) => {
          // 1. Update Payment
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.COMPLETED,
              receiptNumber: mpesaReceiptNumber,
            },
          });

          // 2. Update Order Status
          const order = await tx.order.update({
            where: { id: payment.merchantReference! },
            data: { status: "PROCESSING" },
            include: { OrderItem: true }
          });

          // 3. Decrement Stock
          for (const item of order.OrderItem) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            });
          }
        });

        console.log(`M-Pesa Order Payment ${checkoutRequestID} processed for Order ${payment.merchantReference}`);
      } else {
        // It's an entry fee payment
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.COMPLETED,
              receiptNumber: mpesaReceiptNumber,
            },
          }),
          prisma.user.update({
            where: { id: payment.userId },
            data: { hasPaidFee: true },
          }),
        ]);

        console.log(`M-Pesa Entry Fee payment ${checkoutRequestID} successfully processed for user ${payment.userId}`);
      }
    } else {
      // Payment Failed (user cancelled, insufficient funds, etc.)
      console.log(
        `M-Pesa payment ${checkoutRequestID} failed with ResultCode ${resultCode}: ${resultDesc}`
      );

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
          },
        });

        if (
          payment.purpose === PaymentPurpose.MARKETPLACE_PURCHASE &&
          payment.merchantReference
        ) {
          await tx.order.updateMany({
            where: {
              id: payment.merchantReference,
              status: OrderStatus.PENDING,
            },
            data: { status: OrderStatus.CANCELLED },
          });
        }
      });
    }

    // Acknowledge receipt to Safaricom
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Success",
    });

  } catch (error) {
    console.error("M-Pesa Webhook Error:", error);
    // Even if we crash, it's safer to return 200, but a 500 will make Safaricom retry.
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
