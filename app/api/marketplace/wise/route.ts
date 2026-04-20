import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { partnerizeAffiliateCookieName, readAffiliateClickRefFromCookie } from '@/lib/partnerize'
import { createMarketplaceOrderFromCart } from '@/lib/marketplace/create-marketplace-order'
import { generateWisePaymentReference, getWiseBankInstructions, isWiseConfigured } from '@/lib/wise'
import { PaymentProvider, PaymentPurpose, PaymentStatus } from '@prisma/client'

async function uniqueWiseReference(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const ref = generateWisePaymentReference()
    const clash = await prisma.payment.findFirst({ where: { referenceId: ref }, select: { id: true } })
    if (!clash) return ref
  }
  throw new Error('Could not allocate payment reference')
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be logged in to checkout' }, { status: 401 })
    }

    if (!isWiseConfigured()) {
      return NextResponse.json({ error: 'Wise bank transfer is not configured.' }, { status: 503 })
    }

    const bank = getWiseBankInstructions()
    if (!bank) {
      return NextResponse.json({ error: 'Wise bank transfer is not configured.' }, { status: 503 })
    }

    const { items, shippingAddress } = await req.json()

    let order
    let totalAmount: number

    try {
      const created = await createMarketplaceOrderFromCart({
        userId: session.user.id,
        items,
        shippingAddress,
        paymentMethod: 'WISE',
      })
      order = created.order
      totalAmount = created.totalAmount
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid checkout'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const referenceId = await uniqueWiseReference()

    const cookieStore = await cookies()
    const affiliateClickRef = readAffiliateClickRefFromCookie(
      cookieStore.get(partnerizeAffiliateCookieName())?.value
    )

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: Math.round(totalAmount),
        currency: 'KES',
        provider: 'WISE' as PaymentProvider,
        status: PaymentStatus.PENDING,
        purpose: PaymentPurpose.MARKETPLACE_PURCHASE,
        referenceId,
        merchantReference: order.id,
        affiliateClickRef,
      },
    })

    return NextResponse.json({
      paymentId: payment.id,
      orderId: order.id,
      reference: referenceId,
      amount: Math.round(totalAmount),
      currency: 'KES',
      bank,
    })
  } catch (error: unknown) {
    console.error('Marketplace Wise Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
