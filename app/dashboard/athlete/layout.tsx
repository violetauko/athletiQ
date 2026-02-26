'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, FileText, Settings, TrendingUp, User } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const NAV_ITEMS = [
    { href: '/dashboard/athlete', label: 'Dashboard', icon: TrendingUp, default: true },
    { href: '/dashboard/athlete/applications', label: 'Applications', icon: Briefcase, default: false },
    { href: '/dashboard/athlete/saved', label: 'Saved Opportunities', icon: FileText, default: false },
    { href: '/dashboard/athlete/opportunities', label: 'Opportunities', icon: User, default: false },
    { href: '/dashboard/athlete/profile', label: 'My Profile', icon: User, default: false },
    // { href: '/dashboard/athlete/settings', label: 'Settings', icon: Settings, default: false },
] as const

export default function AthleteDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    
    const isActiveRoute = (href: string) => {
        // Exact match for root dashboard
        if (href === '/dashboard/athlete') {
            return pathname === href
        }
        // Check if path starts with the href for nested routes
        return pathname.startsWith(href)
    }
    
    const{ data: session } = useSession()

    if (!session || session.user.role !== 'ATHLETE') {
        redirect('/login')
    }

    return (
        <div className="min-h-screen">
            <section className="bg-linear-to-br from-stone-900 to-black text-white py-12 mt-12 rounded-2xl px-12">
                <div className="container">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Athlete Dashboard</h1>
                            <p className="text-white/80">Welcome back! Here&apos;s your recruitment overview.</p>
                        </div>
                        <Button variant="outline" className="text-black border-white hover:bg-white/10" asChild>
                            <Link href="/dashboard/athlete/profile">
                                <User className="w-4 h-4 mr-2" />
                                View Profile
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
            <div className="py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-6">
                                <nav className="space-y-2">
                                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                                        const isActive = isActiveRoute(href)
                                        return (
                                            <Link key={href} href={href}>
                                                <Button
                                                    variant={isActive ? "default" : "ghost"}
                                                    className={`
                                                        w-full justify-start 
                                                        ${isActive 
                                                            ? 'bg-black text-white hover:bg-black/90' 
                                                            : 'hover:bg-stone-100'
                                                        }
                                                    `}
                                                >
                                                    <Icon className="w-4 h-4 mr-2" />
                                                    {label}
                                                </Button>
                                            </Link>
                                        )
    })}
                                </nav>
                            </CardContent>
                        </Card>
                    </div>
                    <div className='lg:col-span-3 space-y-8 p-2 border-l border-t rounded-l-xl'>{children}</div>
                </div>
            </div>
        </div>
    )
}
