'use client'

import { useQuery } from '@tanstack/react-query'
import { Application } from '@/app/types/athlete'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, XCircle, Building, MapPin } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

export default function AthleteApplicationsPage() {
    const { data: applications = [], isLoading: loading } = useQuery<Application[]>({
        queryKey: ['athlete-applications'],
        queryFn: async () => {
            const response = await fetch('/api/athlete/applications')
            if (!response.ok) throw new Error('Failed to fetch applications')
            return response.json()
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500'
            case 'REVIEWING': return 'bg-blue-500'
            case 'SHORTLISTED': return 'bg-green-500'
            case 'INTERVIEWED': return 'bg-indigo-500'
            case 'ACCEPTED': return 'bg-emerald-500'
            case 'REJECTED': return 'bg-red-500'
            case 'WITHDRAWN': return 'bg-gray-500'
            default: return 'bg-gray-500'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SHORTLISTED': case 'ACCEPTED': return <CheckCircle2 className="w-4 h-4" />
            case 'REJECTED': case 'WITHDRAWN': return <XCircle className="w-4 h-4" />
            default: return <Clock className="w-4 h-4" />
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 py-8">
            <div className="container mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold mb-6">My Applications</h1>

                {loading ? (
                    <ApplicationsSkeleton/>
                ) : applications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
                        <p>You haven&apos;t applied to any opportunities yet.</p>
                        <Button asChild>
                            <Link href="/dashboard/athlete/opportunities">Explore Opportunities</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <Card key={app.id} className="hover:border-black transition-colors">
                                <CardContent className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline">{app.opportunity.sport}</Badge>
                                            <Badge>{app.opportunity.type}</Badge>
                                        </div>
                                        <h3 className="text-xl font-semibold">{app.opportunity.title}</h3>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {app.opportunity.client.organization}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {app.opportunity.location}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 min-w-50">
                                        <Badge className={`${getStatusColor(app.status)} flex items-center gap-1.5 px-3 py-1 text-sm`}>
                                            {getStatusIcon(app.status)}
                                            {app.status}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            Applied: {new Date(app.appliedAt).toLocaleDateString()}
                                        </span>
                                        <Button variant="outline" size="sm" asChild className="w-full">
                                            <Link href={`/dashboard/athlete/opportunities/${app.opportunityId}`}>View Listing</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
const ApplicationsSkeleton = () => (
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