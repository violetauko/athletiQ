'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DonateButtonProps {
  variant?: 'header' | 'banner' | 'pill'
  className?: string
}

/**
 * Reusable Donate CTA component.
 *
 * Usage:
 *   <DonateButton variant="header" />    — compact link for nav
 *   <DonateButton variant="banner" />    — full-width promo banner
 *   <DonateButton variant="pill" />      — floating pill CTA
 */
export function DonateButton({ variant = 'header', className }: DonateButtonProps) {
  if (variant === 'banner') {
    return (
      <div className={cn(
        'w-full bg-gradient-to-r from-black via-zinc-900 to-black border-y border-white/10 py-3 px-4',
        className
      )}>
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-red-500 fill-red-500 shrink-0" />
            <p className="text-sm text-white/70">
              Help us fund the next generation of athletes.
            </p>
          </div>
          <Link
            href="/donate"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-white/90 transition-colors"
          >
            Donate now
            <Heart className="w-3 h-3 fill-black" />
          </Link>
        </div>
      </div>
    )
  }

  if (variant === 'pill') {
    return (
      <Link
        href="/donate"
        className={cn(
          'fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-black font-bold text-sm shadow-xl hover:bg-white/90 active:scale-95 transition-all',
          className
        )}
      >
        <Heart className="w-4 h-4 fill-black" />
        Donate
      </Link>
    )
  }

  // Default: header variant
  return (
    <Link
      href="/donate"
      className={cn(
        'inline-flex items-center gap-1.5 transition-colors hover:text-foreground/80 text-foreground/60 text-sm font-medium',
        className
      )}
    >
      Donate
      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
    </Link>
  )
}
