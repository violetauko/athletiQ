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

export interface OpportunityDetail {
  id: string
  title: string
  organization: string
  description: string
  sport: string
  type: string
  status: string
  location: string
  requirements: string
  createdAt: string
  ClientProfile?: {
      id: string
      organization: string
      title: string
      name: string
      email: string
      User: {
        id: string
        name: string
        email: string
      }
    }
  user: {
    id: string
    name: string
    email: string
    ClientProfile?: {
      id: string
      organization: string
      title: string
      name: string
      email: string
    }
  }
  Application: Array<{
    id: string
    status: string
    appliedAt: string
    achievements: string
    additionalDocsFileNames: string
    address: string
    athleteId:string
    city:string
    coverLetter: string
    currentTeam: string
    dateOfBirth: string
    email: string
    experience: number
    firstName: string
    height: number
    lastName: string
    notes?: string
    opportunityId: string
    phone: string
    portfolioFileNames: string
    position: string
    resumeFileName: string
    state: string
    stats: string
    updatedAt: string
    userId: string
    weight: number
    athlete: {
      user: {
        name: string
        email: string
        image: string
      }
    }
  }>
  _count: {
    Application: number
    savedBy: number
  }
}