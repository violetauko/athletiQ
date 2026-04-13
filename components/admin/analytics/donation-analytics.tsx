// components/admin/analytics/donations-analytics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DonationsAnalyticsProps {
  data?: {
    byStatus: Record<string, { count: number; total: number }>
    byTier: Record<string, { tierId: string; isCustom: boolean; count: number; total: number }>
    byCurrency: Record<string, { count: number; total: number }>
    dailyStats: Array<{ date: string; count: number; total: number }>
    monthlyStats: Array<{ month: Date; count: number; total: number }>
  }
  isLoading: boolean
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

function statusHasSettledFunds(status: string) {
  return status === 'PAID' || status === 'REFUNDED'
}

export function DonationsAnalytics({ data, isLoading }: DonationsAnalyticsProps) {
  if (isLoading) {
    return <DonationsAnalyticsSkeleton />
  }

  const statusData = Object.entries(data?.byStatus || {}).map(([status, value]) => ({
    name: status,
    count: value.count,
    total: value.total,
    /** Pie uses counts so failed/pending rows do not skew the chart with placeholder amounts */
    pieValue: value.count,
  }))

  const tierData = Object.entries(data?.byTier || {}).map(([tier, value]) => ({
    name: value.isCustom ? 'Custom' : value.tierId.charAt(0).toUpperCase() + value.tierId.slice(1),
    value: value.total,
    count: value.count,
  }))

  const dailyData = data?.dailyStats || []

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Donations Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Donations</p>
              <p className="text-2xl font-bold">
                {formatCurrency(data?.byStatus?.PAID?.total || 0, 'KES', false)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data?.byStatus?.PAID?.count || 0} completed donations
              </p>
            </div>
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Donation</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  (data?.byStatus?.PAID?.total || 0) / (data?.byStatus?.PAID?.count || 1),
                  'KES',
                  false
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div>
              <h3 className="text-sm font-medium mb-4">By status (count)</h3>
              <div className="h-50">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="pieValue"
                      nameKey="name"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const row = payload[0].payload as (typeof statusData)[0]
                        const money =
                          statusHasSettledFunds(row.name) && row.total > 0
                            ? formatCurrency(row.total, 'KES', false)
                            : null
                        return (
                          <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
                            <p className="font-semibold">{row.name}</p>
                            <p className="text-muted-foreground">
                              {row.count} {row.count === 1 ? 'donation' : 'donations'}
                            </p>
                            {money ? (
                              <p className="mt-1">{money} recorded total</p>
                            ) : (
                              <p className="mt-1 text-muted-foreground">No settled funds total</p>
                            )}
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {statusData.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 shrink-0 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div className="min-w-0">
                        <span className="font-medium">{item.name}</span>
                        <p className="text-xs text-muted-foreground">
                          {item.count} {item.count === 1 ? 'record' : 'records'}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {statusHasSettledFunds(item.name) ? (
                        <span className="font-medium">{formatCurrency(item.total, 'KES', false)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Trend */}
            <div>
              <h3 className="text-sm font-medium mb-4">Last 30 Days</h3>
              <div className="h-50">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      formatter={(value?: number) => formatCurrency(value ? value : 0, 'KES', false)}
                    />
                    <Bar dataKey="total" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tier Breakdown */}
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-4">By Tier</h3>
            <div className="space-y-3">
              {tierData.map((tier) => (
                <div key={tier.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{tier.name}</span>
                    <span className="text-xs text-muted-foreground">({tier.count})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${(tier.value / (data?.byStatus?.PAID?.total || 1)) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-24 text-right">
                      {formatCurrency(tier.value, 'KES', false)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DonationsAnalyticsSkeleton() {
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
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-50" />
          <Skeleton className="h-50" />
        </div>
      </CardContent>
    </Card>
  )
}