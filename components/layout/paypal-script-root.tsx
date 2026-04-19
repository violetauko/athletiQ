'use client'

import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import type { ReactNode } from 'react'

/**
 * Single PayPal JS SDK load for the app. REST Orders use USD (see lib/paypal.ts);
 * the SDK query string must use the same currency:
 * https://developer.paypal.com/docs/checkout/reference/customize-sdk/
 */
export function PayPalScriptRoot({ children }: { children: ReactNode }) {
  const clientId = process.env.PAYPAL_CLIENT_ID ?? ''

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
