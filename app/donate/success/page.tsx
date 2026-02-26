import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { stripe } from '@/lib/stripe'
import { CheckCircle, Heart, ArrowRight, Trophy } from 'lucide-react'

interface PageProps {
  searchParams: { session_id?: string }
}

async function DonationSuccessContent({ sessionId }: { sessionId: string }) {
  let amount = 0
  let donorName = ''
  let tierId = ''

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      redirect('/donate')
    }

    amount = (session.amount_total ?? 0) / 100
    donorName = session.metadata?.donorName ?? ''
    tierId = session.metadata?.tierId ?? ''
  } catch {
    redirect('/donate')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-gradient-radial from-green-500/[0.06] to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Animated checkmark */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-green-400" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white/50 mb-5 tracking-widest uppercase">
            <Heart className="w-3 h-3 text-red-400 fill-red-400" />
            Payment confirmed
          </div>

          <h1 className="font-black text-4xl sm:text-5xl tracking-tighter mb-3">
            {donorName ? `Thanks, ${donorName.split(' ')[0]}!` : 'Thank you!'}
          </h1>

          <p className="text-white/50 text-lg">
            Your{' '}
            <span className="font-bold text-white">
              ${amount.toFixed(2)} donation
            </span>{' '}
            is making a real difference.
          </p>
        </div>

        {/* Impact card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white/80 text-sm">What happens next</span>
          </div>
          <ul className="space-y-3 text-sm text-white/50">
            <li className="flex items-start gap-2.5">
              <span className="text-green-400 mt-0.5">✓</span>
              A receipt has been sent to your email
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-green-400 mt-0.5">✓</span>
              Your contribution goes directly to athlete development programs
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-green-400 mt-0.5">✓</span>
              You'll receive a quarterly impact report showing your support in action
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/athletes"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all"
          >
            Meet the athletes
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/10 text-white/60 font-medium text-sm hover:text-white/90 hover:border-white/20 transition-all"
          >
            Back to home
          </Link>
        </div>

        <p className="mt-8 text-xs text-white/20">
          Transaction ID: {sessionId.slice(-12).toUpperCase()}
        </p>
      </div>
    </div>
  )
}

export default function DonateSuccessPage({ searchParams }: PageProps) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    redirect('/donate')
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <DonationSuccessContent sessionId={sessionId} />
    </Suspense>
  )
}