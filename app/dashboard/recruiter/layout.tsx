'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, FileText, TrendingUp, User, Settings, MessageSquare, ShoppingBag } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const NAV_ITEMS = [
    { href: '/dashboard/recruiter', label: 'Dashboard', icon: TrendingUp },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/dashboard/recruiter/applications', label: 'Applications', icon: Briefcase },
    { href: '/dashboard/recruiter/opportunities', label: 'My Opportunities', icon: FileText },
    { href: '/dashboard/recruiter/messages', label: 'Messages', icon: MessageSquare },
    { href: '/dashboard/recruiter/profile', label: 'My Profile', icon: User },
    // { href: '/dashboard/recruiter/settings', label: 'Settings', icon: Settings },
] as const

export default function RecruiterDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const isActiveRoute = (href: string) => {
        // Exact match for root dashboard
        if (href === '/dashboard/recruiter') {
            return pathname === href
        }
        // Check if path starts with the href for nested routes
        return pathname.startsWith(href)
    }
    const { data: session, status } = useSession()
    if (status === "loading") {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!session || session.user.role !== 'CLIENT') {
        redirect('/login')
    }


    return (
        <div className="min-h-screen">
            <section className="bg-linear-to-br from-stone-900 to-black text-white py-6 md:py-12 mt-6 md:mt-12 rounded-2xl px-6 md:px-12">
                <div className="container">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-bold mb-2">Recruiter Dashboard</h1>
                            <p className="text-white/80 text-sm md:text-base">Welcome back! Here&apos;s your account overview.</p>
                        </div>
                        <Button variant="outline" className="text-black border-white hover:bg-white/10" asChild>
                            <Link href="/dashboard/recruiter/profile">
                                <User className="w-3 md:w-4 h-3 md:h-4 mr-2" />
                                View Profile
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
            <div className="py-6 md:py-12">
                <div className="flex flex-col gap-6 md:gap-8">
                    <Card className="sticky top-16 z-30 border-b rounded-xl shadow-sm overflow-hidden">
                        <CardContent className="p-1 md:p-2">
                            <nav className="flex items-center justify-between md:justify-start gap-1 overflow-x-auto no-scrollbar">
                                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                                    const isActive = isActiveRoute(href)
                                    return (
                                        <Link key={href} href={href} className="grow md:grow-0">
                                            <Button
                                                variant={isActive ? "default" : "ghost"}
                                                className={`
                                                    w-full md:w-auto h-12 md:h-10 px-3 md:px-6 rounded-lg flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-all
                                                    ${isActive
                                                        ? 'bg-black text-white hover:bg-black/90 shadow-md'
                                                        : 'hover:bg-stone-100 text-stone-600'
                                                    }
                                                `}
                                            >
                                                <Icon className={`w-5 h-5 md:w-4 md:h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                                                <span className="text-[10px] md:text-sm font-medium">{label}</span>
                                            </Button>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </CardContent>
                    </Card>
                    <div className='flex-1 min-w-0 space-y-8 p-2 border-l border-t rounded-l-xl'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}