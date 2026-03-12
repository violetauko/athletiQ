export type DonationStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type PaymentProvider = 'STRIPE' | 'MPESA' | 'STANBIC_MPESA' | 'PAYPAL' | 'PESAPAL'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED'
export interface Donation {
  id: string
  stripeSessionId?: string
  stripePaymentId?: string
  paypalOrderId?: string
  pesapalOrderId?: string
  amount: number
  currency: string
  tierId: string
  isCustom: boolean
  donorName?: string
  donorEmail?: string
  message?: string
  userId?: string
  user?: {
    id: string
    name?: string
    email: string
    profile?: {
      firstName?: string
      lastName?: string
    }
  }
  status: DonationStatus
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  provider: PaymentProvider
  status: PaymentStatus
  referenceId?: string
  receiptNumber?: string
  merchantReference?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name?: string
    email: string
    profile?: {
      firstName?: string
      lastName?: string
    }
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  stats?: any
}