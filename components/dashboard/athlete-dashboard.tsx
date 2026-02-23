'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    User,
    Briefcase,
    FileText,
    Settings,
    TrendingUp,
    Eye,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react'
import Link from 'next/link'

import { useQuery } from '@tanstack/react-query'
import { AthleteDashboardData } from '@/app/types/athlete'

export function AthleteDashboard() {
    const { data: dashboardData, isLoading: loading } = useQuery<AthleteDashboardData>({
        queryKey: ['athlete-dashboard'],
        queryFn: async () => {
            const response = await fetch('/api/athlete/dashboard')
            if (!response.ok) throw new Error('Failed to fetch stats')
            return response.json()
        }
    })

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>
    }

    const { stats, recentApplications: applications, recommendedOpportunities: recommendations } = dashboardData || {
        stats: { profileViews: 0, activeApplications: 0, savedOpportunities: 0, profileCompletion: 0 },
        recentApplications: [],
        recommendedOpportunities: []
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500'
            case 'REVIEWING':
                return 'bg-blue-500'
            case 'SHORTLISTED':
                return 'bg-green-500'
            case 'REJECTED':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SHORTLISTED':
                return <CheckCircle2 className="w-4 h-4" />
            case 'REJECTED':
                return <XCircle className="w-4 h-4" />
            default:
                return <Clock className="w-4 h-4" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-white">
            {/* Header */}
            <section className="bg-gradient-to-br from-stone-900 to-black text-white py-12">
                <div className="container">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Athlete Dashboard</h1>
                            <p className="text-white/80">Welcome back! Here&apos;s your recruitment overview.</p>
                        </div>
                        <Button variant="outline" className="text-white border-white hover:bg-white/10" asChild>
                            <Link href="/dashboard/athlete/profile">
                                <User className="w-4 h-4 mr-2" />
                                View Profile
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
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/athlete/profile">
                                        <Button variant="ghost" className="w-full justify-start">
                                            <User className="w-4 h-4 mr-2" />
                                            My Profile
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/athlete/applications">
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            Applications
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/athlete/saved">
                                        <Button variant="ghost" className="w-full justify-start">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Saved Opportunities
                                        </Button>
                                    </Link>
                                    <Link href="/dashboard/athlete/settings">
                                        <Button variant="ghost" className="w-full justify-start">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </Button>
                                    </Link>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Eye className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{stats.profileViews}</div>
                                    <div className="text-sm text-muted-foreground">Profile Views</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <Briefcase className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{stats.activeApplications}</div>
                                    <div className="text-sm text-muted-foreground">Active Applications</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <FileText className="w-8 h-8 text-amber-600" />
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{stats.savedOpportunities}</div>
                                    <div className="text-sm text-muted-foreground">Saved Opportunities</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <TrendingUp className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{stats.profileCompletion}%</div>
                                    <div className="text-sm text-muted-foreground">Profile Complete</div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Profile Completion Alert */}
                        {stats.profileCompletion < 100 && (
                            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-transparent">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">Complete Your Profile</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Your profile is {stats.profileCompletion}% complete. Complete your profile to increase visibility to recruiters.
                                            </p>
                                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700" asChild>
                                                <Link href="/dashboard/athlete/profile">Complete Profile</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recent Applications */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Recent Applications</CardTitle>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/dashboard/athlete/applications">View All</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {applications.map((application) => (
                                        <div
                                            key={application.id}
                                            className="flex items-start justify-between p-4 border rounded-lg hover:bg-stone-50 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-semibold mb-1">{application.title}</h3>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {application.organization} • {application.location}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Applied {application.appliedDate}</span>
                                                </div>
                                            </div>
                                            <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                                                {getStatusIcon(application.status)}
                                                {application.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recommended Opportunities */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recommended for You</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recommendations.length > 0 ? (
                                    <div className="space-y-4">
                                        {recommendations.map((opp) => (
                                            <div key={opp.id} className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-stone-50 transition-colors">
                                                <div className="flex justify-between">
                                                    <h3 className="font-semibold">{opp.title}</h3>
                                                    <Badge>{opp.type}</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{opp.organization} • {opp.location}</p>
                                                <Button variant="outline" size="sm" asChild className="self-start mt-2">
                                                    <Link href={`/dashboard/athlete/opportunities/${opp.id}`}>View Details</Link>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">
                                        No recommendations available right now. Look at open opportunities to see more.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
