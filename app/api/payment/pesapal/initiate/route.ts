import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPesapalToken, registerIPN, submitOrder } from "@/lib/pesapal";
import { PaymentProvider, PaymentPurpose, PaymentStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

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

    // 1. Get Pesapal token
    const token = await getPesapalToken();

    // 2. Register IPN
    const ipnId = await registerIPN(token);

    // 3. Prepare order data
    const merchantReference = uuidv4();
    const orderData = {
      id: merchantReference,
      currency: "KES",
      amount: amountKes,
      description: "Athlete Onboarding Fee",
      callback_url: `${appUrl}/api/payment/pesapal/callback`,
      notification_id: ipnId,
      billing_address: {
        email_address: session.user.email,
        phone_number: null,
        country_code: "KE",
        first_name: session.user.name?.split(" ")[0] || "Athlete",
        middle_name: "",
        last_name: session.user.name?.split(" ")[1] || "",
        line_1: "",
        line_2: "",
        city: "",
        state: "",
        postal_code: null,
        zip_code: null,
      },
    };

    // 4. Submit order
    const orderResponse = await submitOrder(token, orderData);

    // 5. Create pending payment record
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: amountKes,
        currency: "KES",
        provider: PaymentProvider.PESAPAL,
        status: PaymentStatus.PENDING,
        purpose: PaymentPurpose.REGISTRATION_FEE,
        referenceId: orderResponse.order_tracking_id, // Store Pesapal's tracking ID
        merchantReference: merchantReference, // Store our internal reference
      },
    });

    return NextResponse.json({ redirect_url: orderResponse.redirect_url });
  } catch (error: any) {
    console.error("Pesapal Initiate Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate Pesapal checkout" },
      { status: 500 }
    );
  }
}
