'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, FileText, TrendingUp, User, Settings, MessageSquare } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

const NAV_ITEMS = [
    { href: '/dashboard/recruiter', label: 'Dashboard', icon: TrendingUp },
    { href: '/dashboard/recruiter/profile', label: 'My Profile', icon: User },
    { href: '/dashboard/recruiter/applications', label: 'Applications', icon: Briefcase },
    { href: '/dashboard/recruiter/opportunities', label: 'My Opportunities', icon: FileText },
    { href: '/dashboard/recruiter/messages', label: 'Messages', icon: MessageSquare },
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
    const{ data: session } = useSession()
    if (!session || session.user.role !== 'CLIENT') {
        redirect('/login')
    }
    

    return (
        <div className="min-h-screen">
            <section className="bg-linear-to-br from-stone-900 to-black text-white py-12 mt-12 rounded-2xl px-12">
                <div className="container">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Recruiter Dashboard</h1>
                            <p className="text-white/80">Welcome back! Here&apos;s your account overview.</p>
                        </div>
                        <Button variant="outline" className="text-black border-white hover:bg-white/10" asChild>
                            <Link href="/dashboard/recruiter/profile">
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