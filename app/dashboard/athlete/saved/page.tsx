'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Opportunity } from '@/app/types/athlete'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building, MapPin, BookmarkMinus } from 'lucide-react'
import Link from 'next/link'

export default function AthleteSavedOpportunitiesPage() {
    const queryClient = useQueryClient()

    const { data: opportunities = [], isLoading: loading } = useQuery<Opportunity[]>({
        queryKey: ['saved-opportunities'],
        queryFn: async () => {
            const response = await fetch('/api/athlete/saved')
            if (!response.ok) throw new Error('Failed to fetch saved opportunities')
            return response.json()
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,

    })

    const unsaveMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await fetch(`/api/athlete/opportunities/${id}/save`, { method: 'POST' })
            if (!response.ok) throw new Error('Failed to unsave')
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-opportunities'] })
            queryClient.invalidateQueries({ queryKey: ['athlete-dashboard'] })
        }
    })

    const handleUnsave = (id: string, e: React.MouseEvent) => {
        e.preventDefault()
        unsaveMutation.mutate(id)
    }

    return (
        <div className="min-h-screen w-full ps-3 pt-4 pb-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">Saved Opportunities</h1>

                {loading ? (
                    <div className="text-center py-12">Loading saved opportunities...</div>
                ) : opportunities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
                        <p>You haven&apos;t saved any opportunities yet.</p>
                        <Button asChild>
                            <Link href="/dashboard/athlete/opportunities">Explore Opportunities</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {opportunities.map((opp) => (
                            <Card key={opp.id} className="flex flex-col hover:border-black transition-colors relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-red-500"
                                    onClick={(e) => handleUnsave(opp.id, e)}
                                    title="Remove from saved"
                                >
                                    <BookmarkMinus className="w-5 h-5" />
                                </Button>
                                <CardHeader className="pt-8">
                                    <div className="flex justify-start items-center gap-2 mb-2">
                                        <Badge variant="outline">{opp.sport}</Badge>
                                        <Badge variant="secondary">{opp.status}</Badge>
                                    </div>
                                    <CardTitle className="text-xl pr-6">{opp.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Building className="w-3 h-3" /> {opp.client?.organization}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4" /> {opp.location}
                                        </div>
                                    </div>
                                    <Button className="w-full" asChild>
                                        <Link href={`/dashboard/athlete/opportunities/${opp.id}`}>View Details</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
