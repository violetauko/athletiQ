'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Briefcase,
    Activity,
    AlertTriangle,
    FileText,
    Check,
    X,
    Calendar,
    Shield,
    TrendingUp,
    Clock
} from 'lucide-react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface DashboardData {
    stats: {
        totalUsers: number;
        opportunities: {
            total: number;
            pending: number;
            active: number;
            closed: number;
        };
        applications: {
            total: number;
        };
        recentActivity: {
            newUsers: number;
            newOpportunities: number;
            newApplications: number;
        };
    };
    recentUsers: Array<{
        id: string;
        name: string | null;
        email: string;
        role: string;
        image: string | null;
        emailVerified: Date | null;
        createdAt: string;
        hasProfile: boolean;
        profileType: string | null;
        isVerified: boolean;
        AthleteProfile?: {
            primarySport: string | null;
            position: string | null;
        } | null;
        ClientProfile?: {
            organization: string | null;
            title: string | null;
        } | null;
    }>;
    pendingOpportunities: Array<{
        id: string;
        title: string;
        sport: string | null;
        type: string;
        status: string;
        createdAt: string;
        ClientProfile: {
            organization: string | null;
            User: {
                name: string | null;
                email: string;
            };
        } | null;
        _count: {
            Application: number;
        };
    }>;
    userStats: {
        byRole: Array<{ role: string; _count: number }>;
    };
    opportunityFilters: {
        sports: string[];
        types: string[];
        statuses: string[];
    };
}

