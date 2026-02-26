'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, TrendingUp, User, MessageSquare, ShieldCheck, Users } from 'lucide-react'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
    { href: '/dashboard/admin', label: 'Dashboard', icon: TrendingUp },
    { href: '/dashboard/admin/users', label: 'Users', icon: Users },
    { href: '/dashboard/admin/profile', label: 'My Profile', icon: User },
    // { href: '/dashboard/admin/applications', label: 'All Applications', icon: Briefcase },
    { href: '/dashboard/admin/opportunities', label: 'My Opportunities', icon: FileText },
    // { href: '/dashboard/admin/reports', label: 'Reports', icon: FilesIcon },
    { href: '/dashboard/admin/messages', label: 'Messages', icon: MessageSquare },
    // { href: '/dashboard/admin/system', label: 'System Status', icon: Settings },
] as const
export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const isActiveRoute = (href: string) => {
        // Exact match for root dashboard
        if (href === '/dashboard/admin') {
            return pathname === href
        }
        // Check if path starts with the href for nested routes
        return pathname.startsWith(href)
    }

    return (
        <div className="min-h-screen">
            <section className="bg-linear-to-br from-red-900 to-black text-white  py-12 mt-12 rounded-2xl px-12">
                <div className="container">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-8 h-8 text-red-500" />
                                <h1 className="text-4xl font-bold">Admin Console</h1>
                            </div>
                            <p className="text-white/80">Platform overview and system management.</p>
                        </div>
                        {/* <Button className="bg-white text-black hover:bg-white/90" asChild>
                            <Link href="/dashboard/admin/settings">
                                <Settings className="w-4 h-4 mr-2" />
                                System Settings
                            </Link>
                        </Button> */}
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