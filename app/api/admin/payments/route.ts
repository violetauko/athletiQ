// app/api/admin/payments/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Filters
    const status = searchParams.get('status')
    const provider = searchParams.get('provider')
    const search = searchParams.get('search')
    const dateRange = searchParams.get('dateRange')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    let whereClause: any = {}

    // Status filter
    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    // Provider filter
    if (provider && provider !== 'ALL') {
      whereClause.provider = provider
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { referenceId: { contains: search, mode: 'insensitive' } },
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { merchantReference: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
            ]
          }
        }
      ]
    }

    // Date range filter
    let dateFilter: any = {}
    const now = new Date()

    if (dateRange) {
      switch (dateRange) {
        case 'today':
          dateFilter = {
            gte: new Date(now.setHours(0, 0, 0, 0))
          }
          break
        case 'week':
          dateFilter = {
            gte: new Date(now.setDate(now.getDate() - 7))
          }
          break
        case 'month':
          dateFilter = {
            gte: new Date(now.setMonth(now.getMonth() - 1))
          }
          break
        case 'custom':
          if (startDate) {
            dateFilter.gte = new Date(startDate)
          }
          if (endDate) {
            dateFilter.lte = new Date(endDate)
          }
          break
      }
    }

    if (Object.keys(dateFilter).length > 0) {
      whereClause.createdAt = dateFilter
    }

    // Execute queries
    const [payments, totalCount] = await Promise.all([
      prisma.payment.findMany({
        where: whereClause,
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where: whereClause })
    ])

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Get stats
    const stats = await getPaymentStats(whereClause)

    return NextResponse.json({
      items: payments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      stats
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

async function getPaymentStats(whereClause: any) {
  const [
    totalAmount,
    statusCounts,
    providerCounts,
    currencyCounts,
    dailyStats
  ] = await Promise.all([
    // Total amount sum
    prisma.payment.aggregate({
      where: whereClause,
      _sum: {
        amount: true
      }
    }),

    // Status breakdown
    prisma.payment.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
      _sum: {
        amount: true
      }
    }),

    // Provider breakdown
    prisma.payment.groupBy({
      by: ['provider'],
      where: whereClause,
      _count: true,
      _sum: {
        amount: true
      }
    }),

    // Currency breakdown
    prisma.payment.groupBy({
      by: ['currency'],
      where: whereClause,
      _count: true,
      _sum: {
        amount: true
      }
    }),

    // Daily stats for last 30 days
    prisma.payment.groupBy({
      by: ['createdAt'],
      where: {
        ...whereClause,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      },
      _count: true,
      _sum: {
        amount: true
      }
    })
  ])

  // Process daily stats
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return date.toISOString().split('T')[0]
  }).reverse()

  const dailyStatsMap = new Map()
  dailyStats.forEach(stat => {
    const date = stat.createdAt.toISOString().split('T')[0]
    if (!dailyStatsMap.has(date)) {
      dailyStatsMap.set(date, { count: 0, total: 0 })
    }
    const current = dailyStatsMap.get(date)
    current.count += stat._count
    current.total += stat._sum.amount || 0
  })

  const processedDailyStats = last30Days.map(date => ({
    date,
    count: dailyStatsMap.get(date)?.count || 0,
    total: dailyStatsMap.get(date)?.total || 0
  }))

  return {
    totalAmount: totalAmount._sum.amount || 0,
    byStatus: statusCounts.reduce((acc, curr) => ({
      ...acc,
      [curr.status]: {
        count: curr._count,
        total: curr._sum.amount || 0
      }
    }), {}),
    byProvider: providerCounts.reduce((acc, curr) => ({
      ...acc,
      [curr.provider]: {
        count: curr._count,
        total: curr._sum.amount || 0
      }
    }), {}),
    byCurrency: currencyCounts.reduce((acc, curr) => ({
      ...acc,
      [curr.currency]: {
        count: curr._count,
        total: curr._sum.amount || 0
      }
    }), {}),
    dailyStats: processedDailyStats
  }
}