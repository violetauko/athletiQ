'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-band-20 backdrop-blur supports-backdrop-filter:bg-band-10">
      <div className="container mx-auto px-2 sm:px-0 lg:px-0 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-black rounded-full">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl text-black">AthletiQ</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link 
            href="/about" 
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            About Us
          </Link>
          <Link 
            href="/opportunities" 
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Opportunities
          </Link>
          <Link 
            href="/athletes" 
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Athletes
          </Link>
          <Link 
            href="/contact" 
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Contact Us
          </Link>
          <Link 
            href="/donate" 
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Donate
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/register">Register</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
