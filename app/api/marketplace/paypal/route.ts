import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { createPayPalCheckoutOrder } from '@/lib/paypal'
import { createMarketplaceOrderFromCart } from '@/lib/marketplace/create-marketplace-order'
import { PAYPAL_MARKETPLACE_SURCHARGE_KES } from '@/lib/paypal-pricing'
import { PaymentProvider, PaymentPurpose, PaymentStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be logged in to checkout' }, { status: 401 })
    }

    const { items, shippingAddress } = await req.json()

    let order
    let totalAmount: number

    try {
      const created = await createMarketplaceOrderFromCart({
        userId: session.user.id,
        items,
        shippingAddress,
        paymentMethod: 'PAYPAL',
      })
      order = created.order
      totalAmount = created.totalAmount
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid checkout'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const chargeAmount = totalAmount + PAYPAL_MARKETPLACE_SURCHARGE_KES

    try {
      await prisma.order.update({
        where: { id: order.id },
        data: { totalAmount: chargeAmount },
      })

      const paypal = await createPayPalCheckoutOrder({
        amountKes: chargeAmount,
        description: 'AthletiQ Marketplace Order',
        customId: order.id,
      })

      await prisma.payment.create({
        data: {
          userId: session.user.id,
          amount: Math.round(chargeAmount),
          currency: 'KES',
          provider: PaymentProvider.PAYPAL,
          status: PaymentStatus.PENDING,
          purpose: PaymentPurpose.MARKETPLACE_PURCHASE,
          referenceId: paypal.id,
          merchantReference: order.id,
        },
      })

      return NextResponse.json({
        id: paypal.id,
        orderId: order.id,
      })
    } catch (paypalErr) {
      await prisma.order.delete({ where: { id: order.id } }).catch(() => {})
      console.error('PayPal marketplace order failed:', paypalErr)
      return NextResponse.json(
        { error: 'Could not start PayPal checkout. Try again or use M-Pesa.' },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    console.error('Marketplace PayPal Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
