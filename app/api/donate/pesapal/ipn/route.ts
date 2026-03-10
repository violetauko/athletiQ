import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPesapalToken, getTransactionStatus } from "@/lib/pesapal";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { OrderTrackingId } = body;

    if (!OrderTrackingId) {
      return NextResponse.json({ error: "Missing OrderTrackingId" }, { status: 400 });
    }

    // 1. Get token and verify status from Pesapal
    const token = await getPesapalToken();
    const statusData = await getTransactionStatus(token, OrderTrackingId);

    // 2. Find the donation record
    const donation = await prisma.donation.findUnique({
      where: { pesapalOrderId: OrderTrackingId },
    });

    if (!donation) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    // 3. Update status
    const isCompleted =
      statusData.payment_status_description === "Completed" || statusData.status_code === 1;
    const isFailed =
      statusData.payment_status_description === "Failed" || statusData.status_code === 2;

    if (isCompleted && donation.status !== "PAID") {
      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: "PAID", paidAt: new Date() },
      });
    } else if (isFailed && donation.status !== "FAILED") {
      await prisma.donation.update({
        where: { id: donation.id },
        data: { status: "FAILED" },
      });
    }

    return NextResponse.json({ status: 200, message: "IPN received" });
  } catch (error: any) {
    console.error("Pesapal Donate IPN Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
