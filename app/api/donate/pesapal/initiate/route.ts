import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPesapalToken, registerIPN, submitOrder } from "@/lib/pesapal";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, tierId, isCustom, donorName, message } = body;


    const session = await auth();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const amountKes = Math.round(amount / 100); // amount comes in cents

    // 1. Get Pesapal token
    const token = await getPesapalToken();

    // 2. Register IPN
    const ipnId = await registerIPN(token);

    // 3. Prepare order
    const merchantReference = uuidv4();

    const orderData = {
      id: merchantReference,
      currency: "KES",
      amount: amountKes,
      description: `AthletiQ Donation — ${tierId ?? "custom"}`,
      callback_url: `${appUrl}/api/donate/pesapal/callback`,
      notification_id: ipnId,
      billing_address: {
        email_address: session?.user?.email ?? null,
        phone_number: null,
        country_code: "KE",
        first_name: donorName?.split(" ")[0] || "Donor",
        middle_name: "",
        last_name: donorName?.split(" ")[1] || "",
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

    // 5. Create a donation record in the DB
    await prisma.donation.create({
      data: {
        pesapalOrderId: orderResponse.order_tracking_id,
        amount,
        currency: "kes",
        tierId: tierId ?? "custom",
        isCustom: isCustom ?? true,
        donorName: donorName || null,
        message: message || null,
        userId: session?.user?.id ?? null,
        donorEmail: session?.user?.email ?? null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ redirect_url: orderResponse.redirect_url });
  } catch (error: any) {
    console.error("Pesapal Donate Initiate Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initiate Pesapal donation" },
      { status: 500 }
    );
  }
}
