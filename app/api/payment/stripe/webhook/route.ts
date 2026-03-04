import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { PaymentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  const stripe = getStripe();
  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Stripe Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      if (session.metadata?.type === "ATHLETE_ENTRY_FEE") {
        const userId = session.metadata.userId;

        // Ensure we find the PENDING payment record
        const payment = await prisma.payment.findFirst({
          where: {
            referenceId: session.id,
            status: PaymentStatus.PENDING,
          },
        });

        if (payment) {
          // Update the payment record and user status atomically
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.COMPLETED,
                receiptNumber: session.payment_intent as string | undefined,
              },
            }),
            prisma.user.update({
              where: { id: userId },
              data: { hasPaidFee: true },
            }),
          ]);

          console.log(`Successfully processed payment for user ${userId}`);
        } else {
          console.warn(`No pending payment found for session ${session.id}`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
