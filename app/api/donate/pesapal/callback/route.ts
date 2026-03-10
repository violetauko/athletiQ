import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPesapalToken, getTransactionStatus } from "@/lib/pesapal";

export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const { searchParams } = new URL(req.url);
    const orderTrackingId = searchParams.get("OrderTrackingId");

    if (!orderTrackingId) {
      return NextResponse.redirect(`${appUrl}/donate?canceled=true`);
    }

    const donation = await prisma.donation.findUnique({
      where: { pesapalOrderId: orderTrackingId },
    });

    if (!donation) {
      return NextResponse.redirect(`${appUrl}/donate?canceled=true`);
    }

    // Already confirmed by IPN
    if (donation.status === "PAID") {
      return NextResponse.redirect(
        `${appUrl}/donate/success?session_id=${orderTrackingId}`
      );
    }

    if (donation.status === "FAILED") {
      return NextResponse.redirect(`${appUrl}/donate?canceled=true`);
    }

    // Fallback: check status with Pesapal directly
    const token = await getPesapalToken();
    const statusData = await getTransactionStatus(token, orderTrackingId);

    const isCompleted =
      statusData.payment_status_description === "Completed" || statusData.status_code === 1;

    if (isCompleted) {
      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: "PAID", paidAt: new Date() },
      });
      return NextResponse.redirect(
        `${appUrl}/donate/success?session_id=${orderTrackingId}`
      );
    }

    return NextResponse.redirect(`${appUrl}/donate?canceled=true`);
  } catch (error: any) {
    console.error("Pesapal Donate Callback Error:", error);
    return NextResponse.redirect(`${appUrl}/donate?canceled=true`);
  }
}
