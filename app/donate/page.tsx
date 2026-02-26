'use client'

import { useState, useTransition, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Heart, ArrowRight, AlertCircle, Sparkles, Trophy, Users, Target, Shield } from 'lucide-react'
import { DONATION_TIERS } from '@/lib/stripe'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Impact stats configuration
const IMPACT_STATS = [
  { value: '247', label: 'Athletes Supported', icon: Trophy, color: 'text-blue-600' },
  { value: '$48K', label: 'Raised This Year', icon: Sparkles, color: 'text-green-600' },
  { value: '31', label: 'Scholarships Funded', icon: Users, color: 'text-amber-600' },
  { value: '94%', label: 'Placed in Programs', icon: Target, color: 'text-purple-600' },
] as const

// Testimonials data
const TESTIMONIALS = [
  {
    quote: "This platform helped me get scouted by a D1 program. The donors made it possible.",
    name: "Marcus T.",
    role: "Track & Field",
    avatar: "🎯"
  },
  {
    quote: "I donated after seeing the impact reports. Knowing exactly where money goes is huge.",
    name: "Sarah K.",
    role: "Donor since 2023",
    avatar: "💝"
  },
  {
    quote: "AthletiQ connected me with a coach I never could have afforded on my own.",
    name: "Priya M.",
    role: "Swimming",
    avatar: "🏊"
  },
] as const

// Header Component
const DonateHeader = () => (

  <div className="text-start px-12 pt-5 pb-12 mb-16 bg-linear-to-r from-stone-900 to-black text-white rounded-2xl">
    <Badge variant="outline" className="mb-6 px-4 py-1.5 text-white border-white/30 bg-white/10 hover:bg-white/20">
      <Heart className="w-3 h-3 text-red-400 fill-red-400 mr-2" />
      Support the cause
    </Badge>
    <h1 className="text-3xl md:text-5xl text-white leading-[0.95] font-bold mb-5">
      Fuel the next champion
    </h1>
    <p className="text-lg max-w-md leading-relaxed text-white/80">
      Your donation gives undiscovered athletes the platform, coaching, and opportunity
      they deserve.
    </p>
  </div>
)

// Impact Stats Component
const ImpactStats = () => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
    {IMPACT_STATS.map((stat) => {
      const Icon = stat.icon
      return (
        <Card key={stat.label} className="border-stone-200 shadow-sm">
          <CardContent className="p-4 text-center">
            <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <div className="font-black text-2xl text-stone-900">{stat.value}</div>
            <div className="text-xs text-stone-600 mt-0.5">{stat.label}</div>
          </CardContent>
        </Card>
      )
    })}
  </div>
)

// Tier Card Component
interface TierCardProps {
  tier: typeof DONATION_TIERS[number]
  isSelected: boolean
  isPopular: boolean
  onSelect: () => void
}

const TierCard = ({ tier, isSelected, isPopular, onSelect }: TierCardProps) => (
  <button
    onClick={onSelect}
    className={cn(
      'w-full group relative flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-200',
      isSelected
        ? 'border-stone-900 bg-stone-50 shadow-md'
        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
    )}
  >
    <span className="text-2xl shrink-0 select-none">{tier.emoji}</span>

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className={cn(
          'font-bold text-base transition-colors',
          isSelected ? 'text-stone-900' : 'text-stone-700 group-hover:text-stone-900'
        )}>
          {tier.label}
        </span>
        {isPopular && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] px-2 py-0.5">
            Popular
          </Badge>
        )}
      </div>
      <p className={cn(
        'text-xs mt-0.5',
        isSelected ? 'text-stone-600' : 'text-stone-500'
      )}>{tier.description}</p>
    </div>

    <div className={cn(
      'font-black text-xl tabular-nums transition-colors shrink-0',
      isSelected ? 'text-stone-900' : 'text-stone-500 group-hover:text-stone-700'
    )}>
      ${tier.amount}
    </div>

    {isSelected && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <div className="w-2 h-2 rounded-full bg-stone-900 animate-pulse" />
      </div>
    )}
  </button>
)

// Custom Amount Component
interface CustomAmountProps {
  isSelected: boolean
  amount: string
  onSelect: () => void
  onAmountChange: (value: string) => void
}

const CustomAmount = ({ isSelected, amount, onSelect, onAmountChange }: CustomAmountProps) => (
  <button
    onClick={onSelect}
    className={cn(
      'w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-200',
      isSelected
        ? 'border-stone-900 bg-stone-50 shadow-md'
        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
    )}
  >
    <span className="text-2xl">✏️</span>
    <div className="flex-1">
      <span className={cn(
        'font-bold text-base',
        isSelected ? 'text-stone-900' : 'text-stone-700'
      )}>
        Custom Amount
      </span>
      {isSelected && (
        <div className="mt-2" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-stone-600 font-bold text-lg">$</span>
            <Input
              type="number"
              min="1"
              max="10000"
              step="1"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="bg-transparent border-b border-stone-300 focus:border-stone-600 outline-none font-bold text-lg w-32 pb-1 transition-colors placeholder:text-stone-300 rounded-none px-0 h-auto"
              autoFocus
            />
          </div>
        </div>
      )}
    </div>
    {!isSelected && (
      <span className="text-stone-400 font-bold text-sm">Any amount</span>
    )}
  </button>
)

// Donation Summary Component
interface DonationSummaryProps {
  displayAmount: number
  selectedTier?: typeof DONATION_TIERS[number]
  isCustom: boolean
  donorName: string
  message: string
  onDonorNameChange: (value: string) => void
  onMessageChange: (value: string) => void
  error: string | null
  isPending: boolean
  onDonate: () => void
}

