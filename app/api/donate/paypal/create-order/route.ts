import { NextRequest, NextResponse } from 'next/server'
import { generateAccessToken, PAYPAL_API_BASE } from '@/lib/paypal'
import { z } from 'zod'

const createOrderSchema = z.object({
  amount: z.number().int().min(100).max(1000000), // in cents
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = createOrderSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.format() }, { status: 400 })
    }

    const { amount } = parsed.data
    const dollars = (amount / 100).toFixed(2)

    const accessToken = await generateAccessToken()

    const url = `${PAYPAL_API_BASE}/v2/checkout/orders`
    const payload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: dollars,
          },
          description: 'AthletiQ Donation'
        },
      ],
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('PayPal create order failed:', data)
      throw new Error('Failed to create PayPal order')
    }

    return NextResponse.json({ id: data.id })
  } catch (err: any) {
    if (err.message === 'MISSING_API_CREDENTIALS') {
      return NextResponse.json({ error: 'PayPal is not configured securely.' }, { status: 500 })
    }
    console.error('Create Order Error:', err)
    return NextResponse.json({ error: 'Failed to initiate payment.' }, { status: 500 })
  }
}
