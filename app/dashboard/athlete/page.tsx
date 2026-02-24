'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Briefcase,
    FileText,
    TrendingUp,
    Eye,
    Clock,
    CheckCircle2,
    XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AthleteDashboardData } from '@/app/types/athlete'
import { useMemo } from 'react'

// Pre-defined status configurations to avoid recreating on each render
const STATUS_CONFIG = {
    PENDING: { color: 'bg-yellow-500', icon: Clock },
    REVIEWING: { color: 'bg-blue-500', icon: Clock },
    SHORTLISTED: { color: 'bg-green-500', icon: CheckCircle2 },
    REJECTED: { color: 'bg-red-500', icon: XCircle },
} as const

// Stats card configuration
const STATS_CARDS = [
    { key: 'profileViews', icon: Eye, color: 'text-blue-600', label: 'Profile Views', suffix: '' },
    { key: 'activeApplications', icon: Briefcase, color: 'text-green-600', label: 'Active Applications', suffix: '' },
    { key: 'savedOpportunities', icon: FileText, color: 'text-amber-600', label: 'Saved Opportunities', suffix: '' },
    { key: 'profileCompletion', icon: TrendingUp, color: 'text-purple-600', label: 'Profile Complete', suffix: '%' },
] as const

// Skeleton components for loading states
const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
            <Card key={i}>
                <CardContent className="p-6">
                    <Skeleton className="w-8 h-8 mb-2" />
                    <Skeleton className="w-16 h-8 mb-1" />
                    <Skeleton className="w-24 h-4" />
                </CardContent>
            </Card>
        ))}
    </div>
)

const ApplicationsSkeleton = () => (
    <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <Skeleton className="w-40 h-6" />
                <Skeleton className="w-20 h-8" />
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                            <Skeleton className="w-48 h-5 mb-2" />
                            <Skeleton className="w-64 h-4 mb-2" />
                            <Skeleton className="w-32 h-3" />
                        </div>
                        <Skeleton className="w-20 h-6" />
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
)

// Main component
export default function AthleteDashboard() {
    const { data, isLoading } = useQuery<AthleteDashboardData>({
        queryKey: ['athlete-dashboard'],
        queryFn: async () => {
            const response = await fetch('/api/athlete/dashboard')
            if (!response.ok) throw new Error('Failed to fetch stats')
            return response.json()
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    // Memoize dashboard data to prevent unnecessary re-renders
    const { stats, recentApplications, recommendedOpportunities } = useMemo(() => ({
        stats: data?.stats || { profileViews: 0, activeApplications: 0, savedOpportunities: 0, profileCompletion: 0 },
        recentApplications: data?.recentApplications || [],
        recommendedOpportunities: data?.recommendedOpportunities || []
    }), [data])

    // Get status config helper
    const getStatusConfig = (status: string) => {
        return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING
    }

    return (
        <div className="container min-h-screen">
            {(isLoading) ? (
                <div className="lg:col-span-3 space-y-8">
                    <StatsSkeleton />
                    <ApplicationsSkeleton />
                </div>
                ):
                <MainContent 
                    stats={stats}
                    recentApplications={recentApplications}
                    recommendedOpportunities={recommendedOpportunities}
                    getStatusConfig={getStatusConfig}
                />
            }
        </div>
    )
}

interface MainContentProps {
    stats: AthleteDashboardData['stats']
    recentApplications: AthleteDashboardData['recentApplications']
    recommendedOpportunities: AthleteDashboardData['recommendedOpportunities']
    getStatusConfig: (status: string) => { color: string; icon: any }
}

const MainContent = ({ 
    stats, 
    recentApplications, 
    recommendedOpportunities, 
    getStatusConfig 
}: MainContentProps) => (
    <div className="lg:col-span-3 space-y-8">
        <StatsGrid stats={stats} />
        <ProfileCompletionAlert completion={stats.profileCompletion} />
        <RecentApplications applications={recentApplications} getStatusConfig={getStatusConfig} />
        <RecommendedOpportunities opportunities={recommendedOpportunities} />
    </div>
)

const StatsGrid = ({ stats }: { stats: AthleteDashboardData['stats'] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS_CARDS.map(({ key, icon: Icon, color, label, suffix = '' }) => (
            <Card key={key}>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Icon className={`w-8 h-8 ${color}`} />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                        {stats[key as keyof typeof stats]}{suffix}
                    </div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                </CardContent>
            </Card>
        ))}
    </div>
)

const ProfileCompletionAlert = ({ completion }: { completion: number }) => {
    if (completion >= 100) return null
    
    return (
        <Card className="border-amber-200 bg-linear-to-r from-amber-50 to-transparent">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">Complete Your Profile</h3>
                        <p className="text-muted-foreground mb-4">
                            Your profile is {completion}% complete. Complete your profile to increase visibility to recruiters.
                        </p>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700" asChild>
                            <Link href="/dashboard/athlete/profile">Complete Profile</Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const RecentApplications = ({ 
    applications, 
    getStatusConfig 
}: { 
    applications: AthleteDashboardData['recentApplications']
    getStatusConfig: (status: string) => { color: string; icon: any }
}) => (
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
                {applications.length > 0 ? (
                    applications.map((application) => {
                        const { color, icon: Icon } = getStatusConfig(application.status)
                        return (
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
                                <Badge className={`${color} flex items-center gap-1 text-white`}>
                                    <Icon className="w-3 h-3" />
                                    {application.status}
                                </Badge>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-muted-foreground text-center py-8">
                        No applications yet. Start applying to opportunities!
                    </p>
                )}
            </div>
        </CardContent>
    </Card>
)

const RecommendedOpportunities = ({ opportunities }: { opportunities: AthleteDashboardData['recommendedOpportunities'] }) => (
    <Card>
        <CardHeader>
            <CardTitle>Recommended for You</CardTitle>
        </CardHeader>
        <CardContent>
            {opportunities.length > 0 ? (
                <div className="space-y-4">
                    {opportunities.map((opp) => (
                        <div key={opp.id} className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-stone-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <h3 className="font-semibold">{opp.title}</h3>
                                <Badge variant="outline">{opp.type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {opp.organization} • {opp.location}
                            </p>
                            <Button variant="outline" size="sm" asChild className="self-start mt-2">
                                <Link href={`/opportunities/${opp.id}`}>View Details</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground text-center py-8">
                    No recommendations available right now. Check out open opportunities!
                </p>
            )}
        </CardContent>
    </Card>
)