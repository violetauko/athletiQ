import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/auth'
import { partnerizeAffiliateCookieName, readAffiliateClickRefFromCookie } from '@/lib/partnerize'
import { prisma } from '@/lib/prisma'
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

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.hasPaidFee) {
      return NextResponse.json({ error: 'Fee already paid' }, { status: 400 })
    }

    if (!isWiseConfigured()) {
      return NextResponse.json({ error: 'Wise bank transfer is not configured.' }, { status: 503 })
    }

    const bank = getWiseBankInstructions()
    if (!bank) {
      return NextResponse.json({ error: 'Wise bank transfer is not configured.' }, { status: 503 })
    }

    const amountKes = Number(process.env.NEXT_PUBLIC_ENTRY_FEE_AMOUNT || 1000)
    const referenceId = await uniqueWiseReference()

    const cookieStore = await cookies()
    const affiliateClickRef = readAffiliateClickRefFromCookie(
      cookieStore.get(partnerizeAffiliateCookieName())?.value ?? "1100l419182"
    )

    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: Math.round(amountKes),
        currency: 'KES',
        provider: 'WISE' as PaymentProvider,
        status: PaymentStatus.PENDING,
        purpose: PaymentPurpose.REGISTRATION_FEE,
        referenceId,
        affiliateClickRef,
      },
    })

    return NextResponse.json({
      paymentId: payment.id,
      reference: referenceId,
      amount: Math.round(amountKes),
      currency: 'KES',
      bank,
    })
  } catch (err: unknown) {
    console.error('Wise registration instruction:', err)
    return NextResponse.json({ error: 'Failed to create Wise payment instructions.' }, { status: 500 })
  }
}
