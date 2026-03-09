import { NextRequest, NextResponse } from 'next/server'
import { generateAccessToken, PAYPAL_API_BASE } from '@/lib/paypal'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

const captureOrderSchema = z.object({
  orderID: z.string(),
  amount: z.number().int(), // in cents
  tierId: z.string().optional(),
  isCustom: z.boolean().optional(),
  donorName: z.string().optional(),
  message: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = captureOrderSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const { orderID, amount, tierId, isCustom, donorName, message } = parsed.data
    const session = await auth()

    const accessToken = await generateAccessToken()
    const url = `${PAYPAL_API_BASE}/v2/checkout/orders/${orderID}/capture`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('PayPal capture error:', data)
      return NextResponse.json({ error: 'Failed to capture payment' }, { status: 500 })
    }

    if (data.status === 'COMPLETED') {
        const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
        const status = capture?.status;

        if (status === 'COMPLETED') {
            const payerEmail = data.payer?.email_address;

            // Avoid recording if already saved (webhook vs client capture race cond)
            const existingDonation = await prisma.donation.findUnique({
              where: { paypalOrderId: orderID }
            });

            if (!existingDonation) {
                await prisma.donation.create({
                  data: {
                    paypalOrderId: orderID,
                    amount: amount,
                    currency: 'usd',
                    tierId: tierId ?? 'custom',
                    isCustom: isCustom ?? false,
                    donorName: donorName || session?.user?.name || null,
                    donorEmail: payerEmail || session?.user?.email || null,
                    message: message || null,
                    userId: session?.user?.id || null,
                    status: 'PAID',
                    paidAt: new Date(),
                  }
                });
            }

            return NextResponse.json({ success: true, orderID })
        }
    }

    return NextResponse.json({ error: 'Payment not completed or pending' }, { status: 400 })
  } catch (err: any) {
    console.error('Capture Order Error:', err)
    return NextResponse.json({ error: 'Failed to capture payment.' }, { status: 500 })
  }
}
