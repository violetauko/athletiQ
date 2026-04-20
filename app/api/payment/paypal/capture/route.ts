import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { generateAccessToken, PAYPAL_API_BASE, parseKesFromPayPalCapture } from '@/lib/paypal'
import { PaymentPurpose, PaymentProvider, PaymentStatus } from '@prisma/client'
import { finalizeSuccessfulPayment } from '@/lib/payment/finalize-successful-payment'
import { z } from 'zod'

const captureSchema = z.object({
  orderID: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = captureSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const { orderID } = parsed.data
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingDone = await prisma.payment.findFirst({
      where: {
        referenceId: orderID,
        provider: PaymentProvider.PAYPAL,
        status: PaymentStatus.COMPLETED,
      },
    })
    if (existingDone) {
      if (existingDone.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      return NextResponse.json({ success: true, orderID, alreadyCompleted: true })
    }

    const payment = await prisma.payment.findFirst({
      where: {
        referenceId: orderID,
        provider: PaymentProvider.PAYPAL,
        NOT: { status: PaymentStatus.COMPLETED },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      })
      if (
        payment.purpose === PaymentPurpose.MARKETPLACE_PURCHASE &&
        payment.merchantReference
      ) {
        await prisma.order.updateMany({
          where: {
            id: payment.merchantReference,
            status: 'PENDING',
          },
          data: { status: 'CANCELLED' },
        })
      }
      return NextResponse.json({ error: 'Failed to capture payment' }, { status: 500 })
    }

    if (data.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const capture = data.purchase_units?.[0]?.payments?.captures?.[0]
    if (capture?.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Capture not completed' }, { status: 400 })
    }

    const receiptNumber = typeof capture?.id === 'string' ? capture.id : undefined
    const amountFromPayPal = parseKesFromPayPalCapture(data)

    await prisma.$transaction(async (tx) => {
      await finalizeSuccessfulPayment(
        tx,
        {
          id: payment.id,
          userId: payment.userId,
          purpose: payment.purpose,
          merchantReference: payment.merchantReference,
        },
        {
          receiptNumber: receiptNumber ?? undefined,
          ...(amountFromPayPal != null ? { amount: Math.round(amountFromPayPal) } : {}),
        }
      )
    })

    return NextResponse.json({ success: true, orderID })
  } catch (err: unknown) {
    console.error('PayPal capture:', err)
    return NextResponse.json({ error: 'Failed to capture payment.' }, { status: 500 })
  }
}
