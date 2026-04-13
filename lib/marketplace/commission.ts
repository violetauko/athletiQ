/** Platform fee on marketplace (product) purchases — gross order/payment volume × this rate. */
export const MARKETPLACE_PLATFORM_COMMISSION_RATE = 0.2

/** Platform share of completed registration / entry fee payments (same currency as gross). */
export const REGISTRATION_FEE_COMMISSION_RATE = 0.1

export function marketplaceCommissionFromGross(grossKes: number): number {
  return Math.round(grossKes * MARKETPLACE_PLATFORM_COMMISSION_RATE * 100) / 100
}

export function registrationFeeCommissionFromGross(grossKes: number): number {
  return Math.round(grossKes * REGISTRATION_FEE_COMMISSION_RATE * 100) / 100
}
