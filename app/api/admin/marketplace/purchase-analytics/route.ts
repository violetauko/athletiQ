import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { OrderStatus, PaymentPurpose, PaymentStatus } from '@prisma/client'
import { getAnalyticsPeriodStart, type AnalyticsPeriod } from '@/lib/admin/analytics-period'
import {
  MARKETPLACE_PLATFORM_COMMISSION_RATE,
  marketplaceCommissionFromGross,
} from '@/lib/marketplace/commission'

/** Order rows that reflect M-Pesa success (stock decremented, payment cleared). */
const PAID_PIPELINE: OrderStatus[] = [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED]

function orderVolumeCategory(status: OrderStatus): 'paid_pipeline' | 'unpaid_or_failed' | 'other' {
  if (PAID_PIPELINE.includes(status)) return 'paid_pipeline'
  if (status === OrderStatus.PENDING || status === OrderStatus.CANCELLED) return 'unpaid_or_failed'
  return 'other'
}

function groupByCount(row: { _count: number | { _all: number } }): number {
  const c = row._count
  return typeof c === 'number' ? c : c._all
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = (searchParams.get('period') || 'month') as AnalyticsPeriod
    const startDate = getAnalyticsPeriodStart(
      ['week', 'month', 'quarter', 'year'].includes(period) ? period : 'month'
    )

    const [ordersByStatus, marketplacePaymentBreakdown, paidAggregate] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startDate } },
        _count: true,
        _sum: { totalAmount: true },
      }),
      prisma.payment.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: startDate },
          purpose: PaymentPurpose.MARKETPLACE_PURCHASE,
        },
        _count: true,
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          /** When the payment was marked completed (money actually settled). */
          updatedAt: { gte: startDate },
          purpose: PaymentPurpose.MARKETPLACE_PURCHASE,
          status: PaymentStatus.COMPLETED,
        },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    const ordersByStatusMap = Object.fromEntries(
      ordersByStatus.map((row) => [
        row.status,
        {
          count: groupByCount(row),
          orderTotalKes: row._sum.totalAmount ?? 0,
          volumeCategory: orderVolumeCategory(row.status),
        },
      ])
    )

    const paymentsByStatusMap = Object.fromEntries(
      marketplacePaymentBreakdown.map((row) => [
        row.status,
        {
          count: groupByCount(row),
          volume: row._sum.amount ?? 0,
        },
      ])
    )

    const paidGrossVolume = paidAggregate._sum.amount ?? 0
    const paidPurchaseCount = paidAggregate._count
    const platformCommission = marketplaceCommissionFromGross(paidGrossVolume)

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      commissionRate: MARKETPLACE_PLATFORM_COMMISSION_RATE,
      /** Paid KPIs use payment.updatedAt; order rows use order.createdAt for funnel only. */
      paidPurchasesUseSettlementDate: true,
      orders: {
        byStatus: ordersByStatusMap,
      },
      marketplacePayments: {
        byStatus: paymentsByStatusMap,
      },
      paidPurchases: {
        count: paidPurchaseCount,
        grossVolumeKes: paidGrossVolume,
        platformCommissionKes: platformCommission,
      },
    })
  } catch (e) {
    console.error('[ADMIN_MARKETPLACE_PURCHASE_ANALYTICS]', e)
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}
