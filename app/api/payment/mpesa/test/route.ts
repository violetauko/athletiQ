import { NextRequest, NextResponse } from "next/server";
import { testMpesaConnection, formatPhoneNumber } from "@/lib/mpesa";

export async function GET(req: NextRequest) {
  try {
    // Test M-Pesa connection
    const connectionTest = await testMpesaConnection();

    // Test phone number formatting
    const testPhones = [
      "0712345678",
      "+254712345678",
      "254712345678",
      "712345678"
    ];

    const formattedPhones = testPhones.map(phone => ({
      input: phone,
      output: formatPhoneNumber(phone)
    }));

    // Check environment variables (without exposing secrets)
    const envCheck = {
      hasConsumerKey: !!process.env.MPESA_CONSUMER_KEY,
      hasConsumerSecret: !!process.env.MPESA_CONSUMER_SECRET,
      hasPasskey: !!process.env.MPESA_PASSKEY,
      hasShortcode: !!process.env.MPESA_SHORTCODE,
      hasCallbackUrl: !!process.env.MPESA_CALLBACK_URL,
      baseUrl: process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke",
      callbackUrl: process.env.MPESA_CALLBACK_URL,
      isSandbox: (process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke").includes('sandbox')
    };

    return NextResponse.json({
      connectionTest,
      phoneFormatting: formattedPhones,
      environment: envCheck,
      recommendations: [
        "For sandbox testing, use small amounts (1-100 KES)",
        "Phone numbers must be in format: 254XXXXXXXXX",
        "Callback URL must be publicly accessible (not localhost)",
        "Ensure M-Pesa credentials are correctly configured",
        "Check that the shortcode is registered for STK Push"
      ]
    });

  } catch (error) {
    console.error("M-Pesa test error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}