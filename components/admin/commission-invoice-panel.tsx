'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { FileText, ExternalLink } from 'lucide-react'

function defaultYearMonth() {
  const d = new Date()
  const prev = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 0))
  return { year: prev.getUTCFullYear(), month: prev.getUTCMonth() + 1 }
}

interface InvoicePayload {
  invoiceNumber: string
  platformName: string
  periodLabel: string
  commissionRates: {
    marketplace: number
    donation: number
    registration: number
  }
  totals: {
    purchaseVolumeKes: number
    donationVolume: number
    registrationVolumeKes: number
    marketplaceCommissionKes: number
    donationCommissionKes: number
    registrationCommissionKes: number
    platformCommissionDueKes: number
    transactionCount: number
  }
  generatedAt: string
}

export function CommissionInvoicePanel() {
  const def = useMemo(() => defaultYearMonth(), [])
  const [year, setYear] = useState(def.year)
  const [month, setMonth] = useState(def.month)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-commission-invoice', year, month],
    queryFn: async (): Promise<InvoicePayload> => {
      const params = new URLSearchParams({ year: String(year), month: String(month), format: 'json' })
      const res = await fetch(`/api/admin/marketplace/commission-invoice?${params}`)
      if (!res.ok) throw new Error('Failed to load invoice')
      return res.json()
    },
    staleTime: 60 * 1000,
  })

  const htmlHref = `/api/admin/marketplace/commission-invoice?year=${year}&month=${month}&format=html`

  return (
    <Card id="commission-invoice">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Monthly commission invoice
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Total platform commission for the UTC calendar month: marketplace (20%) and donations (20%) on gross
          volume, plus registration fees (10%). Matches finance analytics methodology; donations use{' '}
          <code className="text-xs">createdAt</code>, payments when marked completed (
          <code className="text-xs">updatedAt</code>).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoice-year">Year</Label>
            <select
              id="invoice-year"
              className="flex h-10 w-[110px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
            >
              {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-month">Month</Label>
            <select
              id="invoice-month"
              className="flex h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            >
              {[
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
              ].map((label, i) => (
                <option key={label} value={i + 1}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <Button variant="secondary" asChild>
            <a href={htmlHref} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open printable invoice
            </a>
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full max-w-md" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-destructive">Could not load invoice preview. Try again.</p>
        )}

        {!isLoading && data && (
          <div className="rounded-lg border bg-stone-50/80 p-4">
            <p className="font-medium">{data.platformName}</p>
            <p className="text-sm text-muted-foreground">
              {data.invoiceNumber} · {data.periodLabel}
            </p>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Marketplace gross (KES)</span>
                <p className="font-semibold">{formatCurrency(data.totals.purchaseVolumeKes, 'KES', false)}</p>
                <p className="text-xs text-muted-foreground">
                  Commission ({(data.commissionRates.marketplace * 100).toFixed(0)}%):{' '}
                  {formatCurrency(data.totals.marketplaceCommissionKes, 'KES', false)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Donation gross (numeric sum)</span>
                <p className="font-semibold">{data.totals.donationVolume.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  Commission ({(data.commissionRates.donation * 100).toFixed(0)}%):{' '}
                  {formatCurrency(data.totals.donationCommissionKes, 'KES', false)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Registration gross (KES)</span>
                <p className="font-semibold">{formatCurrency(data.totals.registrationVolumeKes, 'KES', false)}</p>
                <p className="text-xs text-muted-foreground">
                  Commission ({(data.commissionRates.registration * 100).toFixed(0)}%):{' '}
                  {formatCurrency(data.totals.registrationCommissionKes, 'KES', false)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total platform commission due</span>
                <p className="text-lg font-semibold text-emerald-800">
                  {formatCurrency(data.totals.platformCommissionDueKes, 'KES', false)}
                </p>
              </div>
              <div className="sm:col-span-2 text-xs text-muted-foreground">
                {data.totals.transactionCount} transaction(s) · Generated{' '}
                {new Date(data.generatedAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
