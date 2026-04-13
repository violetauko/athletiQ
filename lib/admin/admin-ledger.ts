import type { DonationStatus as PrismaDonationStatus } from '@prisma/client'
import type { PaymentProvider } from '@/lib/types/types'

export function inferDonationProvider(d: {
  stripeSessionId?: string | null
  stripePaymentId?: string | null
  paypalOrderId?: string | null
  pesapalOrderId?: string | null
}): PaymentProvider {
  if (d.stripeSessionId || d.stripePaymentId) return 'STRIPE'
  if (d.paypalOrderId) return 'PAYPAL'
  if (d.pesapalOrderId) return 'PESAPAL'
  return 'STRIPE'
}

/** Admin UI uses COMPLETED for settled payments; donations use PAID. */
export function mapAdminStatusToDonationStatus(
  status: string | null | undefined
): PrismaDonationStatus | undefined {
  if (!status || status === 'ALL') return undefined
  if (status === 'COMPLETED') return 'PAID'
  if (status === 'PENDING' || status === 'FAILED' || status === 'REFUNDED') return status as PrismaDonationStatus
  return undefined
}

export function donationMatchesProvider(
  provider: PaymentProvider,
  d: {
    stripeSessionId?: string | null
    stripePaymentId?: string | null
    paypalOrderId?: string | null
    pesapalOrderId?: string | null
  }
): boolean {
  return inferDonationProvider(d) === provider
}
