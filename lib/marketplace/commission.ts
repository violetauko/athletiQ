/** Platform fee on marketplace (product) purchases — gross order/payment volume × this rate. */
export const MARKETPLACE_PLATFORM_COMMISSION_RATE = 0.2

export function marketplaceCommissionFromGross(grossKes: number): number {
  return Math.round(grossKes * MARKETPLACE_PLATFORM_COMMISSION_RATE * 100) / 100
}
