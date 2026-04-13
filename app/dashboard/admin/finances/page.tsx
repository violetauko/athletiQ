'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { OverviewAnalytics } from '@/components/admin/analytics/overview-analytics'
import { DonationsAnalytics } from '@/components/admin/analytics/donation-analytics'
import { PaymentsAnalytics } from '@/components/admin/analytics/payment-analytics'
import { MarketplacePurchaseAnalytics } from '@/components/admin/analytics/marketplace-purchase-analytics'
import { CommissionInvoicePanel } from '@/components/admin/commission-invoice-panel'

export default function AdminFinancesPage() {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useQuery({
    queryKey: ['admin-finance-analytics', analyticsPeriod],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('period', analyticsPeriod)

      const response = await fetch(`/api/admin/finance/analytics?${params}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  const { data: purchaseAnalytics, isLoading: purchaseAnalyticsLoading } = useQuery({
    queryKey: ['admin-marketplace-purchase-analytics', analyticsPeriod],
    queryFn: async () => {
      const params = new URLSearchParams({ period: analyticsPeriod })
      const res = await fetch(`/api/admin/marketplace/purchase-analytics?${params}`)
      if (!res.ok) throw new Error('Failed to fetch purchase analytics')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="min-h-screen w-full space-y-6">
      <OverviewAnalytics
        data={analyticsData}
        isLoading={analyticsLoading}
        period={analyticsPeriod}
        onPeriodChange={setAnalyticsPeriod}
      />

      <div className="grid grid-cols-1 gap-6">
        <MarketplacePurchaseAnalytics
          data={purchaseAnalytics}
          isLoading={purchaseAnalyticsLoading}
        />
        <CommissionInvoicePanel />
        <DonationsAnalytics
          data={analyticsData?.donations}
          isLoading={analyticsLoading}
        />
        <PaymentsAnalytics
          data={analyticsData?.payments}
          isLoading={analyticsLoading}
        />
      </div>
    </div>
  )
}
