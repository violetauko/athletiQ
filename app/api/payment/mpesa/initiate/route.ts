import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getMpesaToken, generateTimestamp, generateMpesaPassword, formatPhoneNumber } from "@/lib/mpesa";
import { PaymentProvider, PaymentStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.hasPaidFee) {
      return NextResponse.json({ error: "Fee already paid" }, { status: 400 });
    }

    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const formattedPhone = formatPhoneNumber(phone);
    const amount = Number(process.env.NEXT_PUBLIC_ENTRY_FEE_AMOUNT || 1000);

    const passkey = process.env.MPESA_PASSKEY!;
    const shortcode = process.env.MPESA_SHORTCODE!;
    const callbackUrl = process.env.MPESA_CALLBACK_URL!;

    const token = await getMpesaToken();
    const timestamp = generateTimestamp();
    const password = generateMpesaPassword(shortcode, passkey, timestamp);

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount, // M-Pesa sandbox accepts small amounts, adjust if needed
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: "Athlete Entry Fee",
      TransactionDesc: "Payment for Athlete dashboard access",
    };

    const response = await fetch(
      `${process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke"}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const mpesaResponse = await response.json();
    console.log("M-Pesa STK Push Response:", mpesaResponse);

    if (mpesaResponse.ResponseCode !== "0") {
      console.error("M-Pesa STK Push Error:", mpesaResponse);
      return NextResponse.json(
        { error: mpesaResponse.errorMessage || "Failed to initiate STK Push" },
        { status: 400 }
      );
    }

    // Create a pending payment record
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: amount,
        currency: "KES",
        provider: PaymentProvider.MPESA,
        status: PaymentStatus.PENDING,
        referenceId: mpesaResponse.CheckoutRequestID,
      },
    });

    return NextResponse.json({ 
      success: true, 
      CheckoutRequestID: mpesaResponse.CheckoutRequestID 
    });

  } catch (error) {
    console.error("STK Initiate Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
