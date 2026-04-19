/**
 * Donors enter amounts in USD. We charge card/Stripe in USD (cents) and PayPal/PesaPal in KES
 * (converted from USD). All donation rows store `amount` in Kenya shillings (`currency: kes`).
 *
 * Set `USD_TO_KES_RATE` on the server and `NEXT_PUBLIC_USD_TO_KES_RATE` to the same value so
 * the donate page “≈ KSh …” line matches what the APIs persist (defaults to 130 if unset).
 */

export function getUsdToKesRate(): number {
  const raw =
    process.env.USD_TO_KES_RATE ??
    process.env.NEXT_PUBLIC_USD_TO_KES_RATE ??
    ''
  const n = raw !== '' ? parseFloat(String(raw)) : NaN
  if (Number.isFinite(n) && n > 0) return n
  return 130
}

/** USD (major units, e.g. 10.5) → KES major units, 2 decimal places */
export function usdToKes(usd: number): number {
  return Math.round(usd * getUsdToKesRate() * 100) / 100
}

/** KES major units → USD major units (2 dp). Used when PayPal charges in USD. */
export function kesToUsd(kes: number): number {
  const rate = getUsdToKesRate()
  return Math.round((kes / rate) * 100) / 100
}
