import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { finalizeSuccessfulPayment } from '@/lib/payment/finalize-successful-payment'
import { notifyPartnerizeConversion } from '@/lib/partnerize'
import { PaymentStatus } from '@prisma/client'
import { z } from 'zod'
import { PaymentProvider } from '@/lib/types/types'

const bodySchema = z.object({
  receiptNumber: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({ where: { id } })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (payment.provider !== 'WISE' as PaymentProvider) {
      return NextResponse.json({ error: 'Only Wise pending payments can be confirmed here.' }, { status: 400 })
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return NextResponse.json({ error: 'Payment is not pending.' }, { status: 400 })
    }

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
          receiptNumber: parsed.data.receiptNumber ?? `wise-admin-${session.user.id}`,
        }
      )
    })

    await notifyPartnerizeConversion({
      camref: payment.affiliateClickRef,
      conversionReference: payment.id,
      value: payment.amount,
      currency: payment.currency,
    })


    return NextResponse.json({ success: true, paymentId: payment.id })
  } catch (e: unknown) {
    console.error('confirm-wise:', e)
    return NextResponse.json({ error: 'Failed to confirm payment' }, { status: 500 })
  }
}