const DonationSummary = ({
  displayAmount,
  selectedTier,
  isCustom,
  donorName,
  message,
  onDonorNameChange,
  onMessageChange,
  error,
  isPending,
  onDonate
}: DonationSummaryProps) => (
  <Card className="border-stone-200 shadow-md sticky top-8">
    <CardContent className="p-6 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-stone-500 mb-1">Your donation</p>
        <div className="font-black text-4xl text-stone-900 tabular-nums">
          {displayAmount > 0 ? `$${displayAmount.toFixed(2)}` : '—'}
        </div>
        {selectedTier && !isCustom && (
          <p className="text-xs text-stone-500 mt-1">{selectedTier.description}</p>
        )}
      </div>

      <div className="h-px bg-stone-200" />

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-stone-600">Your name (optional)</Label>
          <Input
            type="text"
            placeholder="Anonymous"
            value={donorName}
            onChange={(e) => onDonorNameChange(e.target.value)}
            maxLength={100}
            className="border-stone-200 text-stone-900 placeholder:text-stone-400 focus:border-stone-400"
          />
        </div>
        <div>
          <Label className="text-xs text-stone-600">Leave a message (optional)</Label>
          <textarea
            placeholder="Keep pushing, athletes! 🏆"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            maxLength={500}
            rows={2}
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-400 transition-colors resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <Button
        onClick={onDonate}
        disabled={isPending || displayAmount <= 0}
        className={cn(
          'w-full h-auto py-3.5 rounded-xl font-bold text-base transition-all duration-200',
          isPending || displayAmount <= 0
            ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
            : 'bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98] shadow-lg'
        )}
      >
        {isPending ? (
          <>
            <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting to Stripe...
          </>
        ) : (
          <>
            <Heart className="w-4 h-4 mr-2 fill-current" />
            Donate{displayAmount > 0 ? ` $${displayAmount.toFixed(2)}` : ''}
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-3 text-[11px] text-stone-500">
        <Shield className="w-3 h-3" />
        <span>Secured by Stripe</span>
        <span>·</span>
        <span>SSL encrypted</span>
      </div>
    </CardContent>
  </Card>
)

// Testimonials Component
const Testimonials = () => (
  <div className="mt-20 pt-12 border-t border-stone-200">
    <p className="text-xs uppercase tracking-widest text-stone-500 text-center mb-8">
      From our community
    </p>
    <div className="grid sm:grid-cols-3 gap-4">
      {TESTIMONIALS.map((testimonial) => (
        <Card key={testimonial.name} className="border-stone-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="text-2xl mb-3">{testimonial.avatar}</div>
            <p className="text-sm text-stone-700 leading-relaxed mb-4">"{testimonial.quote}"</p>
            <div>
              <p className="text-sm font-semibold text-stone-900">{testimonial.name}</p>
              <p className="text-xs text-stone-500">{testimonial.role}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

// Main Component
function DonatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const wasCanceled = searchParams.get('canceled') === 'true'

  const [selectedTierId, setSelectedTierId] = useState<string | null>('supporter')
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [donorName, setDonorName] = useState(session?.user?.name ?? '')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedTier = useMemo(
    () => DONATION_TIERS.find((t) => t.id === selectedTierId),
    [selectedTierId]
  )

  const displayAmount = useMemo(
    () => isCustom ? parseFloat(customAmount || '0') : (selectedTier?.amount ?? 0),
    [isCustom, customAmount, selectedTier]
  )

  function handleTierSelect(tierId: string) {
    setSelectedTierId(tierId)
    setIsCustom(false)
    setCustomAmount('')
    setError(null)
  }

  function handleCustomSelect() {
    setSelectedTierId(null)
    setIsCustom(true)
    setError(null)
  }

  async function handleDonate() {
    setError(null)

    const amountCents = Math.round(displayAmount)

    if (amountCents < 100) {
      setError('Minimum donation is $1.00')
      return
    }
    // if (amountCents > 1_000_000) {
    //   setError('Maximum donation is $10,000')
    //   return
    // }

    startTransition(async () => {
      try {
        const res = await fetch('/api/donate/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amountCents,
            tierId: isCustom ? undefined : selectedTierId,
            isCustom,
            donorName: donorName.trim() || undefined,
            message: message.trim() || undefined,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Something went wrong. Please try again.')
          return
        }

        if (data.url) {
          window.location.href = data.url
        }
      } catch {
        setError('Network error. Please check your connection and try again.')
      }
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative z-10 mx-auto px-4 sm:px-6 py-16 lg:py-24">
        {/* Canceled banner */}
        {wasCanceled && (
          <div className="mb-8 flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Your payment was canceled. No charges were made — feel free to try again anytime.
          </div>
        )}

        <DonateHeader />
        <ImpactStats />

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          {/* Left - Tier selection */}
          <div className="lg:col-span-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">
              Choose your impact
            </p>

            {DONATION_TIERS.map((tier, index) => (
              <TierCard
                key={tier.id}
                tier={tier}
                isSelected={!isCustom && selectedTierId === tier.id}
                isPopular={index === 1}
                onSelect={() => handleTierSelect(tier.id)}
              />
            ))}

            <CustomAmount
              isSelected={isCustom}
              amount={customAmount}
              onSelect={handleCustomSelect}
              onAmountChange={setCustomAmount}
            />
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-2">
            <DonationSummary
              displayAmount={displayAmount}
              selectedTier={selectedTier}
              isCustom={isCustom}
              donorName={donorName}
              message={message}
              onDonorNameChange={setDonorName}
              onMessageChange={setMessage}
              error={error}
              isPending={isPending}
              onDonate={handleDonate}
            />
          </div>
        </div>

        <Testimonials />
      </div>
    </div>
  )
}


export default function DonatePageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading…</div>}>
      <DonatePage />
    </Suspense>
  );
}