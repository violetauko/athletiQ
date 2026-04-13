import Stripe from 'stripe'

let _stripe: Stripe | null = null

/**
 * Lazy Stripe client — only initializes when first called at runtime,
 * so missing env vars don't crash builds or module imports.
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        'Missing STRIPE_SECRET_KEY — add it to your .env.local\n' +
        'Get your test key at: https://dashboard.stripe.com/test/apikeys'
      )
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // apiVersion: '2024-11-20.acacia',
      typescript: true,
    })
  }
  return _stripe
}

/**
 * Proxy so existing stripe.checkout.sessions.create() calls
 * work without changing any other files.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})

/** Tier amounts are USD (whole dollars); KES is derived via usdToKes on the server */
export const DONATION_TIERS = [
  {
    id: 'champion',
    label: 'Champion',
    amount: 10,
    description: 'Help one athlete with training gear',
    emoji: '🥉',
  },
  {
    id: 'supporter',
    label: 'Supporter',
    amount: 25,
    description: 'Fund a month of coaching sessions',
    emoji: '🥈',
  },
  {
    id: 'mvp',
    label: 'MVP',
    amount: 50,
    description: "Sponsor an athlete's tournament entry",
    emoji: '🥇',
  },
  {
    id: 'legend',
    label: 'Legend',
    amount: 100,
    description: 'Full scholarship contribution',
    emoji: '🏆',
  },
] as const

export type DonationTierId = typeof DONATION_TIERS[number]['id']