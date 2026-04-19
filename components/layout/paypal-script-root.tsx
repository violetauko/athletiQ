'use client'

import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import type { ReactNode } from 'react'

/**
 * Single PayPal JS SDK load for the app. REST Orders use USD (see lib/paypal.ts);
 * the SDK query string must include `client-id` and `currency=USD`:
 * https://developer.paypal.com/docs/checkout/reference/customize-sdk/
 *
 * Must use NEXT_PUBLIC_* — only those vars are inlined for the browser bundle.
 */
export function PayPalScriptRoot({ children }: { children: ReactNode }) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ''

  if (!clientId.trim()) {
    return <>{children}</>
  }

  return (
    <PayPalScriptProvider
      key={`paypal-sdk-usd-${clientId}`}
      options={{
        clientId,
        currency: 'USD',
        intent: 'capture',
        components: 'buttons',
      }}
    >
      {children}
    </PayPalScriptProvider>
  )
}
