import { Prisma } from "@prisma/client"
import { prisma } from "./prisma"

// Helper function to get donation statistics
export async function getDonationStats(whereClause: Prisma.DonationWhereInput) {
    const whereSql = buildWhereClauseForRaw(whereClause)
  const [
    totalAmount,
    statusCounts,
    tierCounts,
    currencyCounts,
    dailyStats,
    monthlyStats
  ] = await Promise.all([
    // Total amount sum
    prisma.donation.aggregate({
      where: whereClause,
      _sum: {
        amount: true
      }
    }),

    // Status breakdown
    prisma.donation.groupBy({
      by: ['status'],
      where: whereClause,
      _count: true,
      _sum: {
        amount: true
      }
    }),

    // Tier breakdown
    prisma.donation.groupBy({
      by: ['tierId', 'isCustom'],
      where: whereClause,
      _count: true,
      _sum: {
        amount: true
      }
    }),

    // Currency breakdown
    prisma.donation.groupBy({
      by: ['currency'],
      where: whereClause,
      _count: true,
      _sum: {
        amount: true
      }
    }),

    // Daily stats for last 30 days
    prisma.donation.groupBy({
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
    }),
    prisma.$queryRaw(Prisma.sql`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count,
        SUM(amount) as total
      FROM "Donation"
      WHERE ${whereSql}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 12
    `)
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
    byTier: tierCounts.reduce((acc, curr) => ({
      ...acc,
      [`${curr.tierId}${curr.isCustom ? '_custom' : ''}`]: {
        tierId: curr.tierId,
        isCustom: curr.isCustom,
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
    dailyStats: processedDailyStats,
    monthlyStats
  }
}

// Helper function to build where clause for raw SQL
export function buildWhereClauseForRaw(whereClause: any) {
  const conditions: Prisma.Sql[] = []

  if (whereClause.status) {
    conditions.push(Prisma.sql`"status" = ${whereClause.status}`)
  }

  if (whereClause.tierId) {
    conditions.push(Prisma.sql`"tierId" = ${whereClause.tierId}`)
  }

  if (whereClause.currency) {
    conditions.push(Prisma.sql`"currency" = ${whereClause.currency}`)
  }

  if (whereClause.userId) {
    conditions.push(Prisma.sql`"userId" = ${whereClause.userId}`)
  }

  if (whereClause.donorEmail?.contains) {
    conditions.push(
      Prisma.sql`"donorEmail" ILIKE ${'%' + whereClause.donorEmail.contains + '%'}`
    )
  }

  if (whereClause.donorName?.contains) {
    conditions.push(
      Prisma.sql`"donorName" ILIKE ${'%' + whereClause.donorName.contains + '%'}`
    )
  }

  if (whereClause.amount?.gte) {
    conditions.push(Prisma.sql`"amount" >= ${whereClause.amount.gte}`)
  }

  if (whereClause.amount?.lte) {
    conditions.push(Prisma.sql`"amount" <= ${whereClause.amount.lte}`)
  }

  if (whereClause.createdAt?.gte) {
    conditions.push(Prisma.sql`"createdAt" >= ${whereClause.createdAt.gte}`)
  }

  if (whereClause.createdAt?.lte) {
    conditions.push(Prisma.sql`"createdAt" <= ${whereClause.createdAt.lte}`)
  }

//   if (conditions.length === 0) {
//     return Prisma.empty
//   }
  if (conditions.length === 0) {
    return Prisma.sql`1=1`
  }

  return Prisma.join(conditions, ' AND ')
}
