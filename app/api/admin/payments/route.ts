// app/api/admin/payments/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import type { Donation, Payment, User } from '@prisma/client'
import { PaymentPurpose } from '@prisma/client'
import { inferDonationProvider, mapAdminStatusToDonationStatus } from '@/lib/admin/admin-ledger'
import type { Prisma } from '@prisma/client'
import { PaymentProvider } from '@/lib/types/types'

type DonationWithUser = Donation & { user: User | null }

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const status = searchParams.get('status')
    const provider = searchParams.get('provider')
    const search = searchParams.get('search')
    const dateRange = searchParams.get('dateRange')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const paymentType = searchParams.get('paymentType') || 'ALL'

    const dateFilter = buildDateFilter(dateRange, startDate, endDate)

    if (paymentType === 'donation') {
      const donationWhere = buildDonationWhere({ status, provider, search, dateFilter })
      const [donations, totalCount] = await Promise.all([
        prisma.donation.findMany({
          where: donationWhere,
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.donation.count({ where: donationWhere }),
      ])
      const items = donations.map((d) => mapDonationLedgerItem(d))
      const totalPages = Math.ceil(totalCount / limit) || 1

      return NextResponse.json({
        items,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: emptyPaymentStats(),
      })
    }

    if (paymentType === 'purchase' || paymentType === 'fee') {
      const paymentWhere = buildPaymentWhere({
        status,
        provider,
        search,
        dateFilter,
        kind: paymentType,
      })
      const [payments, totalCount] = await Promise.all([
        prisma.payment.findMany({
          where: paymentWhere,
          include: { user: true },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.payment.count({ where: paymentWhere }),
      ])
      const items = payments.map(mapPaymentLedgerItem)
      const totalPages = Math.ceil(totalCount / limit) || 1
      const stats = await getPaymentStats(paymentWhere)

      return NextResponse.json({
        items,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats,
      })
    }

    // ALL: merge payments + donations by date
    const paymentWhere = buildPaymentWhere({
      status,
      provider,
      search,
      dateFilter,
      kind: 'all',
    })
    const donationWhere = buildDonationWhere({ status, provider, search, dateFilter })

    const [paymentsLight, donationsLight] = await Promise.all([
      prisma.payment.findMany({
        where: paymentWhere,
        select: { id: true, createdAt: true },
      }),
      prisma.donation.findMany({
        where: donationWhere,
        select: { id: true, createdAt: true },
      }),
    ])

    const combined = [
      ...paymentsLight.map((p) => ({
        id: p.id,
        createdAt: p.createdAt,
        kind: 'payment' as const,
      })),
      ...donationsLight.map((d) => ({
        id: d.id,
        createdAt: d.createdAt,
        kind: 'donation' as const,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    const totalCount = combined.length
    const pageSlice = combined.slice(skip, skip + limit)

    const paymentIds = pageSlice.filter((x) => x.kind === 'payment').map((x) => x.id)
    const donationIds = pageSlice.filter((x) => x.kind === 'donation').map((x) => x.id)

    const [paymentsFull, donationsFull] = await Promise.all([
      paymentIds.length
        ? prisma.payment.findMany({
            where: { id: { in: paymentIds } },
            include: { user: true },
          })
        : [],
      donationIds.length
        ? prisma.donation.findMany({
            where: { id: { in: donationIds } },
            include: { user: true },
          })
        : [],
    ])

    const payMap = new Map(paymentsFull.map((p) => [p.id, p]))
    const donMap = new Map(donationsFull.map((d) => [d.id, d]))

    const items = pageSlice.map((row) => {
      if (row.kind === 'payment') {
        const p = payMap.get(row.id)
        if (!p) throw new Error('Missing payment row')
        return mapPaymentLedgerItem(p)
      }
      const d = donMap.get(row.id)
      if (!d) throw new Error('Missing donation row')
      return mapDonationLedgerItem(d)
    })

    const totalPages = Math.ceil(totalCount / limit) || 1
    const stats = await getPaymentStats(paymentWhere)

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats,
    })
  } catch (error) {
    console.error('Error fetching payments:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

function buildDateFilter(
  dateRange: string | null,
  startDate: string | null,
  endDate: string | null
): Record<string, Date> | undefined {
  let dateFilter: Record<string, Date> = {}
  const now = new Date()

  if (dateRange) {
    switch (dateRange) {
      case 'today':
        dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) }
        break
      case 'week':
        dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) }
        break
      case 'month':
        dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) }
        break
      case 'custom':
        if (startDate) dateFilter.gte = new Date(startDate)
        if (endDate) dateFilter.lte = new Date(endDate)
        break
    }
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : undefined
}

function buildPaymentWhere(args: {
  status: string | null
  provider: string | null
  search: string | null
  dateFilter: Record<string, Date> | undefined
  kind: 'purchase' | 'fee' | 'all'
}): Prisma.PaymentWhereInput {
  const where: Prisma.PaymentWhereInput = {}

  if (args.kind === 'purchase') {
    where.purpose = PaymentPurpose.MARKETPLACE_PURCHASE
  } else if (args.kind === 'fee') {
    where.purpose = PaymentPurpose.REGISTRATION_FEE
  }

  if (args.status && args.status !== 'ALL') {
    where.status = args.status as Payment['status']
  }

  if (args.provider && args.provider !== 'ALL') {
    where.provider = args.provider as Payment['provider']
  }

  if (args.search) {
    where.OR = [
      { id: { contains: args.search, mode: 'insensitive' } },
      { referenceId: { contains: args.search, mode: 'insensitive' } },
      { receiptNumber: { contains: args.search, mode: 'insensitive' } },
      { merchantReference: { contains: args.search, mode: 'insensitive' } },
      {
        user: {
          OR: [
            { email: { contains: args.search, mode: 'insensitive' } },
            { name: { contains: args.search, mode: 'insensitive' } },
          ],
        },
      },
    ]
  }

  if (args.dateFilter) {
    where.createdAt = args.dateFilter
  }

  return where
}

function buildDonationWhere(args: {
  status: string | null
  provider: string | null
  search: string | null
  dateFilter: Record<string, Date> | undefined
}): Prisma.DonationWhereInput {
  const parts: Prisma.DonationWhereInput[] = []

  const ds = mapAdminStatusToDonationStatus(args.status)
  if (ds) {
    parts.push({ status: ds })
  }

  if (args.provider && args.provider !== 'ALL') {
    const p = args.provider as Payment['provider']
    if (p === 'STRIPE') {
      parts.push({
        OR: [{ stripeSessionId: { not: null } }, { stripePaymentId: { not: null } }],
      })
    } else if (p === 'PAYPAL') {
      parts.push({ paypalOrderId: { not: null } })
    } else if (p === 'PESAPAL') {
      parts.push({ pesapalOrderId: { not: null } })
    } else if (p === 'WISE' as PaymentProvider) {
      parts.push({ id: { in: [] } })
    } else {
      parts.push({ id: { in: [] } })
    }
  }

  if (args.search) {
    parts.push({
      OR: [
        { id: { contains: args.search, mode: 'insensitive' } },
        { donorEmail: { contains: args.search, mode: 'insensitive' } },
        { donorName: { contains: args.search, mode: 'insensitive' } },
        { message: { contains: args.search, mode: 'insensitive' } },
        { paypalOrderId: { contains: args.search, mode: 'insensitive' } },
        { pesapalOrderId: { contains: args.search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { email: { contains: args.search, mode: 'insensitive' } },
              { name: { contains: args.search, mode: 'insensitive' } },
            ],
          },
        },
      ],
    })
  }

  if (args.dateFilter) {
    parts.push({ createdAt: args.dateFilter })
  }

  if (parts.length === 0) return {}
  if (parts.length === 1) return parts[0]!
  return { AND: parts }
}

function mapPaymentLedgerItem(p: Payment & { user: User | null }) {
  const isPurchase = p.purpose === PaymentPurpose.MARKETPLACE_PURCHASE
  return {
    ...p,
    source: 'payment' as const,
    paymentType: (isPurchase ? 'purchase' : 'fee') as 'purchase' | 'fee',
  }
}

function mapDonationLedgerItem(d: DonationWithUser) {
  const displayUser =
    d.user ??
    (d.donorEmail
      ? {
          id: d.userId ?? '',
          name: d.donorName ?? undefined,
          email: d.donorEmail,
        }
      : undefined)

  return {
    source: 'donation' as const,
    paymentType: 'donation' as const,
    id: d.id,
    amount: d.amount,
    currency: d.currency,
    provider: inferDonationProvider(d),
    status: d.status,
    referenceId: d.stripeSessionId ?? d.paypalOrderId ?? d.pesapalOrderId ?? undefined,
    userId: d.userId ?? undefined,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    tierId: d.tierId,
    isCustom: d.isCustom,
    donorName: d.donorName,
    donorEmail: d.donorEmail,
    message: d.message,
    stripeSessionId: d.stripeSessionId,
    stripePaymentId: d.stripePaymentId,
    paypalOrderId: d.paypalOrderId,
    pesapalOrderId: d.pesapalOrderId,
    paidAt: d.paidAt,
    user: displayUser,
  }
}

function emptyPaymentStats() {
  return {
    totalAmount: 0,
    byStatus: {},
    byProvider: {},
    byCurrency: {},
    dailyStats: [] as { date: string; count: number; total: number }[],
  }
}

async function getPaymentStats(whereClause: Prisma.PaymentWhereInput | undefined) {
  const baseWhere = whereClause ?? {}

  const [totalAmount, statusCounts, providerCounts, currencyCounts, dailyStats] = await Promise.all([
    prisma.payment.aggregate({
      where: baseWhere,
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['status'],
      where: baseWhere,
      _count: true,
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['provider'],
      where: baseWhere,
      _count: true,
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['currency'],
      where: baseWhere,
      _count: true,
      _sum: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        ...baseWhere,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
      _count: true,
      _sum: { amount: true },
    }),
  ])

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const dailyStatsMap = new Map<string, { count: number; total: number }>()
  dailyStats.forEach((stat) => {
    const date = stat.createdAt.toISOString().split('T')[0]
    if (!dailyStatsMap.has(date)) {
      dailyStatsMap.set(date, { count: 0, total: 0 })
    }
    const current = dailyStatsMap.get(date)!
    current.count += stat._count
    current.total += stat._sum.amount || 0
  })

  const processedDailyStats = last30Days.map((date) => ({
    date,
    count: dailyStatsMap.get(date)?.count || 0,
    total: dailyStatsMap.get(date)?.total || 0,
  }))

  return {
    totalAmount: totalAmount._sum.amount || 0,
    byStatus: statusCounts.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.status]: {
          count: curr._count,
          total: curr._sum.amount || 0,
        },
      }),
      {}
    ),
    byProvider: providerCounts.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.provider]: {
          count: curr._count,
          total: curr._sum.amount || 0,
        },
      }),
      {}
    ),
    byCurrency: currencyCounts.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.currency]: {
          count: curr._count,
          total: curr._sum.amount || 0,
        },
      }),
      {}
    ),
    dailyStats: processedDailyStats,
  }
}
