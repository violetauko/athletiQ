// components/admin/analytics/overview-analytics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, TrendingUp, Users, ArrowUpRight, ArrowDownRight, ShoppingBag, Percent, Ticket } from 'lucide-react'

interface OverviewAnalyticsProps {
  data?: {
    totalRevenue: number
    totalDonations: number
    /** Marketplace purchase revenue from completed payments only. */
    totalPurchases: number
    successfulPurchaseCount?: number
    successfulRegistrationPaymentCount?: number
    totalCommission: number
    purchaseCommission?: number
    donationCommission?: number
    totalEntryPayments: number
    uniqueDonors: number
    growth: {
      revenue: number
      donations: number
      purchases: number
      commission: number
      entryPayments: number
    }
  }
  isLoading: boolean
  period: string
  onPeriodChange: (period: 'week' | 'month' | 'quarter' | 'year') => void
}

export function OverviewAnalytics({ data, isLoading, period, onPeriodChange }: OverviewAnalyticsProps) {
  if (isLoading) {
    return <OverviewAnalyticsSkeleton />
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data?.totalRevenue || 0, 'KES', false),
      change: data?.growth?.revenue ?? 0,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Donations',
      value: formatCurrency(data?.totalDonations || 0, 'KES', false),
      change: data?.growth?.donations ?? 0,
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Successful purchases',
      value: formatCurrency(data?.totalPurchases || 0, 'KES', false),
      change: data?.growth?.purchases ?? 0,
      icon: ShoppingBag,
      color: 'bg-purple-100 text-purple-600',
      subline:
        data?.successfulPurchaseCount != null
          ? `${data.successfulPurchaseCount} successful order checkout(s) — marketplace only; excludes registration fees`
          : 'Marketplace order checkouts only (payment purpose); excludes registration fees',
    },
    {
      title: 'Commission (20%)',
      value: formatCurrency(data?.totalCommission || 0, 'KES', false),
      change: data?.growth?.commission ?? 0,
      icon: Percent,
      color: 'bg-indigo-100 text-indigo-600',
      subline:
        data?.purchaseCommission != null && data?.donationCommission != null
          ? `${formatCurrency(data.purchaseCommission, 'KES', false)} marketplace · ${formatCurrency(
              data.donationCommission,
              'KES',
              false
            )} donations`
          : undefined,
    },
    {
      title: 'Registration payments',
      value: formatCurrency(data?.totalEntryPayments || 0, 'KES', false),
      change: data?.growth?.entryPayments ?? 0,
      icon: Ticket,
      color: 'bg-amber-100 text-amber-600',
      subline:
        data?.successfulRegistrationPaymentCount != null
          ? `${data.successfulRegistrationPaymentCount} completed — entry / account fees (no order checkout)`
          : 'No order link — not counted as purchases',
    },
    {
      title: 'Unique Donors',
      value: data?.uniqueDonors || 0,
      change: 0,
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Financial Overview</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPeriodChange(p)}
              className="capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const isPositive = stat.change >= 0

          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    {'subline' in stat && stat.subline && (
                      <p className="mt-1 text-xs text-muted-foreground">{stat.subline}</p>
                    )}
                    {stat.change !== 0 && (
                      <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        <span>{Math.abs(stat.change)}% from last {period}</span>
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function OverviewAnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}