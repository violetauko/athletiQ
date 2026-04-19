import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createPayPalCheckoutOrder } from '@/lib/paypal'
import { PAYPAL_REGISTRATION_FEE_KES } from '@/lib/paypal-pricing'
import { PaymentProvider, PaymentPurpose, PaymentStatus } from '@prisma/client'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.hasPaidFee) {
      return NextResponse.json({ error: 'Fee already paid' }, { status: 400 })
    }

    const amountKes = PAYPAL_REGISTRATION_FEE_KES

    const paypal = await createPayPalCheckoutOrder({
      amountKes,
      description: 'AthletiQ Athlete Registration Fee',
      customId: session.user.id,
    })

    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: Math.round(amountKes),
        currency: 'KES',
        provider: PaymentProvider.PAYPAL,
        status: PaymentStatus.PENDING,
        purpose: PaymentPurpose.REGISTRATION_FEE,
        referenceId: paypal.id,
      },
    })

    return NextResponse.json({ id: paypal.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message === 'MISSING_API_CREDENTIALS' || message === 'PAYPAL_CREATE_FAILED') {
      return NextResponse.json(
        { error: 'PayPal is not configured or order creation failed.' },
        { status: 500 }
      )
    }
    console.error('PayPal create-order (fee):', err)
    return NextResponse.json({ error: 'Failed to initiate PayPal checkout.' }, { status: 500 })
  }
}
