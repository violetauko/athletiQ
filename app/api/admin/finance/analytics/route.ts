// app/api/admin/finance/analytics/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { DonationStatus, PaymentStatus } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
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
          createdAt: { gte: startDate },
          status: PaymentStatus.COMPLETED,
          merchantReference: { not: null }
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: PaymentStatus.COMPLETED,
          merchantReference: null
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
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          },
          status: PaymentStatus.COMPLETED,
          merchantReference: { not: null }
        },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: startDate
          },
          status: PaymentStatus.COMPLETED,
          merchantReference: null
        },
        _sum: { amount: true }
      })
    ])
    const currentDonationSum = currentDonations._sum.amount ? currentDonations._sum.amount / 100 : 0
    const currentOrderRevenue = (currentOrderPayments._sum.amount || 0) * 0.20
    const currentFeeRevenue = (currentFeePayments._sum.amount || 0)
    const currentTotal = currentDonationSum + currentOrderRevenue + currentFeeRevenue

    const previousDonationSum = previousDonations._sum.amount ? previousDonations._sum.amount / 100 : 0
    const previousOrderRevenue = (previousOrderPayments._sum.amount || 0) * 0.20
    const previousFeeRevenue = (previousFeePayments._sum.amount || 0)
    const previousTotal = previousDonationSum + previousOrderRevenue + previousFeeRevenue

    // Calculate growth percentages
    const revenueGrowth = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0

    const currentTotalDonations = currentDonationSum
    const previousTotalDonations = previousDonationSum
    const donationsGrowth = previousTotalDonations > 0
      ? ((currentTotalDonations - previousTotalDonations) / previousTotalDonations) * 100
      : 0

    const currentTotalPaymentsRevenue = currentOrderRevenue + currentFeeRevenue
    const previousTotalPaymentsRevenue = previousOrderRevenue + previousFeeRevenue
    const paymentsGrowth = previousTotalPaymentsRevenue > 0
      ? ((currentTotalPaymentsRevenue - previousTotalPaymentsRevenue) / previousTotalPaymentsRevenue) * 100
      : 0

    return NextResponse.json({
      totalRevenue: currentTotal,
      totalDonations: currentDonationSum,
      totalPayments: currentTotalPaymentsRevenue,
      uniqueDonors: uniqueDonors.length,
      growth: {
        revenue: Math.round(revenueGrowth * 100) / 100,
        donations: Math.round(donationsGrowth * 100) / 100,
        payments: Math.round(paymentsGrowth * 100) / 100,
      },
      donations: {
        byStatus: await getDonationStatusBreakdown(startDate),
        byTier: await getDonationTierBreakdown(startDate),
        byCurrency: await getDonationCurrencyBreakdown(startDate),
        dailyStats: await getDailyDonationStats(startDate),
      },
      payments: {
        byStatus: await getPaymentStatusBreakdown(startDate),
        byProvider: await getPaymentProviderBreakdown(startDate),
        byCurrency: await getPaymentCurrencyBreakdown(startDate),
        dailyStats: await getDailyPaymentStats(startDate),
      }
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
    current.total += stat._sum.amount ? stat._sum.amount/100 : 0
  })

  return last30Days.map(date => ({
    date,
    count: statsMap.get(date)?.count || 0,
    total: statsMap.get(date)?.total || 0
  }))
}

async function getPaymentStatusBreakdown(startDate: Date) {
  const breakdown = await prisma.payment.groupBy({
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

async function getPaymentProviderBreakdown(startDate: Date) {
  const breakdown = await prisma.payment.groupBy({
    by: ['provider'],
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
    [curr.provider]: {
      count: curr._count,
      total: curr._sum.amount || 0
    }
  }), {})
}

async function getPaymentCurrencyBreakdown(startDate: Date) {
  const breakdown = await prisma.payment.groupBy({
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

async function getDailyPaymentStats(startDate: Date) {
  const stats = await prisma.payment.groupBy({
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
    
    // Use the same 20% logic for the daily charts to be consistent with totalRevenue
    // Since we don't have merchantReference in groupBy, we have to fetch more details or adjust logic.
    // For simplicity in daily stats, we'll keep it as 100% OR we need to fetch individual records.
    // Let's stick with 100% for the "Payment Analytics" chart specifically if it's meant to show volume,
    // but the Overview analytics stats above use the 20% cut.
    current.total += stat._sum.amount || 0
  })

  return last30Days.map(date => ({
    date,
    count: statsMap.get(date)?.count || 0,
    total: statsMap.get(date)?.total || 0
  }))
}