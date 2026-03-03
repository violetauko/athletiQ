// 'use client'

// import { Card, CardContent } from '@/components/ui/card'
// import {
//     Users,
//     Briefcase,
//     MessageSquare,
//     Loader2,
//     // Settings,
//     // CheckCircle2
// } from 'lucide-react'
// import { useQuery } from '@tanstack/react-query'


// export default function ClientDashboard() {
//     // Data Fetching
//     const { data: opportunities = [], isLoading: oppsLoading } = useQuery({
//         queryKey: ['client-opportunities'],
//         queryFn: async () => {
//             const res = await fetch('/api/client/opportunities')
//             if (!res.ok) throw new Error('Failed to fetch opportunities')
//             return res.json()
//         },
//         staleTime: 1000 * 60 * 10
//     })

//     const { data: applications = [], isLoading: appsLoading } = useQuery({
//         queryKey: ['client-applications'],
//         queryFn: async () => {
//             const res = await fetch('/api/client/applications')
//             if (!res.ok) throw new Error('Failed to fetch applications')
//             return res.json()
//         },
//         staleTime: 1000 * 60 * 10
//     })

//     const { data: messages = [], isLoading: msgsLoading } = useQuery({
//         queryKey: ['client-messages'],
//         queryFn: async () => {
//             const res = await fetch('/api/client/messages')
//             if (!res.ok) throw new Error('Failed to fetch messages')
//             return res.json()
//         }
//     })



//     const isLoading = oppsLoading || appsLoading || msgsLoading

//     const stats = {
//         activeListings: opportunities.filter((o: any) => o.status === 'ACTIVE').length,
//         pendingListings: opportunities.filter((o: any) => o.status === 'DRAFT' || o.status === 'PENDING_APPROVAL').length,
//         totalApplicants: applications.length,
//         newMessages: messages.filter((m: any) => !m.isRead).length,
//     }


//     return (
//         <div className="min-h-screen">
//             {/* Main Content Area */}
//             <div className="lg:col-span-3 space-y-8">
//                 {isLoading ? (
//                     <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>
//                 ) : (
//                     <>
//                         {/* {activeTab === 'overview' && ( */}
//                         <div className="space-y-6">
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                                 <Card>
//                                     <CardContent className="p-6">
//                                         <Briefcase className="w-8 h-8 text-blue-600 mb-2" />
//                                         <div className="text-3xl font-bold mb-1">{stats.activeListings}</div>
//                                         <div className="text-sm text-muted-foreground">Active Listings</div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardContent className="p-6">
//                                         <Loader2 className="w-8 h-8 text-amber-600 mb-2" />
//                                         <div className="text-3xl font-bold mb-1">{stats.pendingListings}</div>
//                                         <div className="text-sm text-muted-foreground">Pending Approval</div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardContent className="p-6">
//                                         <Users className="w-8 h-8 text-green-600 mb-2" />
//                                         <div className="text-3xl font-bold mb-1">{stats.totalApplicants}</div>
//                                         <div className="text-sm text-muted-foreground">Total Applicants</div>
//                                     </CardContent>
//                                 </Card>
//                                 <Card>
//                                     <CardContent className="p-6">
//                                         <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
//                                         <div className="text-3xl font-bold mb-1">{stats.newMessages}</div>
//                                         <div className="text-sm text-muted-foreground">Unread Messages</div>
//                                     </CardContent>
//                                 </Card>
//                             </div>
//                         </div>

//                     </>
//                 )}
//             </div>

//             {/* <ApplicationModal
//                 isOpen={!!selectedApp}
//                 onClose={() => setSelectedApp(null)}
//                 application={selectedApp}
//             /> */}

//         </div>
//     )
// }
// app/client/dashboard/page.tsx (Server Component)
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Users,
    Briefcase,
    MessageSquare,
    TrendingUp,
    Calendar,
    Award,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react'
import { notFound } from 'next/navigation'
import DashboardCharts from '@/components/dashboard/client/dashboard-chart'

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Briefcase className="w-10 h-10 text-blue-600 bg-blue-100 p-2 rounded-lg" />
                                <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                    Active
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stats.activeListings}</div>
                            <div className="text-sm text-muted-foreground">Active Listings</div>
                            <div className="mt-3 text-xs text-green-600">
                                +{stats.totalOpportunities - stats.activeListings} pending/draft
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <Users className="w-10 h-10 text-green-600 bg-green-100 p-2 rounded-lg" />
                                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    Total
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stats.totalApplicants}</div>
                            <div className="text-sm text-muted-foreground">Total Applicants</div>
                            <div className="mt-3 flex gap-2 text-xs">
                                <span className="text-amber-600">{stats.newApplications} new</span>
                                <span className="text-blue-600">{stats.shortlistedApplications} shortlisted</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <MessageSquare className="w-10 h-10 text-purple-600 bg-purple-100 p-2 rounded-lg" />
                                <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                    Unread: {stats.unreadMessages}
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stats.totalMessages}</div>
                            <div className="text-sm text-muted-foreground">Total Messages</div>
                            <div className="mt-3 text-xs text-muted-foreground">
                                Avg response: {stats.averageResponseTime}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <TrendingUp className="w-10 h-10 text-amber-600 bg-amber-100 p-2 rounded-lg" />
                                <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                                    Success: {stats.successRate}%
                                </span>
                            </div>
                            <div className="text-3xl font-bold mb-1">{stats.applicationRate}/opp</div>
                            <div className="text-sm text-muted-foreground">Avg Applications</div>
                            <div className="mt-3 flex gap-2 text-xs">
                                <span className="text-green-600">{stats.interviewRate}% interview</span>
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
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        app.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                        app.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' :
                                                        app.status === 'SHORTLISTED' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(app.createdAt).toLocaleDateString()}
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
