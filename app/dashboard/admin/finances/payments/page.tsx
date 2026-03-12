'use client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from '@/components/ui/table'
import { PaginatedResponse, Payment } from '@/lib/types/types'
import { formatCurrency, formatDate, getInitials, getStatusBadge } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, CreditCard, Calendar, MoreHorizontal, Eye, Download, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PaymentDetailsModal } from '@/components/payments/payment-details-modal'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

export default function PaymentsPage(){
  // Payments state
  const [paymentSearch, setPaymentSearch] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL')
  const [paymentProviderFilter, setPaymentProviderFilter] = useState<string>('ALL')
  const [paymentDateRange, setPaymentDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [paymentPage, setPaymentPage] = useState(1)

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

 // Fetch payments with pagination
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
  } = useQuery<PaginatedResponse<Payment>>({
    queryKey: ['admin-payments', paymentStatusFilter, paymentProviderFilter, paymentDateRange, paymentPage],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (paymentStatusFilter !== 'ALL') params.append('status', paymentStatusFilter)
      if (paymentProviderFilter !== 'ALL') params.append('provider', paymentProviderFilter)
      if (paymentDateRange !== 'all') params.append('dateRange', paymentDateRange)
      params.append('page', paymentPage.toString())
      params.append('limit', '10')
      if (paymentSearch) params.append('search', paymentSearch)

      const response = await fetch(`/api/admin/payments?${params}`)
      if (!response.ok) throw new Error('Failed to fetch payments')
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  const payments = paymentsData?.items || []
  const paymentPagination = paymentsData?.pagination
  const paymentStats = paymentsData?.stats

  return (
    <div className='w-full'>
            <Card>
              <CardHeader>
                <CardTitle>Payments Management</CardTitle>
                <CardDescription>
                  View and manage all payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Payments Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by user, ID, or reference..."
                      value={paymentSearch}
                      onChange={(e) => {
                        setPaymentSearch(e.target.value)
                        setPaymentPage(1)
                      }}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={paymentStatusFilter} onValueChange={(value) => {
                      setPaymentStatusFilter(value)
                      setPaymentPage(1)
                    }}>
                      <SelectTrigger className="w-32.5">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={paymentProviderFilter} onValueChange={(value) => {
                      setPaymentProviderFilter(value)
                      setPaymentPage(1)
                    }}>
                      <SelectTrigger className="w-32.5">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Providers</SelectItem>
                        <SelectItem value="STRIPE">Stripe</SelectItem>
                        <SelectItem value="MPESA">M-Pesa</SelectItem>
                        <SelectItem value="STANBIC_MPESA">Stanbic M-Pesa</SelectItem>
                        <SelectItem value="PAYPAL">PayPal</SelectItem>
                        <SelectItem value="PESAPAL">PesaPal</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={paymentDateRange} onValueChange={(value: typeof paymentDateRange) => {
                      setPaymentDateRange(value)
                      setPaymentPage(1)
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

                {/* Payments Table */}
                {paymentsLoading ? (
                  <PaymentsTableSkeleton />
                ) : (
                  <>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                No payments found
                              </TableCell>
                            </TableRow>
                          ) : (
                            payments.map((payment) => (
                              <TableRow key={payment.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="text-xs bg-stone-200">
                                        {getInitials(payment.user?.name, payment.user?.email)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium">
                                        {payment.user?.name || 'Unknown User'}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {payment.user?.email}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {formatCurrency(payment.amount, payment.currency, false)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    {/* {getProviderIcon(payment.provider)} */}
                                    <span className="text-sm capitalize">
                                      {payment.provider.toLowerCase().replace('_', ' ')}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm max-w-50 overflow-x-clip">
                                    {payment.receiptNumber || payment.referenceId || 'N/A'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusBadge(payment.status)}>
                                    {payment.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {formatDate(payment.createdAt)}
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
                                        setSelectedPayment(payment)
                                        setIsPaymentModalOpen(true)
                                      }}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      {payment.status === 'COMPLETED' && (
                                        <DropdownMenuItem>
                                          <Download className="mr-2 h-4 w-4" />
                                          Download Receipt
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      {payment.provider === 'MPESA' && payment.status === 'PENDING' && (
                                        <DropdownMenuItem>
                                          <RefreshCw className="mr-2 h-4 w-4" />
                                          Check Status
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

                    {/* Payments Pagination */}
                    {paymentPagination && paymentPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-4 border-t mt-4">
                        <div className="text-sm text-muted-foreground">
                          Showing {((paymentPagination.page - 1) * paymentPagination.limit) + 1} to{' '}
                          {Math.min(paymentPagination.page * paymentPagination.limit, paymentPagination.totalCount)} of{' '}
                          {paymentPagination.totalCount} payments
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPaymentPage(p => Math.max(1, p - 1))}
                            disabled={!paymentPagination.hasPrevPage}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPaymentPage(p => p + 1)}
                            disabled={!paymentPagination.hasNextPage}
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
            <PaymentDetailsModal
                payment={selectedPayment}
                isOpen={isPaymentModalOpen}
                onClose={() => {
                setIsPaymentModalOpen(false)
                setSelectedPayment(null)
                }}
            />
          </div>
  )
}

function PaymentsTableSkeleton() {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Reference</TableHead>
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
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
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

// Smartphone Icon Component
function Smartphone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <line x1="12" x2="12" y1="18" y2="18" />
    </svg>
  )
}