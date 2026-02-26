'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Heart, LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEffect } from 'react'
import { redirect, useRouter } from 'next/navigation'

export function Header() {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const router = useRouter();

  useEffect(() => {
      if (!session?.user?.role) return; // wait for session

      switch (session.user.role) {
        case "ADMIN":
          router.push("/dashboard/admin");
          break;
        case "CLIENT":
          router.push("/dashboard/recruiter");
          break;
        case "ATHLETE":
        default:
          router.push("/dashboard/athlete");
          break;
      }
    }, [session, router]); // dependency array includes session & router

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

        {!session?.user &&
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
        }

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-20 rounded-full bg-muted animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 rounded-full">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-black text-white text-xs font-bold">
                    {session.user.name
                      ? session.user.name.charAt(0).toUpperCase()
                      : <User className="w-3.5 h-3.5" />}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">
                    {session.user.name ?? session.user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-semibold">{session.user.name}</p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                  <p className="text-xs mt-0.5 font-medium text-black/60 uppercase tracking-wide">
                    {session.user.role}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/donate">Donate<Heart className="w-4 h-4 text-red-500 fill-red-500" /></Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
