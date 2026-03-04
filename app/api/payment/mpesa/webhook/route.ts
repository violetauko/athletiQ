import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Safaricom wraps the payload in a Body.stkCallback object
    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode; // 0 means success
    const resultDesc = stkCallback.ResultDesc;

    // We must find the active payment for this request
    const payment = await prisma.payment.findFirst({
      where: {
        referenceId: checkoutRequestID,
        status: PaymentStatus.PENDING,
      },
    });

    if (!payment) {
      console.warn(`M-Pesa Webhook: No pending payment found for MerchantRequestID ${checkoutRequestID}`);
      // Return 200 so Safaricom stops retrying, even though we didn't process it.
      return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
    }

    if (resultCode === 0) {
      // Payment Successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item;
      let mpesaReceiptNumber = "";

      if (callbackMetadata && Array.isArray(callbackMetadata)) {
        const receiptItem = callbackMetadata.find((item: any) => item.Name === "MpesaReceiptNumber");
        if (receiptItem) {
          mpesaReceiptNumber = receiptItem.Value;
        }
      }

      // Update the DB in a transaction
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

      console.log(`M-Pesa payment ${checkoutRequestID} successfully processed for user ${payment.userId}`);
    } else {
      // Payment Failed (user cancelled, insufficient funds, etc.)
      console.log(`M-Pesa payment ${checkoutRequestID} failed with ResultCode ${resultCode}: ${resultDesc}`);
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
        },
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
