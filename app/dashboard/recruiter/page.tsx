// app/client/dashboard/page.tsx (Server Component)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Briefcase,
    MessageSquare,
    TrendingUp,
    Award,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react'
import { notFound } from 'next/navigation'
import { DashboardCharts } from '@/components/dashboard/client/dashboard-chart'

import { auth } from '@/auth'
import { getClientDashboardData } from '@/lib/dashboard'


export default async function ClientDashboardPage() {
    const session = await auth()

    if (!session?.user?.id) {
        notFound()
    }

    const data = await getClientDashboardData(session.user.id)

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
                    <p className="text-muted-foreground">Please try refreshing the page</p>
                </div>
            </div>
        )
    }

    const { stats, opportunities, applications, messages, applicationTrends, categoryDistribution } = data

    return (
        <div className="min-h-screen bg-stone-50">
            <div className="container py-8 space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Client Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's an overview of your recruitment activity.
                    </p>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-white">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                                    Active
                                </Badge>
                            </div>
                            <div className="space-y-1 flex items-center justify-between space-x-4 md:flex-col md:items-start">
                                <h3 className="text-3xl font-bold tracking-tight">{stats.activeListings}</h3>
                                <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">Active Listings</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                                <span className="text-stone-400">Total: {stats.totalOpportunities}</span>
                                <span className="text-blue-600 font-medium">{stats.draftListings} drafts</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-white">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-600"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                                    <Users className="w-6 h-6 text-green-600" />
                                </div>
                                <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-none">
                                    {stats.newApplications} New
                                </Badge>
                            </div>
                            <div className="space-y-1 flex items-center justify-between space-x-4 md:flex-col md:items-start">
                                <h3 className="text-3xl font-bold tracking-tight">{stats.totalApplicants}</h3>
                                <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">Total Applicants</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                                <span className="text-stone-400">Reviewed: {stats.reviewedApplications}</span>
                                <span className="text-green-600 font-medium">{stats.shortlistedApplications} shortlisted</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-white">
                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                                    <MessageSquare className="w-6 h-6 text-purple-600" />
                                </div>
                                {stats.unreadMessages > 0 && (
                                    <Badge className="bg-purple-600 text-white border-none animate-pulse">
                                        {stats.unreadMessages} Unread
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-1 flex items-center justify-between space-x-4 md:flex-col md:items-start">
                                <h3 className="text-3xl font-bold tracking-tight">{stats.totalMessages}</h3>
                                <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">Total Messages</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                                <span className="text-stone-400">Response Rate: 98%</span>
                                <span className="text-purple-600 font-medium">{stats.averageResponseTime} avg</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-none bg-white">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-600"></div>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-amber-600" />
                                </div>
                                <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-none">
                                    {stats.successRate}% rate
                                </Badge>
                            </div>
                            <div className="space-y-1 flex items-center justify-between space-x-4 md:flex-col md:items-start">
                                <h3 className="text-3xl font-bold tracking-tight">{stats.applicationRate}/opp</h3>
                                <p className="text-sm font-medium text-stone-500 uppercase tracking-wider">Avg Applications</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                                <span className="text-stone-400">Interview: {stats.interviewRate}%</span>
                                <span className="text-amber-600 font-medium">Trending Up</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <DashboardCharts
                    applicationTrends={applicationTrends}
                    categoryDistribution={categoryDistribution}
                    stats={stats}
                />

                {/* Application Status Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Application Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <span className="text-sm">New Applications</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{stats.newApplications}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {Math.round((stats.newApplications / stats.totalApplicants) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-stone-200 rounded-full h-2">
                                    <div
                                        className="bg-amber-500 h-2 rounded-full"
                                        style={{ width: `${(stats.newApplications / stats.totalApplicants) * 100}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <span className="text-sm">Reviewed</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{stats.reviewedApplications}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {Math.round((stats.reviewedApplications / stats.totalApplicants) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-stone-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${(stats.reviewedApplications / stats.totalApplicants) * 100}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        <span className="text-sm">Shortlisted</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{stats.shortlistedApplications}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {Math.round((stats.shortlistedApplications / stats.totalApplicants) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-stone-200 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full"
                                        style={{ width: `${(stats.shortlistedApplications / stats.totalApplicants) * 100}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <span className="text-sm">Rejected</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">{stats.rejectedApplications}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {Math.round((stats.rejectedApplications / stats.totalApplicants) * 100)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-stone-200 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full"
                                        style={{ width: `${(stats.rejectedApplications / stats.totalApplicants) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Recent Applications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {applications.length > 0 ? (
                                    applications.map((app: any) => (
                                        <div key={app.id} className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg">
                                            <div className="w-10 h-10 rounded-full bg-stone-200 overflow-hidden flex-shrink-0">
                                                {app.athlete?.profileImage ? (
                                                    <img
                                                        src={app.athlete.profileImage}
                                                        alt={`${app.athlete.firstName} ${app.athlete.lastName}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-stone-300 flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-stone-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">
                                                    {app.athlete?.firstName} {app.athlete?.lastName}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    Applied to {app.opportunity?.title}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                        app.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' :
                                                            app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No recent applications
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium">Acceptance Rate</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.successRate}%</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-medium">Response Time</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.averageResponseTime}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-medium">Draft Listings</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.draftListings}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-xs font-medium">Expired</span>
                        </div>
                        <div className="text-2xl font-bold">{stats.expiredListings}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
