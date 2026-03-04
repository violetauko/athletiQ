import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { formatPhoneNumber } from "@/lib/mpesa"; // Reuse phone formatting
import { getStanbicToken, generateStanbicReferenceId } from "@/lib/stanbic";

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

    // Stanbic API uses 2547XXXXXXXX
    const formattedPhone = formatPhoneNumber(phone);
    const amountStr = process.env.NEXT_PUBLIC_ENTRY_FEE_AMOUNT || "1000";
    
    // Convert to a string with decimal places. e.g "1000.00"
    const amount = Number(amountStr).toFixed(2);

    const billAccountRef = process.env.STANBIC_BILL_ACCOUNT_REF;
    if (!billAccountRef) {
      return NextResponse.json({ error: "Server Configuration Error: Missing Stanbic Account Ref" }, { status: 500 });
    }

    const referenceId = generateStanbicReferenceId();
    const token = await getStanbicToken();

    const payload = {
      dbsReferenceId: referenceId,
      billAccountRef: billAccountRef,
      amount: amount,
      mobileNumber: formattedPhone,
    };

    const response = await fetch(
      "https://sandbox.connect.stanbicbank.co.ke/api/sandbox/mpesa-checkout",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    // From the Swagger response:
    // Success looks like: { "status": "Success", "statusMessage": "Request processed successfully" }
    // Failed looks like: { "responseCode": "2001", "responseMessage": "Detailed reason" }
    if (!response.ok || data.status !== "Success") {
      console.error("Stanbic M-Pesa Push Error:", data);
      return NextResponse.json(
        { error: data.responseMessage || data.statusMessage || "Failed to initiate Stanbic Push" },
        { status: 400 }
      );
    }

    // Create a pending payment record
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: Number(amountStr),
        currency: "KES",
        provider: PaymentProvider.STANBIC_MPESA,
        status: PaymentStatus.PENDING,
        referenceId: data.dbsReferenceId || referenceId,
      },
    });

    return NextResponse.json({ 
      success: true, 
      dbsReferenceId: data.dbsReferenceId || referenceId 
    });

  } catch (error) {
    console.error("Stanbic Initiate Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
