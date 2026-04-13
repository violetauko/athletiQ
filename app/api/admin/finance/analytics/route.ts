// app/api/admin/finance/analytics/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { DonationStatus, PaymentPurpose, PaymentStatus } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    let previousStartDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        previousStartDate = new Date(now.setDate(now.getDate() - 14))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        previousStartDate = new Date(now.setMonth(now.getMonth() - 2))
        break
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        previousStartDate = new Date(now.setMonth(now.getMonth() - 6))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        previousStartDate = new Date(now.setFullYear(now.getFullYear() - 2))
        break
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        previousStartDate = new Date(now.setMonth(now.getMonth() - 2))
    }

    // Get current period data
    const [currentDonations, currentOrderPayments, currentFeePayments, uniqueDonors] = await Promise.all([
      prisma.donation.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: DonationStatus.PAID
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.aggregate({
        where: {
          updatedAt: { gte: startDate },
          status: PaymentStatus.COMPLETED,
          purpose: PaymentPurpose.MARKETPLACE_PURCHASE,
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.aggregate({
        where: {
          updatedAt: { gte: startDate },
          status: PaymentStatus.COMPLETED,
          purpose: PaymentPurpose.REGISTRATION_FEE,
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.donation.findMany({
        where: {
          createdAt: { gte: startDate },
          status: DonationStatus.PAID,
          donorEmail: { not: null }
        },
        distinct: ['donorEmail'],
        select: { donorEmail: true }
      })
    ])

    // Get previous period data for growth calculation
    const [previousDonations, previousOrderPayments, previousFeePayments] = await Promise.all([
      prisma.donation.aggregate({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          },
          status: DonationStatus.PAID
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          updatedAt: {
            gte: previousStartDate,
            lt: startDate
          },
          status: PaymentStatus.COMPLETED,
          purpose: PaymentPurpose.MARKETPLACE_PURCHASE,
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          updatedAt: {
            gte: previousStartDate,
            lt: startDate
          },
          status: PaymentStatus.COMPLETED,
          purpose: PaymentPurpose.REGISTRATION_FEE,
        },
        _sum: { amount: true }
      })
    ])
    const currentDonationSum = currentDonations._sum.amount ? currentDonations._sum.amount : 0
    const currentPurchasesTotal = (currentOrderPayments._sum.amount || 0)
    const purchaseCommission = currentPurchasesTotal * 0.2
    const donationCommission = currentDonationSum * 0.2
    const currentCommissionRevenue = purchaseCommission + donationCommission
    const currentEntryPaymentsRevenue = (currentFeePayments._sum.amount || 0)
    // Total Revenue is what the platform keeps: Commission + 100% of Entry Payments
    const currentTotalRevenue = currentCommissionRevenue + currentEntryPaymentsRevenue

    const previousDonationSum = previousDonations._sum.amount ? previousDonations._sum.amount : 0
    const previousPurchasesTotal = (previousOrderPayments._sum.amount || 0)
    const previousCommissionRevenue = (previousPurchasesTotal * 0.20) + (previousDonationSum * 0.20)
    const previousEntryPaymentsRevenue = (previousFeePayments._sum.amount || 0)
    const previousTotalRevenue = previousCommissionRevenue + previousEntryPaymentsRevenue

    // Calculate growth percentages
    const revenueGrowth = previousTotalRevenue > 0 
      ? ((currentTotalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 
      : 0

    const donationsGrowth = previousDonationSum > 0
      ? ((currentDonationSum - previousDonationSum) / previousDonationSum) * 100
      : 0

    const purchasesGrowth = previousPurchasesTotal > 0
      ? ((currentPurchasesTotal - previousPurchasesTotal) / previousPurchasesTotal) * 100
      : 0

    const commissionGrowth = previousCommissionRevenue > 0
      ? ((currentCommissionRevenue - previousCommissionRevenue) / previousCommissionRevenue) * 100
      : 0

    const entryPaymentsGrowth = previousEntryPaymentsRevenue > 0
      ? ((currentEntryPaymentsRevenue - previousEntryPaymentsRevenue) / previousEntryPaymentsRevenue) * 100
      : 0

    return NextResponse.json({
      totalRevenue: currentTotalRevenue,
      totalDonations: currentDonationSum,
      /** Marketplace order checkout only (merchantReference set); COMPLETED settlement amounts. */
      totalPurchases: currentPurchasesTotal,
      successfulPurchaseCount: currentOrderPayments._count,
      /** Registration / entry fee payments (no order); COMPLETED settlement amounts. */
      totalEntryPayments: currentEntryPaymentsRevenue,
      successfulRegistrationPaymentCount: currentFeePayments._count,
      totalCommission: currentCommissionRevenue,
      purchaseCommission,
      donationCommission,
      uniqueDonors: uniqueDonors.length,
      growth: {
        revenue: Math.round(revenueGrowth),
        donations: Math.round(donationsGrowth * 100) / 100,
        purchases: Math.round(purchasesGrowth * 100) / 100,
        commission: Math.round(commissionGrowth * 100) / 100,
        entryPayments: Math.round(entryPaymentsGrowth * 100) / 100,
      },
      donations: {
        byStatus: await getDonationStatusBreakdown(startDate),
        byTier: await getDonationTierBreakdown(startDate),
        byCurrency: await getDonationCurrencyBreakdown(startDate),
        dailyStats: await getDailyDonationStats(startDate),
      },
      payments: await buildPaymentsAnalytics(startDate),
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Helper functions for analytics
async function getDonationStatusBreakdown(startDate: Date) {
  const breakdown = await prisma.donation.groupBy({
    by: ['status'],
    where: {
      createdAt: { gte: startDate }
    },
    _count: true,
    _sum: {
      amount: true
    }
  })

  return breakdown.reduce((acc, curr) => ({
    ...acc,
    [curr.status]: {
      count: curr._count,
      total: curr._sum.amount || 0
    }
  }), {})
}

async function getDonationTierBreakdown(startDate: Date) {
  const breakdown = await prisma.donation.groupBy({
    by: ['tierId', 'isCustom'],
    where: {
      createdAt: { gte: startDate }
    },
    _count: true,
    _sum: {
      amount: true
    }
  })

  return breakdown.reduce((acc, curr) => ({
    ...acc,
    [`${curr.tierId}${curr.isCustom ? '_custom' : ''}`]: {
      tierId: curr.tierId,
      isCustom: curr.isCustom,
      count: curr._count,
      total: curr._sum.amount || 0
    }
  }), {})
}

async function getDonationCurrencyBreakdown(startDate: Date) {
  const breakdown = await prisma.donation.groupBy({
    by: ['currency'],
    where: {
      createdAt: { gte: startDate }
    },
    _count: true,
    _sum: {
      amount: true
    }
  })

  return breakdown.reduce((acc, curr) => ({
    ...acc,
    [curr.currency]: {
      count: curr._count,
      total: curr._sum.amount || 0
    }
  }), {})
}

async function getDailyDonationStats(startDate: Date) {
  const stats = await prisma.donation.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: startDate }
    },
    _count: true,
    _sum: {
      amount: true
    }
  })

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const statsMap = new Map()
  stats.forEach(stat => {
    const date = stat.createdAt.toISOString().split('T')[0]
    if (!statsMap.has(date)) {
      statsMap.set(date, { count: 0, total: 0 })
    }
    const current = statsMap.get(date)
    current.count += stat._count
    current.total += stat._sum.amount ? stat._sum.amount : 0
  })

  return last30Days.map(date => ({
    date,
    count: statsMap.get(date)?.count || 0,
    total: statsMap.get(date)?.total || 0
  }))
}

/** Marketplace purchases vs registration fees — use Payment.purpose, not merchantReference. */
type PaymentAnalyticsScope = 'marketplaceCheckout' | 'registration'

function paymentScopeWhere(scope: PaymentAnalyticsScope) {
  return scope === 'marketplaceCheckout'
    ? { purpose: PaymentPurpose.MARKETPLACE_PURCHASE }
    : { purpose: PaymentPurpose.REGISTRATION_FEE }
}

async function buildPaymentsAnalytics(startDate: Date) {
  const [
    mcStatus,
    mcProv,
    mcCur,
    mcDaily,
    regStatus,
    regProv,
    regCur,
    regDaily,
  ] = await Promise.all([
    getPaymentStatusBreakdown(startDate, 'marketplaceCheckout'),
    getPaymentProviderCompletion(startDate, 'marketplaceCheckout'),
    getPaymentCurrencyBreakdown(startDate, 'marketplaceCheckout'),
    getDailyPaymentStats(startDate, 'marketplaceCheckout'),
    getPaymentStatusBreakdown(startDate, 'registration'),
    getPaymentProviderCompletion(startDate, 'registration'),
    getPaymentCurrencyBreakdown(startDate, 'registration'),
    getDailyPaymentStats(startDate, 'registration'),
  ])

  return {
    marketplaceCheckout: {
      byStatus: mcStatus,
      byProvider: mcProv,
      byCurrency: mcCur,
      dailyStats: mcDaily,
    },
    registration: {
      byStatus: regStatus,
      byProvider: regProv,
      byCurrency: regCur,
      dailyStats: regDaily,
    },
  }
}

async function getPaymentStatusBreakdown(startDate: Date, scope: PaymentAnalyticsScope) {
  const breakdown = await prisma.payment.groupBy({
    by: ['status'],
    where: {
      createdAt: { gte: startDate },
      ...paymentScopeWhere(scope),
    },
    _count: true,
    _sum: {
      amount: true,
    },
  })

  return breakdown.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.status]: {
        count: curr._count,
        total: curr._sum.amount || 0,
      },
    }),
    {}
  )
}

