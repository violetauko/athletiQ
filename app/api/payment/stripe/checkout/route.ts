import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { PaymentProvider, PaymentPurpose, PaymentStatus } from "@prisma/client";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.hasPaidFee) {
      return NextResponse.json({ error: "Fee already paid" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const amountKes = Number(process.env.NEXT_PUBLIC_ENTRY_FEE_AMOUNT || 1000);
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "kes",
            product_data: {
              name: "Athlete Onboarding Fee",
              description: "One-time registration fee to access the athlete dashboard",
            },
            unit_amount: amountKes * 100, // Stripe expects amounts in smallest unit (cents/cents-equivalent)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}/dashboard/athlete?payment=success`,
      cancel_url: `${appUrl}/dashboard/athlete?payment=cancelled`,
      metadata: {
        userId: session.user.id,
        type: "ATHLETE_ENTRY_FEE",
      },
      customer_email: session.user.email ?? undefined,
    });

    // Create a pending payment record
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: amountKes,
        currency: "KES",
        provider: PaymentProvider.STRIPE,
        status: PaymentStatus.PENDING,
        purpose: PaymentPurpose.REGISTRATION_FEE,
        referenceId: checkoutSession.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
