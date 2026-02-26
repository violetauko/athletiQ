'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Opportunity } from '@/app/types/athlete'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
    Search, 
    MapPin, 
    Building, 
    Calendar, 
    Bookmark, 
    BookmarkCheck,
    Eye,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    MoreHorizontal,
    FileText,
    Share2,
    Clock
} from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function AthleteOpportunitiesPage() {
    const [search, setSearch] = useState('')
    const [sport, setSport] = useState('All')
    const [sortField, setSortField] = useState<string>('postedDate')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

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
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setAppliedFilters({ search, sport })
        setCurrentPage(1) // Reset to first page on new search
    }

    // Sort opportunities
    const sortedOpportunities = [...opportunities].sort((a, b) => {
        let aValue: any = a[sortField as keyof Opportunity]
        let bValue: any = b[sortField as keyof Opportunity]

        // Handle nested fields
        if (sortField === 'organization') {
            aValue = a.client?.organization
            bValue = b.client?.organization
        }

        // Handle dates
        if (sortField === 'postedDate' || sortField === 'deadline') {
            aValue = aValue ? new Date(aValue).getTime() : 0
            bValue = bValue ? new Date(bValue).getTime() : 0
        }

        // Handle strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc' 
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue)
        }

        // Handle numbers
        return sortDirection === 'asc' 
            ? (aValue || 0) - (bValue || 0)
            : (bValue || 0) - (aValue || 0)
    })

    // Pagination
    const totalPages = Math.ceil(sortedOpportunities.length / itemsPerPage)
    const paginatedOpportunities = sortedOpportunities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    const handleSave = async (opportunityId: string, e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a link
        e.stopPropagation()
        
        try {
            const response = await fetch(`/api/athlete/opportunities/${opportunityId}/save`, {
                method: 'POST'
            })
            if (!response.ok) throw new Error('Failed to toggle save')
            // Invalidate queries or update local state here
            // This would typically trigger a refetch or optimistic update
        } catch (error) {
            console.error('Error saving opportunity:', error)
        }
    }

    const handleShare = (opportunity: Opportunity, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        // Share functionality - could open a modal or use Web Share API
        if (navigator.share) {
            navigator.share({
                title: opportunity.title,
                text: `Check out this ${opportunity.sport} opportunity at ${opportunity.client?.organization}`,
                url: window.location.origin + `/dashboard/athlete/opportunities/${opportunity.id}`,
            }).catch(console.error)
        } else {
            // Fallback - copy to clipboard
            navigator.clipboard.writeText(
                window.location.origin + `/dashboard/athlete/opportunities/${opportunity.id}`
            )
            alert('Link copied to clipboard!')
        }
    }

    return (
        <div className="min-h-screen pb-8">
            <div className="container mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Explore Opportunities</h1>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/athlete/saved">
                            <Bookmark className="w-4 h-4 mr-2" />
                            Saved Opportunities
                        </Link>
                    </Button>
                </div>

                {/* Search & Filter */}
                <Card className="mb-2">
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

                {/* Results Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Available Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <OpportunityTableSkeleton />
                        ) : paginatedOpportunities.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No opportunities found matching your criteria.
                            </div>
                        ) : (
                            <>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-75">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort('title')}
                                                        className="font-semibold hover:bg-transparent"
                                                    >
                                                        Title
                                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort('organization')}
                                                        className="font-semibold hover:bg-transparent"
                                                    >
                                                        Organization
                                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead>Sport</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort('postedDate')}
                                                        className="font-semibold hover:bg-transparent"
                                                    >
                                                        Posted
                                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead>
                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => handleSort('deadline')}
                                                        className="font-semibold hover:bg-transparent"
                                                    >
                                                        Deadline
                                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedOpportunities.map((opp) => (
                                                <TableRow key={opp.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">
                                                        <Link 
                                                            href={`/dashboard/athlete/opportunities/${opp.id}`}
                                                            className="hover:text-primary hover:underline"
                                                        >
                                                            {opp.title}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Building className="w-3 h-3 text-muted-foreground" />
                                                            {opp.client?.organization}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">{opp.sport}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge>{opp.type}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-muted-foreground" />
                                                            {opp.location}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 text-muted-foreground" />
                                                            {new Date(opp.postedDate).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {opp.deadline ? (
                                                            <div className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                                                {new Date(opp.deadline).toLocaleDateString()}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                Open
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem asChild>
                                                                    <Link 
                                                                        href={`/dashboard/athlete/opportunities/${opp.id}`}
                                                                        className="flex items-center cursor-pointer"
                                                                    >
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link 
                                                                        href={`/dashboard/athlete/opportunities/${opp.id}/apply`}
                                                                        className="flex items-center cursor-pointer"
                                                                    >
                                                                        <FileText className="mr-2 h-4 w-4" />
                                                                        Apply Now
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={(e) => handleSave(opp.id, e)}>
                                                                    <Bookmark className="mr-2 h-4 w-4" />
                                                                    Save Opportunity
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={(e) => handleShare(opp, e)}>
                                                                    <Share2 className="mr-2 h-4 w-4" />
                                                                    Share
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between space-x-2 py-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedOpportunities.length)} of {sortedOpportunities.length} opportunities
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

const OpportunityTableSkeleton = () => (
    <div className="space-y-4">
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Sport</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4 w-50" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-37.5" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-15" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-30" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-25" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-25" /></TableCell>
                            <TableCell className="text-right">
                                <Skeleton className="h-8 w-8 rounded ml-auto" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    </div>
)