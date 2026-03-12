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
    const [currentDonations, currentPayments, uniqueDonors] = await Promise.all([
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
          status: PaymentStatus.COMPLETED
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
    const [previousDonations, previousPayments] = await Promise.all([
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
          status: PaymentStatus.COMPLETED
        },
        _sum: { amount: true }
      })
    ])

    const currentTotal = (currentDonations._sum.amount || 0) + (currentPayments._sum.amount || 0)
    const previousTotal = (previousDonations._sum.amount || 0) + (previousPayments._sum.amount || 0)

    // Calculate growth percentages
    const revenueGrowth = previousTotal > 0 
      ? ((currentTotal - previousTotal) / previousTotal) * 100 
      : 0

    const donationsGrowth = (previousDonations._sum.amount || 0) > 0
      ? (((currentDonations._sum.amount || 0) - (previousDonations._sum.amount || 0)) / (previousDonations._sum.amount || 1)) * 100
      : 0

    const paymentsGrowth = (previousPayments._sum.amount || 0) > 0
      ? (((currentPayments._sum.amount || 0) - (previousPayments._sum.amount || 0)) / (previousPayments._sum.amount || 1)) * 100
      : 0

    return NextResponse.json({
      totalRevenue: currentTotal,
      totalDonations: currentDonations._sum.amount || 0,
      totalPayments: currentPayments._sum.amount || 0,
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
    current.total += stat._sum.amount || 0
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
    current.total += stat._sum.amount || 0
  })

  return last30Days.map(date => ({
    date,
    count: statsMap.get(date)?.count || 0,
    total: statsMap.get(date)?.total || 0
  }))
}