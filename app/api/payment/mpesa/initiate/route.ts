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

    // Validate phone number format
    if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // For sandbox, use a small test amount to avoid issues
    const isSandbox = (process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke").includes('sandbox');
    const finalAmount = isSandbox ? Math.min(amount, 10) : amount; // Max 10 KES for sandbox

    console.log("M-Pesa STK Push Details:", {
      phone: phone,
      formattedPhone: formattedPhone,
      originalAmount: amount,
      finalAmount: finalAmount,
      isSandbox: isSandbox,
      shortcode: process.env.MPESA_SHORTCODE,
      callbackUrl: process.env.MPESA_CALLBACK_URL,
      baseUrl: process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke"
    });

    const passkey = process.env.MPESA_PASSKEY!;
    const shortcode = process.env.MPESA_SHORTCODE!;
    const callbackUrl = process.env.MPESA_CALLBACK_URL!;

    if (!passkey || !shortcode || !callbackUrl) {
      console.error("Missing M-Pesa configuration");
      return NextResponse.json({ error: "M-Pesa not configured" }, { status: 500 });
    }

    // Check if callback URL is accessible (important for M-Pesa)
    if (callbackUrl.includes('localhost') || callbackUrl.includes('127.0.0.1')) {
      console.warn("WARNING: Callback URL points to localhost. M-Pesa requires a publicly accessible URL.");
      console.warn("For development, consider using ngrok or similar tunneling service.");
    }

    const token = await getMpesaToken();
    const timestamp = generateTimestamp();
    const password = generateMpesaPassword(shortcode, passkey, timestamp);

    const stkPayload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: finalAmount,
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: "Athlete Entry Fee",
      TransactionDesc: `Payment for Athlete dashboard access - ${finalAmount} KES`,
    };

    console.log("STK Payload:", JSON.stringify(stkPayload, null, 2));

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
    console.log("M-Pesa STK Push Response:", JSON.stringify(mpesaResponse, null, 2));

    // Check for various response codes
    if (mpesaResponse.ResponseCode !== "0") {
      console.error("M-Pesa STK Push Error:", mpesaResponse);
      return NextResponse.json(
        { error: mpesaResponse.errorMessage || `M-Pesa Error: ${mpesaResponse.ResponseDescription || 'Unknown error'}` },
        { status: 400 }
      );
    }

    // Even with ResponseCode 0, check if there are other indicators of failure
    if (mpesaResponse.ResponseDescription && mpesaResponse.ResponseDescription.toLowerCase().includes('error')) {
      console.error("M-Pesa Response indicates error:", mpesaResponse);
      return NextResponse.json(
        { error: mpesaResponse.ResponseDescription },
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
