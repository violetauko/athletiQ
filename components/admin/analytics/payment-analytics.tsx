// components/admin/analytics/payment-analytics.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Legend,
} from 'recharts'

type PaymentBlock = {
  byStatus: Record<string, { count: number; total: number }>
  byProvider: Record<
    string,
    {
      total: number
      completed: number
      totalCount: number
      completedCount: number
    }
  >
  byCurrency: Record<string, { count: number; total: number }>
  dailyStats: Array<{ date: string; count: number; total: number }>
}

interface PaymentsAnalyticsProps {
  data?: {
    marketplaceCheckout: PaymentBlock
    registration: PaymentBlock
  }
  isLoading: boolean
}

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6']

function PaymentSection({
  title,
  description,
  data,
}: {
  title: string
  description: string
  data: PaymentBlock
}) {
  const statusData = Object.entries(data?.byStatus || {}).map(([status, value]) => ({
    name: status,
    value: value.total,
    count: value.count,
  }))

  const providerChartRows = Object.entries(data?.byProvider || {}).map(([provider, v]) => {
    const other = Math.max(0, v.total - v.completed)
    const pct = v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0
    return {
      key: provider,
      name: provider.replace('_', ' '),
      completed: v.completed,
      notCompleted: other,
      total: v.total,
      completedCount: v.completedCount,
      totalCount: v.totalCount,
      pctCompletedVolume: pct,
    }
  })

  const completed = data?.byStatus?.COMPLETED
  const failed = data?.byStatus?.FAILED
  const completedTotal = completed?.total || 0
  const denom = (completed?.count || 0) + (failed?.count || 0)

  const dailyData = data?.dailyStats || []

  return (
    <div className="space-y-6 border-t pt-6 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-stone-50 p-4">
          <p className="text-sm text-muted-foreground">Completed volume</p>
          <p className="text-2xl font-bold">{formatCurrency(completedTotal, 'KES', false)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{completed?.count || 0} completed</p>
        </div>
        <div className="rounded-lg bg-stone-50 p-4">
          <p className="text-sm text-muted-foreground">Success rate</p>
          <p className="text-2xl font-bold">
            {denom > 0 ? Math.round(((completed?.count || 0) / denom) * 100) : 0}%
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Completed vs failed (excludes pending)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-medium">By provider (volume)</h4>
          <p className="mb-3 text-xs text-muted-foreground">
            Stacked bars: <span className="text-green-700 font-medium">completed</span> vs{' '}
            <span className="text-stone-500">pending / failed / other</span> (same period). Width = total
            attempted volume per provider.
          </p>
          <div
            className="w-full"
            style={{ height: Math.min(320, Math.max(140, providerChartRows.length * 44)) }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={providerChartRows}
                margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={88}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(s: string) => (s.length > 14 ? `${s.slice(0, 12)}…` : s)}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const p = payload[0].payload as (typeof providerChartRows)[0]
                    return (
                      <div className="rounded-md border bg-white px-3 py-2 text-xs shadow-sm">
                        <p className="font-semibold capitalize">{p.name}</p>
                        <p className="mt-1 text-muted-foreground">
                          {p.completedCount}/{p.totalCount} payments · {p.pctCompletedVolume}% completed by volume
                        </p>
                        <p className="mt-1 text-green-800">
                          Completed: {formatCurrency(p.completed, 'KES', false)}
                        </p>
                        <p className="text-stone-600">
                          Not completed: {formatCurrency(p.notCompleted, 'KES', false)}
                        </p>
                        <p className="mt-1 border-t pt-1 font-medium">
                          Total: {formatCurrency(p.total, 'KES', false)}
                        </p>
                      </div>
                    )
                  }}
                />
                <Legend />
                <Bar dataKey="completed" stackId="pv" fill="#16a34a" name="Completed" radius={[0, 0, 0, 0]} />
                <Bar
                  dataKey="notCompleted"
                  stackId="pv"
                  fill="#d6d3d1"
                  name="Not completed"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            {providerChartRows.map((row) => (
              <li key={row.key} className="flex flex-wrap justify-between gap-2 border-b border-stone-100 pb-1.5 last:border-0">
                <span className="font-medium capitalize text-stone-700">{row.name.toLowerCase()}</span>
                <span>
                  {formatCurrency(row.completed, 'KES', false)} completed of {formatCurrency(row.total, 'KES', false)}{' '}
                  · {row.completedCount}/{row.totalCount} tx
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-medium">Last 30 days</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value?: number) => formatCurrency(value ?? 0, 'KES', false)} />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium">Status</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData.map((d) => ({ name: d.name, value: d.count }))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={64}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {statusData.map((status) => (
          <div key={status.name} className="rounded-lg bg-stone-50 p-3 text-center">
            <p className="mb-1 text-xs text-muted-foreground">{status.name}</p>
            <p className="font-semibold">{status.count}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatCurrency(status.value, 'KES', false)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PaymentsAnalytics({ data, isLoading }: PaymentsAnalyticsProps) {
  if (isLoading) {
    return <PaymentsAnalyticsSkeleton />
  }

  const mc = data?.marketplaceCheckout
  const reg = data?.registration

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <p className="text-sm text-muted-foreground">
          Split by <strong>payment purpose</strong> in the database: marketplace purchase vs registration fee
          (not inferred from provider references).
        </p>
      </CardHeader>
      <CardContent className="space-y-10">
        <PaymentSection
          title="Marketplace order checkout"
          description="Successful purchases and failed/pending checkout attempts for shop orders."
          data={
            mc || {
              byStatus: {},
              byProvider: {},
              byCurrency: {},
              dailyStats: [],
            }
          }
        />
        <PaymentSection
          title="Registration & account fees"
          description="Payments collected when users register or pay platform entry fees — not product purchases."
          data={
            reg || {
              byStatus: {},
              byProvider: {},
              byCurrency: {},
              dailyStats: [],
            }
          }
        />
      </CardContent>
    </Card>
  )
}

function PaymentsAnalyticsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full max-w-lg" />
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
