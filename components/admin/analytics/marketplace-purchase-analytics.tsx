'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { ShoppingBag } from 'lucide-react'

type Period = 'week' | 'month' | 'quarter' | 'year'

export interface MarketplacePurchaseAnalyticsData {
  period: Period
  startDate: string
  commissionRate: number
  orders: {
    byStatus: Record<
      string,
      {
        count: number
        orderTotalKes: number
        volumeCategory: 'paid_pipeline' | 'unpaid_or_failed' | 'other'
      }
    >
  }
  paidPurchasesUseSettlementDate?: boolean
  marketplacePayments: {
    byStatus: Record<string, { count: number; volume: number }>
  }
  paidPurchases: {
    count: number
    grossVolumeKes: number
    platformCommissionKes: number
  }
}

interface MarketplacePurchaseAnalyticsProps {
  data?: MarketplacePurchaseAnalyticsData
  isLoading: boolean
}

const STATUS_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#84cc16', '#14b8a6']

export function MarketplacePurchaseAnalytics({ data, isLoading }: MarketplacePurchaseAnalyticsProps) {
  if (isLoading) {
    return <MarketplacePurchaseAnalyticsSkeleton />
  }

  const orderStatusData = Object.entries(data?.orders?.byStatus || {}).map(([name, v]) => ({
    name,
    count: v.count,
    orderTotalKes: v.orderTotalKes,
    volumeCategory: v.volumeCategory,
  }))

  const paymentStatusData = Object.entries(data?.marketplacePayments?.byStatus || {}).map(
    ([name, v]) => ({
      name,
      count: v.count,
      volume: v.volume,
    })
  )

  const ratePct = (data?.commissionRate ?? 0.2) * 100

  return (
    <Card id="marketplace-purchases">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Marketplace purchases
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/admin/marketplace/orders">Manage orders</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-stone-50 p-4">
            <p className="text-sm text-muted-foreground">Paid purchases (volume)</p>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.paidPurchases?.grossVolumeKes ?? 0, 'KES', false)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {data?.paidPurchases?.count ?? 0} payment(s) marked completed in period
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-sm text-muted-foreground">Platform commission ({ratePct.toFixed(0)}%)</p>
            <p className="text-2xl font-bold text-emerald-800">
              {formatCurrency(data?.paidPurchases?.platformCommissionKes ?? 0, 'KES', false)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">On marketplace sales only</p>
          </div>
          <div className="rounded-lg bg-stone-50 p-4">
            <p className="text-sm text-muted-foreground">Orders placed (period)</p>
            <p className="text-2xl font-bold">
              {orderStatusData.reduce((s, r) => s + r.count, 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">By order status — see charts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium">Orders by status</h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Bar = order count. Dollar amounts are cart totals — only PROCESSING+ are post-payment (paid
              pipeline). PENDING / CANCELLED are unpaid or failed checkout.
            </p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const row = payload[0].payload as {
                        name: string
                        count: number
                        orderTotalKes: number
                        volumeCategory: string
                      }
                      const volHint =
                        row.volumeCategory === 'paid_pipeline'
                          ? 'Paid pipeline (M-Pesa succeeded)'
                          : row.volumeCategory === 'unpaid_or_failed'
                            ? 'Not collected (unpaid or failed)'
                            : 'Other (e.g. refunded)'
                      return (
                        <div className="rounded-md border bg-white px-2 py-1.5 text-xs shadow-sm">
                          <p className="font-medium">{row.name}</p>
                          <p>{row.count} orders</p>
                          <p>{formatCurrency(row.orderTotalKes, 'KES', false)} order total</p>
                          <p className="text-muted-foreground">{volHint}</p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-medium">Checkout payments by status</h3>
            <p className="mb-2 text-xs text-muted-foreground">M-Pesa (and other) payments with order reference</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStatusData.map((d) => ({ name: d.name, value: d.count }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={72}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {paymentStatusData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {orderStatusData.map((row) => (
            <div key={row.name} className="rounded-lg bg-stone-50 p-3 text-center">
              <p className="text-xs text-muted-foreground">{row.name}</p>
              <p className="font-semibold">{row.count}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatCurrency(row.orderTotalKes, 'KES', false)}
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                {row.volumeCategory === 'paid_pipeline'
                  ? 'Paid pipeline'
                  : row.volumeCategory === 'unpaid_or_failed'
                    ? 'Not collected'
                    : 'Other'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function MarketplacePurchaseAnalyticsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-56" />
      </CardContent>
    </Card>
  )
}