export default function AdminDashboard() {
    const queryClient = useQueryClient()

    const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
        queryKey: ['admin-dashboard'],
        queryFn: async () => {
            // Fetch users data (latest 5)
            const usersRes = await fetch('/api/admin/users?limit=5&sortBy=createdAt&sortOrder=desc')
            if (!usersRes.ok) throw new Error('Failed to fetch users')
            const usersData = await usersRes.json()

            // Fetch pending opportunities
            const oppRes = await fetch('/api/admin/opportunities?status=PENDING_APPROVAL&limit=5&sortBy=createdAt&sortOrder=desc')
            if (!oppRes.ok) throw new Error('Failed to fetch opportunities')
            const oppData = await oppRes.json()

            // Fetch all opportunities for stats
            const allOppRes = await fetch('/api/admin/opportunities?limit=1')
            if (!allOppRes.ok) throw new Error('Failed to fetch opportunity stats')
            const allOppData = await allOppRes.json()

            // Calculate stats
            const totalUsers = usersData.pagination.total
            const pendingOpps = oppData.pagination.total
            const totalOpps = allOppData.pagination.total
            
            // Count active opportunities (you might need to fetch more pages for accurate count)
            const activeOpps = allOppData.data.filter((o: any) => o.status === 'ACTIVE').length
            const closedOpps = allOppData.data.filter((o: any) => o.status === 'CLOSED').length

            // Calculate total applications across all opportunities
            const totalApplications = allOppData.data.reduce((acc: number, opp: any) => 
                acc + (opp._count?.Application || 0), 0
            )

            return {
                stats: {
                    totalUsers,
                    opportunities: {
                        total: totalOpps,
                        pending: pendingOpps,
                        active: activeOpps,
                        closed: closedOpps
                    },
                    applications: {
                        total: totalApplications
                    },
                    recentActivity: {
                        newUsers: usersData.data.length,
                        newOpportunities: oppData.data.length,
                        newApplications: 0 // This would need a separate API call
                    }
                },
                recentUsers: usersData.data,
                pendingOpportunities: oppData.data,
                userStats: usersData.stats,
                opportunityFilters: oppData.filters
            }
        },
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000, // 5 minutes
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const res = await fetch(`/api/admin/opportunities`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    opportunityIds: [id],
                    action: 'update-status',
                    data: { status }
                })
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to update status')
            }
            return res.json()
        },
        onSuccess: (_, variables) => {
            toast.success(`Opportunity ${variables.status.toLowerCase()}`, {
                description: `The opportunity has been ${variables.status.toLowerCase()}.`
            })
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
        },
        onError: (error: Error) => {
            toast.error('Failed to update status', {
                description: error.message
            })
        }
    })

    const getRoleBadge = (role: string) => {
        const variants = {
            SUPER_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
            ADMIN: 'bg-blue-100 text-blue-700 border-blue-200',
            ATHLETE: 'bg-green-100 text-green-700 border-green-200',
            CLIENT: 'bg-amber-100 text-amber-700 border-amber-200'
        }
        return variants[role as keyof typeof variants] || 'bg-stone-100 text-stone-700'
    }

    const getStatusBadge = (status: string) => {
        const variants = {
            PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
            REJECTED: 'bg-red-100 text-red-700 border-red-200',
            ACTIVE: 'bg-blue-100 text-blue-700 border-blue-200',
            CLOSED: 'bg-stone-100 text-stone-700 border-stone-200',
            DRAFT: 'bg-stone-100 text-stone-700 border-stone-200',
            EXPIRED: 'bg-stone-100 text-stone-700 border-stone-200',
        }
        return variants[status as keyof typeof variants] || variants.PENDING
    }

    const pendingCount = data?.stats?.opportunities?.pending || 0
    const unverifiedUsers = data?.recentUsers?.filter(u => !u.isVerified).length || 0

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="container py-8 px-4 mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
                    <p className="text-stone-600 mt-1">Platform overview and management</p>
                </div>

                <div className="space-y-8">
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
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Users className="w-8 h-8 text-blue-600" />
                                </div>
                                {isLoading ? (
                                    <div className="h-9 w-20 bg-stone-200 animate-pulse rounded my-1" />
                                ) : (
                                    <div className="text-3xl font-bold mb-1">{data?.stats?.totalUsers || 0}</div>
                                )}
                                <div className="text-sm text-stone-600">Total Users</div>
                                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                    {data?.userStats?.byRole.map(stat => (
                                        <Badge key={stat.role} variant="outline" className={getRoleBadge(stat.role)}>
                                            {stat.role.replace('_', ' ')}: {stat._count}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Briefcase className="w-8 h-8 text-amber-600" />
                                </div>
                                {isLoading ? (
                                    <div className="h-9 w-20 bg-stone-200 animate-pulse rounded my-1" />
                                ) : (
                                    <div className="text-3xl font-bold mb-1">{data?.stats?.opportunities?.total || 0}</div>
                                )}
                                <div className="text-sm text-stone-600">Total Opportunities</div>
                                <div className="flex gap-2 mt-2 text-xs">
                                    <span className="text-green-600">{data?.stats?.opportunities?.active || 0} Active</span>
                                    <span className="text-stone-400">•</span>
                                    <span className="text-stone-600">{data?.stats?.opportunities?.closed || 0} Closed</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <Clock className="w-8 h-8 text-purple-600" />
                                </div>
                                {isLoading ? (
                                    <div className="h-9 w-20 bg-stone-200 animate-pulse rounded my-1" />
                                ) : (
                                    <div className="text-3xl font-bold mb-1">{pendingCount}</div>
                                )}
                                <div className="text-sm text-stone-600">Pending Approval</div>
                                <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="px-0 mt-2 h-auto text-purple-600"
                                    asChild
                                >
                                    <Link href="/dashboard/admin/opportunities?status=PENDING">Review Now →</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                {isLoading ? (
                                    <div className="h-9 w-20 bg-stone-200 animate-pulse rounded my-1" />
                                ) : (
                                    <div className="text-3xl font-bold mb-1">{unverifiedUsers}</div>
                                )}
                                <div className="text-sm text-stone-600">Unverified Users</div>
                                <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="px-0 mt-2 h-auto text-red-600"
                                    asChild
                                >
                                    <Link href="/dashboard/admin/users?status=unverified">View Unverified →</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Pending Opportunities Section */}
                    {data?.pendingOpportunities && data.pendingOpportunities.length > 0 && (
                        <Card className="border-amber-200 ring-1 ring-amber-100">
                            <CardHeader>
                                <CardTitle className="text-amber-900 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    Opportunities Requiring Approval ({pendingCount})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data.pendingOpportunities.map((opp) => (
                                        <div key={opp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-stone-50 gap-4 hover:bg-stone-100 transition-colors">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold">{opp.title}</h3>
                                                    <Badge variant="outline" className={getStatusBadge(opp.status)}>
                                                        {opp.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-stone-600">
                                                    {opp.ClientProfile?.organization || 'Unknown Organization'} • {opp.sport || 'Any Sport'} • {opp.type?.replace('_', ' ')}
                                                </p>
                                                <p className="text-xs text-stone-500 mt-1">
                                                    Posted by {opp.ClientProfile?.User.name || 'Unknown'} ({opp.ClientProfile?.User.email})
                                                </p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(opp.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{opp._count.Application} application{opp._count.Application !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                    onClick={() => updateStatusMutation.mutate({ id: opp.id, status: 'REJECTED' })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <X className="w-4 h-4 mr-1" /> Reject
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => updateStatusMutation.mutate({ id: opp.id, status: 'APPROVED' })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <Check className="w-4 h-4 mr-1" /> Approve
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/dashboard/admin/opportunities/${opp.id}`}>
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {pendingCount > 5 && (
                                        <div className="text-center pt-2">
                                            <Button variant="link" asChild>
                                                <Link href="/dashboard/admin/opportunities?status=PENDING">
                                                    View all {pendingCount} pending opportunities →
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Users */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Registrations</CardTitle>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/dashboard/admin/users">View All</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {isLoading ? (
                                        Array.from({ length: 4 }).map((_, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 w-32 bg-stone-200 animate-pulse rounded" />
                                                    <div className="h-3 w-48 bg-stone-100 animate-pulse rounded" />
                                                </div>
                                                <div className="h-6 w-16 bg-stone-200 animate-pulse rounded-full" />
                                            </div>
                                        ))
                                    ) : data?.recentUsers.length === 0 ? (
                                        <div className="text-center py-6 text-stone-500 text-sm">No recent registrations</div>
                                    ) : (
                                        data?.recentUsers.map((user) => (
                                            <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-stone-50 transition-colors px-2 -mx-2 rounded-sm">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm">{user.name || 'No name'}</p>
                                                        {!user.isVerified && (
                                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                                                Unverified
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-stone-500">{user.email}</p>
                                                    {user.AthleteProfile && (
                                                        <p className="text-xs text-stone-400 mt-1">
                                                            {user.AthleteProfile.primarySport} • {user.AthleteProfile.position}
                                                        </p>
                                                    )}
                                                    {user.ClientProfile && (
                                                        <p className="text-xs text-stone-400 mt-1">
                                                            {user.ClientProfile.organization} • {user.ClientProfile.title}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge variant="outline" className={`text-[10px] ${getRoleBadge(user.role)}`}>
                                                        {user.role.replace('_', ' ')}
                                                    </Badge>
                                                    <span className="text-[10px] text-stone-400">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Platform Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Overview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Applications Stats */}
                                <div>
                                    <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-stone-500" />
                                        Applications
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-3 bg-stone-50 rounded-lg">
                                            <p className="text-2xl font-bold">{data?.stats?.applications?.total || 0}</p>
                                            <p className="text-xs text-stone-600">Total Applications</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Opportunity Types */}
                                {data?.opportunityFilters?.types && data.opportunityFilters.types.length > 0 && (
                                    <div>
                                        <h3 className="font-medium text-sm mb-3">Opportunity Types</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.opportunityFilters.types.map((type) => (
                                                <Badge key={type} variant="outline" className="bg-stone-50">
                                                    {type.replace('_', ' ')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sports */}
                                {data?.opportunityFilters?.sports && data.opportunityFilters.sports.length > 0 && (
                                    <div>
                                        <h3 className="font-medium text-sm mb-3">Sports</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {data.opportunityFilters.sports.slice(0, 8).map((sport) => (
                                                <Badge key={sport} variant="outline" className="bg-stone-50">
                                                    {sport}
                                                </Badge>
                                            ))}
                                            {data.opportunityFilters.sports.length > 8 && (
                                                <span className="text-xs text-stone-500">
                                                    +{data.opportunityFilters.sports.length - 8} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="pt-4 border-t">
                                    <h3 className="font-medium text-sm mb-3">Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" size="sm" asChild className="justify-start">
                                            <Link href="/dashboard/admin/opportunities?status=PENDING">
                                                <FileText className="w-4 h-4 mr-2" />
                                                Review Pending
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="justify-start">
                                            <Link href="/dashboard/admin/users">
                                                <Shield className="w-4 h-4 mr-2" />
                                                Manage Users
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="justify-start">
                                            <Link href="/dashboard/admin/opportunities">
                                                <Briefcase className="w-4 h-4 mr-2" />
                                                All Opportunities
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="sm" asChild className="justify-start">
                                            <Link href="/dashboard/admin/opportunities?type=create">
                                                <Activity className="w-4 h-4 mr-2" />
                                                Create Opportunity
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Status Distribution */}
                    {data?.opportunityFilters?.statuses && data.opportunityFilters.statuses.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Opportunity Status Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {data.opportunityFilters.statuses.map((status) => (
                                        <div key={status} className="p-3 bg-stone-50 rounded-lg">
                                            <Badge variant="outline" className={getStatusBadge(status)}>
                                                {status}
                                            </Badge>
                                            <p className="text-xs text-stone-500 mt-2">
                                                Click to view all {status.toLowerCase()} opportunities
                                            </p>
                                            <Button 
                                                variant="link" 
                                                size="sm" 
                                                className="px-0 h-auto mt-1"
                                                asChild
                                            >
                                                <Link href={`/dashboard/admin/opportunities?status=${status}`}>
                                                    View →
                                                </Link>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}