'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { OverviewAnalytics } from '@/components/admin/analytics/overview-analytics'
import { DonationsAnalytics } from '@/components/admin/analytics/donation-analytics'
import { PaymentsAnalytics } from '@/components/admin/analytics/payment-analytics'




export default function AdminFinancesPage() {
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    // refetch: refetchAnalytics
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

  return (
    <div className="min-h-screen w-full space-y-2">
      <OverviewAnalytics
        data={analyticsData}
        isLoading={analyticsLoading}
        period={analyticsPeriod}
        onPeriodChange={setAnalyticsPeriod}
      />

      <div className="grid grid-cols-1 gap-6">
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
