# Donation Feature — Setup Guide

## 1. Install Stripe

```bash
npm install stripe
```

## 2. Environment Variables

Copy `.env.example` → `.env.local` and fill in your Stripe keys:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Get your keys at: https://dashboard.stripe.com/apikeys

## 3. File Placement

```
your-project/
├── app/
│   ├── donate/
│   │   ├── page.tsx              ← Main donation page
│   │   └── success/
│   │       └── page.tsx          ← Post-payment success page
│   └── api/
│       └── donate/
│           ├── checkout/
│           │   └── route.ts      ← Creates Stripe Checkout session
│           └── webhook/
│               └── route.ts      ← Handles Stripe webhook events
├── components/
│   └── donate/
│       └── DonateButton.tsx      ← Reusable Donate CTA
└── lib/
    └── stripe.ts                 ← Stripe client + donation tier config
```

## 4. Register the Webhook

### Local development:
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/donate/webhook
# Copy the whsec_... printed and paste into STRIPE_WEBHOOK_SECRET
```

### Production (Stripe Dashboard):
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/donate/webhook`
4. Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
5. Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

## 5. Update Header Component

Replace the existing Donate link in your Header with the `DonateButton` component:

```tsx
// In header.tsx — replace:
<Link href="/donate" className="...">
  Donate
  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
</Link>

// With:
import { DonateButton } from '@/components/donate/DonateButton'

<DonateButton variant="header" />
```

Or add a full-width banner above your header:
```tsx
<DonateButton variant="banner" />
<Header />
```

## 6. Optional: Persist donations to DB

In `app/api/donate/webhook/route.ts`, find the `handleDonationSuccess` function
and uncomment the Prisma example (or adapt to your ORM/DB).

Recommended schema:

```prisma
model Donation {
  id              String   @id @default(cuid())
  stripeSessionId String   @unique
  amount          Int      // in cents
  tierId          String
  donorName       String?
  message         String?
  userId          String?
  userEmail       String?
  status          String   @default("paid")
  paidAt          DateTime
  createdAt       DateTime @default(now())
}
```

## 7. Test Cards

| Scenario        | Card Number          |
|-----------------|----------------------|
| Success         | 4242 4242 4242 4242  |
| Auth required   | 4000 0025 0000 3155  |
| Declined        | 4000 0000 0000 9995  |

Use any future expiry, any CVC, any ZIP.
