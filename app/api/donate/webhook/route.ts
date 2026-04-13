import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email/email-service'
import { usdToKes } from '@/lib/donations/exchange'

/**
 * Stripe Webhook Handler
 *
 * Required env vars:
 *   STRIPE_WEBHOOK_SECRET  — from `stripe listen --forward-to ...` or Stripe Dashboard
 *
 * Register this endpoint in your Stripe Dashboard:
 *   Endpoint URL: https://yourdomain.com/api/donate/webhook
 *   Events to listen for:
 *     - checkout.session.completed
 *     - payment_intent.payment_failed
 */

// export const runtime = 'nodejs' // must be nodejs (not edge) for rawBody

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[WEBHOOK] Missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[WEBHOOK] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status === 'paid') {
          await handleDonationSuccess(session)
        }
        break
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleDonationSuccess(session)
        break
      }

      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.warn('[WEBHOOK] Async payment failed for session:', session.id)
        // TODO: notify user, log to DB
        break
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        console.warn('[WEBHOOK] Payment intent failed:', intent.id)
        break
      }

      default:
        // Unhandled event type — safe to ignore
        break
    }
  } catch (err) {
    console.error('[WEBHOOK] Handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function handleDonationSuccess(session: Stripe.Checkout.Session) {
  const {
    tierId,
    donorName,
    message,
    userId,
    userEmail,
  } = session.metadata ?? {}

  const amountCents = session.amount_total ?? 0
  const amountUsd = (amountCents / 100)
  const amountDollars = amountUsd.toFixed(2)
  const amountKes = usdToKes(amountUsd)

  console.log(`[DONATION] ✅ $${amountDollars} (≈ KSh ${amountKes}) from ${donorName || userEmail || 'Anonymous'}`)

  /**
   * ─── TODO: Persist to your database ──────────────────────────────────────
   *
   Example with Prisma:
   */
   await prisma.donation.upsert({
      where: { stripeSessionId: session.id },
      update: {
        status: 'PAID',
        paidAt: new Date(),
        stripePaymentId: session.payment_intent as string,
        amount: amountKes,
        currency: 'kes',
      },
      create: {
        stripeSessionId: session.id,
        stripePaymentId: session.payment_intent as string ?? null,
        amount: amountKes,
        currency: 'kes',
        tierId: session.metadata?.tierId ?? 'custom',
        isCustom: session.metadata?.tierId === 'custom',
        donorName: session.metadata?.donorName || null,
        donorEmail: session.customer_email || null,
        message: session.metadata?.message || null,
        userId: session.metadata?.userId !== 'anonymous' ? session.metadata?.userId : null,
        status: 'PAID',
        paidAt: new Date(),
      },
    })
   
   await sendEmail({
    to: userEmail || '',
    subject: `Thank you for your $${amountDollars} donation! 🏆`,
    template: 'donation-confirmation',
    data: {
      donorName: donorName || 'Anonymous',
      amount: amountDollars,
      tierId: 'gold',
      donationDate: new Date(),
    },
  });
   
   
}
