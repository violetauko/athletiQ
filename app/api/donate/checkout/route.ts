import { NextRequest, NextResponse } from 'next/server'
import { stripe, DONATION_TIERS } from '@/lib/stripe'
import { z } from 'zod'
import { auth } from '@/auth'

const donationSchema = z.object({
  amount: z.number().int().min(100).max(1000000), // $1 - $10,000
  tierId: z.string().optional(),
  isCustom: z.boolean().optional(),
  donorName: z.string().min(1).max(100).optional(),
  message: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = donationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid donation data', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { amount, tierId, donorName, message } = parsed.data
    const session = await auth()

    // Build tier label for display
    const tier = DONATION_TIERS.find((t) => t.id === tierId)
    const tierLabel = tier ? `${tier.emoji} ${tier.label}` : '❤️ Custom Donation'

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? req.nextUrl.origin

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      submit_type: 'donate',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AthletiQ Donation — ${tierLabel}`,
              description: tier?.description ?? 'Supporting the next generation of athletes',
              images: [`${baseUrl}/og-donate.png`], // add your OG image
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        tierId: tierId ?? 'custom',
        donorName: donorName ?? '',
        message: message ?? '',
        userId: session?.user?.id ?? 'anonymous',
        userEmail: session?.user?.email ?? '',
      },
      customer_email: session?.user?.email ?? undefined,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      success_url: `${baseUrl}/donate/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/donate?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id })
  } catch (error) {
    console.error('[DONATION_CHECKOUT]', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
