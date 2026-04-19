import { kesToUsd, usdToKes } from '@/lib/donations/exchange'

export const PAYPAL_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com' // Switch to live in production if needed
  : 'https://api-m.sandbox.paypal.com'

/**
 * PayPal Orders API often rejects KES (CURRENCY_NOT_SUPPORTED). We bill in USD and convert
 * from KES using the same USD/KES rate as donations.
 */

/** Parse KES major units (or USD converted to KES) from a PayPal capture response. */
export function parseKesFromPayPalCapture(data: {
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        status?: string
        amount?: { value?: string; currency_code?: string }
        seller_receivable_breakdown?: {
          gross_amount?: { value?: string; currency_code?: string }
        }
      }>
    }
  }>
}): number | null {
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0]
  if (!capture) return null

  const tryPair = (value?: string, code?: string) => {
    if (value == null || value === '') return null
    const n = parseFloat(value)
    if (Number.isNaN(n)) return null
    const c = code?.toUpperCase()
    if (c === 'KES') return n
    if (c === 'USD') return usdToKes(n)
    return null
  }

  let v = tryPair(capture.amount?.value, capture.amount?.currency_code)
  if (v != null) return v

  const gross = capture.seller_receivable_breakdown?.gross_amount
  v = tryPair(gross?.value, gross?.currency_code)
  if (v != null) return v

  return null
}

export async function createPayPalCheckoutOrder(opts: {
  amountKes: number
  description: string
  customId?: string
}) {
  const accessToken = await generateAccessToken()
  const usd = Math.max(0.01, kesToUsd(opts.amountKes))
  const value = usd.toFixed(2)
  const purchase_unit: Record<string, unknown> = {
    amount: {
      currency_code: 'USD',
      value,
    },
    description: opts.description,
  }
  if (opts.customId) {
    purchase_unit.custom_id = opts.customId
  }

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [purchase_unit],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('PayPal create order failed:', data)
    throw new Error('PAYPAL_CREATE_FAILED')
  }

  return data as { id: string }
}

export async function generateAccessToken() {
  const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID
  const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error('MISSING_API_CREDENTIALS')
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
    },
    // Don't cache this request as access tokens expire
    cache: 'no-store'
  })

  const data = await response.json()
  return data.access_token
}
