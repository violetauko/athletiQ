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

export function DonationsAnalytics({ data, isLoading }: DonationsAnalyticsProps) {
  if (isLoading) {
    return <DonationsAnalyticsSkeleton />
  }

  const statusData = Object.entries(data?.byStatus || {}).map(([status, value]) => ({
    name: status,
    value: value.total,
    count: value.count,
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
                {formatCurrency(data?.byStatus?.COMPLETED?.total || 0, 'KES')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {data?.byStatus?.COMPLETED?.count || 0} completed donations
              </p>
            </div>
            <div className="bg-stone-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Donation</p>
              <p className="text-2xl font-bold">
                {formatCurrency(
                  (data?.byStatus?.COMPLETED?.total || 0) / (data?.byStatus?.COMPLETED?.count || 1),
                  'KES'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div>
              <h3 className="text-sm font-medium mb-4">By Status</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value?: number) => formatCurrency(value ?? 0, 'KES', false)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {statusData.map((item, index) => (
                  <div key={item.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span>{item.name}</span>
                    </div>
                    <div className="font-medium">{formatCurrency(item.value, 'KES')}</div>
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
                          width: `${(tier.value / (data?.byStatus?.COMPLETED?.total || 1)) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-24 text-right">
                      {formatCurrency(tier.value, 'KES')}
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
          <Skeleton className="h-[200px]" />
          <Skeleton className="h-[200px]" />
        </div>
      </CardContent>
    </Card>
  )
}