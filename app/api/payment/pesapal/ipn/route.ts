import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPesapalToken, getTransactionStatus } from "@/lib/pesapal";
import { OrderStatus, PaymentPurpose, PaymentStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Pesapal payment callback body: ",body)
    const { OrderNotificationType, OrderTrackingId, OrderMerchantReference } = body;

    if (!OrderTrackingId) {
      return NextResponse.json({ error: "Missing OrderTrackingId" }, { status: 400 });
    }

    // 1. Get Pesapal token
    const token = await getPesapalToken();
    console.log("Pesapal token: ",token)

    // 2. Fetch transaction status from Pesapal
    const statusData = await getTransactionStatus(token, OrderTrackingId);
    console.log("pesapal payment status: ",statusData)

    // 3. Find the payment in our database
    const payment = await prisma.payment.findFirst({
      where: { referenceId: OrderTrackingId },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // 4. Update payment status based on Pesapal response
    let newStatus: PaymentStatus = payment.status;
    let hasPaidFee = false;

    // Pesapal status codes:
    // INVALID = 0, COMPLETED = 1, FAILED = 2, REVERSED = 3
    if (statusData.payment_status_description === "Completed" || statusData.status_code === 1) {
      newStatus = PaymentStatus.COMPLETED;
      hasPaidFee = true;
    } else if (statusData.payment_status_description === "Failed" || statusData.status_code === 2) {
      newStatus = PaymentStatus.FAILED;
    } else if (statusData.payment_status_description === "Reversed" || statusData.status_code === 3) {
      newStatus = PaymentStatus.FAILED; // Or a specific REVERSED status if added to schema
      hasPaidFee = false;
    }

    if (payment.status !== newStatus) {
      await prisma.$transaction(async (tx) => {
        // Always persist latest payment status first.
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: newStatus },
        });

        const isMarketplacePurchase =
          payment.purpose === PaymentPurpose.MARKETPLACE_PURCHASE &&
          Boolean(payment.merchantReference);

        if (isMarketplacePurchase) {
          const nextOrderStatus =
            newStatus === PaymentStatus.COMPLETED
              ? OrderStatus.PROCESSING
              : newStatus === PaymentStatus.FAILED
                ? OrderStatus.CANCELLED
                : null;

          if (nextOrderStatus) {
            await tx.order.updateMany({
              where: { id: payment.merchantReference! },
              data: { status: nextOrderStatus },
            });
          }
        } else if (hasPaidFee) {
          // Registration fee flow.
          await tx.user.update({
            where: { id: payment.userId },
            data: { hasPaidFee: true },
          });
        }
      });
    }

    // Acknowledge receipt to Pesapal
    return NextResponse.json({
      status: 200,
      message: "IPN received successfully",
    });
  } catch (error: any) {
    console.error("Pesapal IPN Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
