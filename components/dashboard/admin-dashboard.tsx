'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Briefcase,
    Settings,
    TrendingUp,
    Activity,
    AlertTriangle,
    FileText,
    ShieldCheck,
    Check,
    X
} from 'lucide-react'
import Link from 'next/link'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface DashboardData {
    stats: {
        totalUsers: number;
        activeAthletes: number;
        activeClients: number;
        opportunitiesActive: number;
        pendingVerifications: number;
        pendingOpportunitiesCount?: number;
    };
    recentUsers: Array<{
        id: string;
        name: string;
        email: string;
        role: string;
        joinedAt: string;
    }>;
    pendingOpportunitiesList?: Array<{
        id: string;
        title: string;
        createdAt: string;
        client: {
            user: {
                name: string;
                email: string;
            }
        }
    }>;
    systemAlerts: Array<{
        id: number;
        type: string;
        message: string;
        time: string;
    }>;
}

export function AdminDashboard() {
    const queryClient = useQueryClient()
    const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
        queryKey: ['adminDashboard'],
        queryFn: async () => {
            const res = await fetch('/api/admin/dashboard')
            if (!res.ok) throw new Error('Failed to fetch dashboard data')
            return res.json()
        }
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const res = await fetch(`/api/admin/opportunities/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            if (!res.ok) throw new Error('Failed to update status')
            return res.json()
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminDashboard'] })
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-white">
            {/* Header */}
            <section className="bg-gradient-to-br from-red-900 to-black text-white py-12">
                <div className="container">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-8 h-8 text-red-500" />
                                <h1 className="text-4xl font-bold">Admin Console</h1>
                            </div>
                            <p className="text-white/80">Platform overview and system management.</p>
                        </div>
                        <Button className="bg-white text-black hover:bg-white/90" asChild>
                            <Link href="/dashboard/admin/settings">
                                <Settings className="w-4 h-4 mr-2" />
                                System Settings
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            <div className="container py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-6">
                                <nav className="space-y-2">
                                    <Link href="/dashboard">
                                        <Button variant="default" className="w-full justify-start bg-black">
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            Overview
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/admin/users">
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Users className="w-4 h-4 mr-2" />
                                            User Management
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/admin/opportunities">
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            All Opportunities
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/admin/reports">
                                        <Button variant="ghost" className="w-full justify-start">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Reports & Analytics
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/admin/system">
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Activity className="w-4 h-4 mr-2" />
                                            System Status
                                        </Button>
                                    </Link>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">

                        {isError && (
                            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5" />
                                    <p className="font-medium">Failed to load platform data. Please try again.</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => refetch()} className="border-red-200 text-red-700 hover:bg-red-100">
                                    Retry
                                </Button>
                            </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Total Users', value: data?.stats.totalUsers, icon: Users, color: 'text-blue-600' },
                                { label: 'Active Jobs', value: data?.stats.opportunitiesActive, icon: Briefcase, color: 'text-amber-600' },
                                { label: 'Pending Approval', value: data?.stats.pendingOpportunitiesCount, icon: FileText, color: 'text-purple-600' },
                                { label: 'Pending Verifications', value: data?.stats.pendingVerifications, icon: AlertTriangle, color: 'text-red-600' }
                            ].map((stat, i) => (
                                <Card key={i}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                        </div>
                                        {isLoading ? (
                                            <div className="h-9 w-20 bg-stone-200 animate-pulse rounded my-1" />
                                        ) : (
                                            <div className="text-3xl font-bold mb-1">{stat.value !== undefined ? stat.value : '-'}</div>
                                        )}
                                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {data?.pendingOpportunitiesList && data.pendingOpportunitiesList.length > 0 && (
                            <Card className="border-purple-100 ring-1 ring-purple-100 ring-offset-2">
                                <CardHeader>
                                    <CardTitle className="text-purple-900 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-purple-500" />
                                        Requires Approval
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {data.pendingOpportunitiesList.map((opp) => (
                                            <div key={opp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-stone-50 gap-4">
                                                <div>
                                                    <h3 className="font-semibold">{opp.title}</h3>
                                                    <p className="text-sm text-stone-600">
                                                        Posted by {opp.client.user.name} ({opp.client.user.email})
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(opp.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatusMutation.mutate({ id: opp.id, status: 'DRAFT' })}>
                                                        <X className="w-4 h-4 mr-1" /> Reject
                                                    </Button>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatusMutation.mutate({ id: opp.id, status: 'ACTIVE' })}>
                                                        <Check className="w-4 h-4 mr-1" /> Approve
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recent Users */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>New Registrations</CardTitle>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href="/dashboard/admin/users">View All</Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {isLoading ? (
                                            Array.from({ length: 4 }).map((_, i) => (
                                                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 px-2 -mx-2">
                                                    <div className="space-y-2">
                                                        <div className="h-4 w-32 bg-stone-200 animate-pulse rounded" />
                                                        <div className="h-3 w-48 bg-stone-100 animate-pulse rounded" />
                                                    </div>
                                                    <div className="h-6 w-16 bg-stone-200 animate-pulse rounded-full" />
                                                </div>
                                            ))
                                        ) : data?.recentUsers.length === 0 ? (
                                            <div className="text-center py-6 text-muted-foreground text-sm">No recent registrations</div>
                                        ) : (
                                            data?.recentUsers.map((user) => (
                                                <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-stone-50 transition-colors px-2 -mx-2 rounded-sm">
                                                    <div>
                                                        <p className="font-semibold text-sm">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1">
                                                        <Badge variant="outline" className={`text-[10px] ${user.role === 'ATHLETE' ? 'border-blue-200 text-blue-700 bg-blue-50' : 'border-purple-200 text-purple-700 bg-purple-50'}`}>
                                                            {user.role}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">{user.joinedAt}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* System Alerts */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {isLoading ? (
                                            Array.from({ length: 2 }).map((_, i) => (
                                                <div key={i} className="p-3 rounded-lg border flex items-start gap-3 bg-stone-50">
                                                    <div className="w-5 h-5 bg-stone-200 rounded animate-pulse shrink-0" />
                                                    <div className="space-y-2 w-full">
                                                        <div className="h-4 bg-stone-200 rounded animate-pulse w-3/4" />
                                                        <div className="h-3 bg-stone-100 rounded animate-pulse w-1/4" />
                                                    </div>
                                                </div>
                                            ))
                                        ) : data?.systemAlerts.length === 0 ? (
                                            <div className="text-center py-6 text-muted-foreground text-sm">No system alerts</div>
                                        ) : data?.systemAlerts.map(alert => (
                                            <div key={alert.id} className={`p-3 rounded-lg border flex items-start gap-3 ${alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-blue-50 border-blue-200 text-blue-900'
                                                }`}>
                                                {alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <Activity className="w-5 h-5 shrink-0" />}
                                                <div>
                                                    <p className="text-sm font-medium">{alert.message}</p>
                                                    <p className="text-xs opacity-70 mt-1">{alert.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

