/**
 * Partnerize (Performance Horizon) — attribute completed sales to affiliate traffic.
 *
 * 1) middleware.ts stores the click ref from URL params (camref, clickref, pubref, cref) in a cookie.
 * 2) Wise payment creation copies that cookie into Payment.affiliateClickRef.
 * 3) When an admin confirms a Wise payment, we optionally GET your Partnerize server-side conversion URL
 *    so your program can credit the partner (configure PARTNERIZE_CONVERSION_URL_TEMPLATE in env).
 */

const DEFAULT_COOKIE = 'athq_affiliate_ref'

export function partnerizeAffiliateCookieName(): string {
  return process.env.PARTNERIZE_AFFILIATE_COOKIE_NAME?.trim() || DEFAULT_COOKIE
}

export function readAffiliateClickRefFromCookie(cookieValue: string | undefined): string | null {
  const v = cookieValue?.trim()
  if (!v) return null
  return v.slice(0, 256)
}

/**
 * Fire a server-side conversion ping if PARTNERIZE_CONVERSION_URL_TEMPLATE is set.
 * Placeholders: {camref}, {reference}, {value}, {currency}
 * - {value} = payment amount in whole currency units (matches Payment.amount for KES).
 */
export async function notifyPartnerizeConversion(params: {
  camref: string | null
  conversionReference: string
  value: number
  currency: string
}): Promise<void> {
  const template = process.env.PARTNERIZE_CONVERSION_URL_TEMPLATE?.trim()
  if (!template) return

  const camref = params.camref?.trim()
  if (!camref) {
    console.info('[partnerize] Skipping conversion ping: no affiliateClickRef on payment')
    return
  }

  const url = template
    .replace(/{camref}/g, encodeURIComponent(camref))
    .replace(/{reference}/g, encodeURIComponent(params.conversionReference))
    .replace(/{value}/g, encodeURIComponent(String(params.value)))
    .replace(/{currency}/g, encodeURIComponent(params.currency))

  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[partnerize] Conversion URL non-OK', res.status, body.slice(0, 500))
    }
  } catch (e) {
    console.error('[partnerize] Conversion fetch failed', e)
  }
}
