'use client'
import { DonatePage } from '@/components/donations/donate-component'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { Suspense } from 'react'
export default function DonatePageWrapper() {
  return (
    <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '', currency: 'USD' }}>
      <Suspense fallback={<div className="text-center py-4 md:py-20">Loading…</div>}>
        <DonatePage />
      </Suspense>
    </PayPalScriptProvider>
  )
}