import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

// NOTE: The exact webhook structure for Stanbic M-Pesa is not included in the provided Swagger.
// This is a placeholder webhook listener that you can adapt once Stanbic provides their callback payload structure.

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // We assume Stanbic gives back the `dbsReferenceId` directly or inside some object
    const referenceId = body.dbsReferenceId; 
    const isSuccess = body.status === "Success" || body.responseCode === "0"; // Placeholder logic

    if (!referenceId) {
      return NextResponse.json({ error: "Invalid payload missing reference" }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        referenceId: referenceId,
        status: PaymentStatus.PENDING,
      },
    });

    if (!payment) {
      console.warn(`Stanbic Webhook: No pending payment found for reference ${referenceId}`);
      return NextResponse.json({ received: true });
    }

    if (isSuccess) {
      // Payment Successful
      let mpesaReceiptNumber = body.receiptNumber || ""; // Placeholder

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

      console.log(`Stanbic payment ${referenceId} successfully processed for user ${payment.userId}`);
    } else {
      // Payment Failed 
      console.log(`Stanbic payment ${referenceId} failed`);
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
        },
      });
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Stanbic Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
