import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPesapalToken, registerIPN, submitOrder } from "@/lib/pesapal";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { usdToKes } from "@/lib/donations/exchange";

const bodySchema = z.object({
  /** Donation in USD (same as UI); order and DB use converted KES */
  amountUsd: z.number().positive().min(1),
  tierId: z.string().optional(),
  isCustom: z.boolean().optional(),
  donorName: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }
    const { amountUsd, tierId, isCustom, donorName, message } = parsed.data;

    const session = await auth();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const amountKes = usdToKes(amountUsd);

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
        amount: amountKes,
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