function groupByCountVal(row: { _count: number | { _all: number } }): number {
  const c = row._count
  return typeof c === 'number' ? c : c._all
}

/** Per provider: all volume vs completed only (for bar charts). */
async function getPaymentProviderCompletion(startDate: Date, scope: PaymentAnalyticsScope) {
  const breakdown = await prisma.payment.groupBy({
    by: ['provider', 'status'],
    where: {
      createdAt: { gte: startDate },
      ...paymentScopeWhere(scope),
    },
    _count: true,
    _sum: {
      amount: true,
    },
  })

  const acc: Record<
    string,
    {
      total: number
      completed: number
      totalCount: number
      completedCount: number
    }
  > = {}

  for (const row of breakdown) {
    const key = row.provider
    if (!acc[key]) {
      acc[key] = { total: 0, completed: 0, totalCount: 0, completedCount: 0 }
    }
    const amount = row._sum.amount || 0
    const n = groupByCountVal(row)
    acc[key].total += amount
    acc[key].totalCount += n
    if (row.status === PaymentStatus.COMPLETED) {
      acc[key].completed += amount
      acc[key].completedCount += n
    }
  }

  return acc
}

async function getPaymentCurrencyBreakdown(startDate: Date, scope: PaymentAnalyticsScope) {
  const breakdown = await prisma.payment.groupBy({
    by: ['currency'],
    where: {
      createdAt: { gte: startDate },
      ...paymentScopeWhere(scope),
    },
    _count: true,
    _sum: {
      amount: true,
    },
  })

  return breakdown.reduce(
    (acc, curr) => ({
      ...acc,
      [curr.currency]: {
        count: curr._count,
        total: curr._sum.amount || 0,
      },
    }),
    {}
  )
}

async function getDailyPaymentStats(startDate: Date, scope: PaymentAnalyticsScope) {
  const stats = await prisma.payment.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: startDate },
      ...paymentScopeWhere(scope),
    },
    _count: true,
    _sum: {
      amount: true,
    },
  })

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const statsMap = new Map()
  stats.forEach(stat => {
    const date = stat.createdAt.toISOString().split('T')[0]
    if (!statsMap.has(date)) {
      statsMap.set(date, { count: 0, total: 0 })
    }
    const current = statsMap.get(date)!
    current.count += stat._count
    current.total += stat._sum.amount || 0
  })

  return last30Days.map((date) => ({
    date,
    count: statsMap.get(date)?.count || 0,
    total: statsMap.get(date)?.total || 0,
  }))
}