'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Opportunity } from '@/app/types/athlete'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Briefcase, MapPin, Building, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function AthleteOpportunitiesPage() {
    const [search, setSearch] = useState('')
    const [sport, setSport] = useState('All')

    // State for the actual applied search to pass to useQuery
    const [appliedFilters, setAppliedFilters] = useState({ search: '', sport: 'All' })

    const { data: opportunities = [], isLoading: loading } = useQuery<Opportunity[]>({
        queryKey: ['athlete-opportunities', appliedFilters],
        queryFn: async () => {
            const queryParams = new URLSearchParams()
            if (appliedFilters.search) queryParams.append('search', appliedFilters.search)
            if (appliedFilters.sport !== 'All') queryParams.append('sport', appliedFilters.sport)

            const response = await fetch(`/api/athlete/opportunities?${queryParams.toString()}`)
            if (!response.ok) throw new Error('Failed to fetch opportunities')
            return response.json()
        }
    })

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setAppliedFilters({ search, sport })
    }

    return (
        <div className="min-h-screen bg-stone-50 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">Explore Opportunities</h1>

                {/* Search & Filter */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by keyword, location, or organization..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="w-full md:w-48">
                                <Select value={sport} onValueChange={setSport}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sport" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Sports</SelectItem>
                                        <SelectItem value="Basketball">Basketball</SelectItem>
                                        <SelectItem value="Football">Football</SelectItem>
                                        <SelectItem value="Soccer">Soccer</SelectItem>
                                        <SelectItem value="Baseball">Baseball</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit">Search</Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-12">Loading opportunities...</div>
                ) : opportunities.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No opportunities found matching your criteria.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {opportunities.map((opp) => (
                            <Card key={opp.id} className="flex flex-col hover:border-black transition-colors">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline">{opp.sport}</Badge>
                                        <Badge>{opp.type}</Badge>
                                    </div>
                                    <CardTitle className="text-xl">{opp.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1">
                                        <Building className="w-3 h-3" /> {opp.client.organization}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-between">
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4" /> {opp.location}
                                        </div>
                                        {/* Add more info later here */}
                                        {opp.salaryMin && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Briefcase className="w-4 h-4" /> ${opp.salaryMin.toLocaleString()} {opp.salaryMax ? `- $${opp.salaryMax.toLocaleString()}` : '+'}
                                            </div>
                                        )}
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
