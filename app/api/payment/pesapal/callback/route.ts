import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPesapalToken, getTransactionStatus } from "@/lib/pesapal";
import { PaymentStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderTrackingId = searchParams.get("OrderTrackingId");
    const orderMerchantReference = searchParams.get("OrderMerchantReference");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!orderTrackingId) {
      return NextResponse.redirect(`${appUrl}/dashboard/athlete?payment=failed`);
    }

    // Fetch the payment to see if it's already completed by IPN
    const payment = await prisma.payment.findFirst({
      where: { referenceId: orderTrackingId },
    });

    if (!payment) {
      return NextResponse.redirect(`${appUrl}/dashboard/athlete?payment=failed`);
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      // IPN already processed it
      return NextResponse.redirect(`${appUrl}/dashboard/athlete?payment=success`);
    }

    if (payment.status === PaymentStatus.FAILED) {
      return NextResponse.redirect(`${appUrl}/dashboard/athlete?payment=failed`);
    }

    // 1. Get Pesapal token
    const token = await getPesapalToken();

    // 2. Fetch transaction status from Pesapal
    const statusData = await getTransactionStatus(token, orderTrackingId);

    // 3. Process status if IPN hasn't yet (fallback mechanism)
    let newStatus: PaymentStatus = payment.status;
    let hasPaidFee = false;

    if (statusData.payment_status_description === "Completed" || statusData.status_code === 1) {
      newStatus = PaymentStatus.COMPLETED;
      hasPaidFee = true;
    } else if (statusData.payment_status_description === "Failed" || statusData.status_code === 2) {
      newStatus = PaymentStatus.FAILED;
    }

    if (payment.status !== newStatus) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: newStatus },
        });

        if (hasPaidFee) {
          await tx.user.update({
            where: { id: payment.userId },
            data: { hasPaidFee: true },
          });
        }
      });
    }

    if (hasPaidFee) {
      return NextResponse.redirect(`${appUrl}/dashboard/athlete?payment=success`);
    } else {
      return NextResponse.redirect(`${appUrl}/dashboard/athlete?payment=failed`);
    }

  } catch (error: any) {
    console.error("Pesapal Callback Error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/dashboard/athlete?payment=failed`);
  }
}
