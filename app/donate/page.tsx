'use client'
import { DonatePage } from '@/components/donations/donate-component'
import { Suspense } from 'react'
export default function DonatePageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-4 md:py-20">Loading…</div>}>
      <DonatePage />
    </Suspense>
  )
}