// components/admin/analytics/payments-analytics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface PaymentsAnalyticsProps {
  data?: {
    byStatus: Record<string, { count: number; total: number }>
    byProvider: Record<string, { count: number; total: number }>
    byCurrency: Record<string, { count: number; total: number }>
    dailyStats: Array<{ date: string; count: number; total: number }>
  }
  isLoading: boolean
}

const PROVIDER_COLORS = {
  STRIPE: '#635bff',
  MPESA: '#4caf50',
  STANBIC_MPESA: '#2196f3',
  PAYPAL: '#003087',
  PESAPAL: '#f7931e',
}

export function PaymentsAnalytics({ data, isLoading }: PaymentsAnalyticsProps) {
  if (isLoading) {
    return <PaymentsAnalyticsSkeleton />
  }

  const statusData = Object.entries(data?.byStatus || {}).map(([status, value]) => ({
    name: status,
    value: value.total,
    count: value.count,
  }))

  const providerData = Object.entries(data?.byProvider || {}).map(([provider, value]) => ({
    name: provider.replace('_', ' '),
    value: value.total,
    count: value.count,
    color: PROVIDER_COLORS[provider as keyof typeof PROVIDER_COLORS] || '#94a3b8',
  }))

  const dailyData = data?.dailyStats || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-stone-50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Payments</p>
            <p className="text-2xl font-bold">
              {formatCurrency(data?.byStatus?.COMPLETED?.total || 0, 'KES', false)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {data?.byStatus?.COMPLETED?.count || 0} completed payments
            </p>
          </div>
          <div className="bg-stone-50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold">
              {Math.round(
                ((data?.byStatus?.COMPLETED?.count || 0) /
                  ((data?.byStatus?.COMPLETED?.count || 0) +
                    (data?.byStatus?.FAILED?.count || 0))) *
                100
              )}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Provider Distribution */}
          <div>
            <h3 className="text-sm font-medium mb-4">By Provider</h3>
            <div className="space-y-3">
              {providerData.map((provider) => (
                <div key={provider.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: provider.color }} />
                    <span className="text-sm font-medium capitalize">{provider.name.toLowerCase()}</span>
                    <span className="text-xs text-muted-foreground">({provider.count})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(provider.value / (data?.byStatus?.COMPLETED?.total || 1)) * 100}%`,
                          backgroundColor: provider.color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-24 text-right">
                      {formatCurrency(provider.value, 'KES', false)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Trend */}
          <div>
            <h3 className="text-sm font-medium mb-4">Last 30 Days</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value?: number) => formatCurrency(value ?? 0, 'KES', false)}
                  />
                  <Bar dataKey="total" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {statusData.map((status) => (
            <div key={status.name} className="bg-stone-50 p-3 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">{status.name}</p>
              <p className="font-semibold">{status.count}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(status.value, 'KES', false)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentsAnalyticsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[200px]" />
      </CardContent>
    </Card>
  )
}