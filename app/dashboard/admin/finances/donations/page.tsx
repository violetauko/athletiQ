'use client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table"
import { formatCurrency, getInitials, getStatusBadge } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Search, Filter, Calendar, MoreHorizontal, Eye, Download, XCircle, RefreshCw } from "lucide-react"
import { Button } from '@/components/ui/button'
import { DonationDetailsModal } from "@/components/donations/donation-details-modal"
import { useState } from "react"
import { Donation, PaginatedResponse } from "@/lib/types/types"
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"


export default function DonationsPage() {

    // Donations state
    const [donationSearch, setDonationSearch] = useState('')
    const [donationStatusFilter, setDonationStatusFilter] = useState<string>('ALL')
    const [donationTierFilter, setDonationTierFilter] = useState<string>('ALL')
    const [donationDateRange, setDonationDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all')
    const [donationPage, setDonationPage] = useState(1)
    // Modals state
    const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)

    // Fetch donations with pagination
    const {
        data: donationsData,
        isLoading: donationsLoading,
        // refetch: refetchDonations
    } = useQuery<PaginatedResponse<Donation>>({
        queryKey: ['admin-donations', donationStatusFilter, donationTierFilter, donationDateRange, donationPage],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (donationStatusFilter !== 'ALL') params.append('status', donationStatusFilter)
            if (donationTierFilter !== 'ALL') params.append('tierId', donationTierFilter)
            if (donationDateRange !== 'all') params.append('dateRange', donationDateRange)
            params.append('page', donationPage.toString())
            params.append('limit', '20')
            if (donationSearch) params.append('search', donationSearch)

            const response = await fetch(`/api/admin/donations?${params}`)
            if (!response.ok) throw new Error('Failed to fetch donations')
            return response.json()
        },
        staleTime: 5 * 60 * 1000,
    })

    const donations = donationsData?.items || []
    const donationPagination = donationsData?.pagination
    const donationStats = donationsData?.stats

    const getTierBadge = (tierId: string, isCustom: boolean) => {
        if (isCustom) return <Badge variant="outline">Custom</Badge>

        const tiers: Record<string, { label: string, className: string }> = {
            champion: { label: 'Champion', className: 'bg-yellow-100 text-yellow-800' },
            supporter: { label: 'Supporter', className: 'bg-blue-100 text-blue-800' },
            mvp: { label: 'MVP', className: 'bg-purple-100 text-purple-800' },
            legend: { label: 'Legend', className: 'bg-orange-100 text-orange-800' },
        }

        const tier = tiers[tierId]
        return tier ? (
            <Badge className={tier.className}>{tier.label}</Badge>
        ) : (
            <Badge variant="outline">{tierId}</Badge>
        )
    }
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Donations Management</CardTitle>
                    <CardDescription>
                        View and manage all donation transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Donations Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search by name, email, or ID..."
                                value={donationSearch}
                                onChange={(e) => {
                                    setDonationSearch(e.target.value)
                                    setDonationPage(1)
                                }}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Select value={donationStatusFilter} onValueChange={(value) => {
                                setDonationStatusFilter(value)
                                setDonationPage(1)
                            }}>
                                <SelectTrigger className="w-32.5">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Status</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={donationTierFilter} onValueChange={(value) => {
                                setDonationTierFilter(value)
                                setDonationPage(1)
                            }}>
                                <SelectTrigger className="w-32.5">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Tier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Tiers</SelectItem>
                                    <SelectItem value="champion">Champion</SelectItem>
                                    <SelectItem value="supporter">Supporter</SelectItem>
                                    <SelectItem value="mvp">MVP</SelectItem>
                                    <SelectItem value="legend">Legend</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={donationDateRange} onValueChange={(value: typeof donationDateRange) => {
                                setDonationDateRange(value)
                                setDonationPage(1)
                            }}>
                                <SelectTrigger className="w-32.5">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Date Range" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Donations Table */}
                    {donationsLoading ? (
                        <DonationsTableSkeleton />
                    ) : (
                        <>
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Donor</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Commission (20%)</TableHead>
                                            <TableHead>Tier</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {donations.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                    No donations found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            donations.map((donation) => (
                                                <TableRow key={donation.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="text-xs bg-stone-200">
                                                                    {getInitials(donation.donorName??'anonymous', donation.donorEmail??'anonymous')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {donation.donorName || 'Anonymous'}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {donation.donorEmail || 'No email'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {donation.status === 'PAID' ? (
                                                            formatCurrency(donation.amount, donation.currency, false)
                                                        ) : donation.status === 'REFUNDED' ? (
                                                            <span>
                                                                {formatCurrency(donation.amount, donation.currency, false)}
                                                                <span className="block text-xs font-normal text-muted-foreground">Refunded</span>
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">
                                                                {formatCurrency(donation.amount, donation.currency, false)}
                                                                <span className="block text-xs font-normal normal-case">Not collected</span>
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm font-medium">
                                                        {donation.status === 'PAID' ? (
                                                            formatCurrency(donation.amount * 0.20, donation.currency, false)
                                                        ) : (
                                                            <span className="text-muted-foreground">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {getTierBadge(donation.tierId, donation.isCustom)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusBadge(donation.status)}>
                                                            {donation.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {formatDate(donation.createdAt)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => {
                                                                    setSelectedDonation(donation)
                                                                    setIsDonationModalOpen(true)
                                                                }}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                {donation.status === 'PAID' && (
                                                                    <DropdownMenuItem>
                                                                        <Download className="mr-2 h-4 w-4" />
                                                                        Download Receipt
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator />
                                                                {donation.status === 'PENDING' && (
                                                                    <DropdownMenuItem className="text-red-600">
                                                                        <XCircle className="mr-2 h-4 w-4" />
                                                                        Mark as Failed
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {donation.status === 'PAID' && (
                                                                    <DropdownMenuItem className="text-purple-600">
                                                                        <RefreshCw className="mr-2 h-4 w-4" />
                                                                        Process Refund
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Donations Pagination */}
                            {donationPagination && donationPagination.totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-4 border-t mt-4">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {((donationPagination.page - 1) * donationPagination.limit) + 1} to{' '}
                                        {Math.min(donationPagination.page * donationPagination.limit, donationPagination.totalCount)} of{' '}
                                        {donationPagination.totalCount} donations
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDonationPage(p => Math.max(1, p - 1))}
                                            disabled={!donationPagination.hasPrevPage}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setDonationPage(p => p + 1)}
                                            disabled={!donationPagination.hasNextPage}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
            {/* Modals */}
            <DonationDetailsModal
                donation={selectedDonation}
                isOpen={isDonationModalOpen}
                onClose={() => {
                    setIsDonationModalOpen(false)
                    setSelectedDonation(null)
                }}
            />
        </div>
    )
}

// Skeleton Components
function DonationsTableSkeleton() {
    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Donor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div>
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-24 mt-1" />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell className="text-right">
                                <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}


