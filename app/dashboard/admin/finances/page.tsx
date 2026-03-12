// // app/dashboard/admin/finances/page.tsx
// 'use client'

// import { useState } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog'
// import { Avatar, AvatarFallback } from '@/components/ui/avatar'
// import {
//   MoreHorizontal,
//   Eye,
//   Download,
//   Search,
//   Filter,
//   Calendar,
//   DollarSign,
//   CreditCard,
//   TrendingUp,
//   Users,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   RefreshCw,
//   FileText,
//   ArrowUpDown
// } from 'lucide-react'
// import { Skeleton } from '@/components/ui/skeleton'
// import { formatCurrency } from '@/lib/utils'
// import { DonationDetailsModal } from '@/components/donations/donation-details-modal'
// import { PaymentDetailsModal } from '@/components/payments/payment-details-modal'

// interface Donation {
//   id: string
//   stripeSessionId?: string
//   stripePaymentId?: string
//   paypalOrderId?: string
//   pesapalOrderId?: string
//   amount: number
//   currency: string
//   tierId: string
//   isCustom: boolean
//   donorName?: string
//   donorEmail?: string
//   message?: string
//   userId?: string
//   user?: {
//     id: string
//     name?: string
//     email: string
//     profile?: {
//       firstName?: string
//       lastName?: string
//     }
//   }
//   status: DonationStatus
//   paidAt?: string
//   createdAt: string
//   updatedAt: string
// }

// interface Payment {
//   id: string
//   userId: string
//   amount: number
//   currency: string
//   provider: PaymentProvider
//   status: PaymentStatus
//   referenceId?: string
//   receiptNumber?: string
//   merchantReference?: string
//   createdAt: string
//   updatedAt: string
//   user?: {
//     id: string
//     name?: string
//     email: string
//     profile?: {
//       firstName?: string
//       lastName?: string
//     }
//   }
// }

// type DonationStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
// type PaymentProvider = 'STRIPE' | 'MPESA' | 'STANBIC_MPESA' | 'PAYPAL' | 'PESAPAL'
// type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

// export default function AdminFinancesPage() {
//   const [activeTab, setActiveTab] = useState('donations')
//   const [searchQuery, setSearchQuery] = useState('')
//   const [statusFilter, setStatusFilter] = useState<string>('ALL')
//   const [providerFilter, setProviderFilter] = useState<string>('ALL')
//   const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all')
//   const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
//   const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
//   const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
//   const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

//   // Add pagination state
//   const [page, setPage] = useState(1)

//   // Fetch donations
//   const {
//     data: donationsData,
//     isLoading: donationsLoading,
//     refetch: refetchDonations
//   } = useQuery({
//     queryKey: ['admin-donations', statusFilter, dateRange, page],
//     queryFn: async () => {
//       const params = new URLSearchParams()
//       if (statusFilter !== 'ALL') params.append('status', statusFilter)
//       if (dateRange !== 'all') params.append('dateRange', dateRange)
//       params.append('page', page.toString())
//       params.append('limit', '20')

//       const response = await fetch(`/api/admin/donations?${params}`)
//       if (!response.ok) throw new Error('Failed to fetch donations')
//       return response.json()
//     },
//     staleTime: 5 * 60 * 1000,
//   })
//   // Access the donations array from the response
//   const donations: Donation[] = donationsData?.donations || []
//   const pagination = donationsData?.pagination
//   const stats = donationsData?.stats


//   // Fetch payments
//   const {
//     data: payments = [],
//     isLoading: paymentsLoading,
//     refetch: refetchPayments
//   } = useQuery<Payment[]>({
//     queryKey: ['admin-payments', statusFilter, providerFilter, dateRange],
//     queryFn: async () => {
//       const params = new URLSearchParams()
//       if (statusFilter !== 'ALL') params.append('status', statusFilter)
//       if (providerFilter !== 'ALL') params.append('provider', providerFilter)
//       if (dateRange !== 'all') params.append('dateRange', dateRange)

//       const response = await fetch(`/api/admin/payments?${params}`)
//       if (!response.ok) throw new Error('Failed to fetch payments')
//       return response.json()
//     },
//     staleTime: 5 * 60 * 1000,
//   })

//   // Filter donations by search
//   const filteredDonations = donations.filter(donation => {
//     if (!searchQuery) return true
//     const query = searchQuery.toLowerCase()
//     return (
//       donation.donorName?.toLowerCase().includes(query) ||
//       donation.donorEmail?.toLowerCase().includes(query) ||
//       donation.id.toLowerCase().includes(query) ||
//       donation.tierId.toLowerCase().includes(query)
//     )
//   })

//   // Filter payments by search
//   const filteredPayments = payments.filter(payment => {
//     if (!searchQuery) return true
//     const query = searchQuery.toLowerCase()
//     return (
//       payment.user?.name?.toLowerCase().includes(query) ||
//       payment.user?.email?.toLowerCase().includes(query) ||
//       payment.id.toLowerCase().includes(query) ||
//       payment.referenceId?.toLowerCase().includes(query) ||
//       payment.receiptNumber?.toLowerCase().includes(query)
//     )
//   })

//   // Calculate totals
//   const totalDonations = filteredDonations.reduce((sum, d) => sum + d.amount, 0)
//   const completedDonations = filteredDonations.filter(d => d.status === 'COMPLETED')
//   const totalCompletedAmount = completedDonations.reduce((sum, d) => sum + d.amount, 0)

//   const totalPayments = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
//   const completedPayments = filteredPayments.filter(p => p.status === 'COMPLETED')
//   const totalCompletedPayments = completedPayments.reduce((sum, p) => sum + p.amount, 0)

//   const getStatusBadge = (status: string) => {
//     const styles = {
//       COMPLETED: 'bg-green-100 text-green-800 border-green-200',
//       PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       FAILED: 'bg-red-100 text-red-800 border-red-200',
//       REFUNDED: 'bg-purple-100 text-purple-800 border-purple-200',
//     }
//     return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'
//   }

//   const getProviderIcon = (provider: string) => {
//     switch (provider) {
//       case 'STRIPE': return <CreditCard className="w-4 h-4" />
//       case 'MPESA':
//       case 'STANBIC_MPESA': return <Smartphone className="w-4 h-4" />
//       case 'PAYPAL': return <DollarSign className="w-4 h-4" />
//       case 'PESAPAL': return <DollarSign className="w-4 h-4" />
//       default: return <CreditCard className="w-4 h-4" />
//     }
//   }

//   const getTierBadge = (tierId: string, isCustom: boolean) => {
//     if (isCustom) return <Badge variant="outline">Custom</Badge>

//     const tiers: Record<string, { label: string, className: string }> = {
//       champion: { label: 'Champion', className: 'bg-yellow-100 text-yellow-800' },
//       supporter: { label: 'Supporter', className: 'bg-blue-100 text-blue-800' },
//       mvp: { label: 'MVP', className: 'bg-purple-100 text-purple-800' },
//       legend: { label: 'Legend', className: 'bg-orange-100 text-orange-800' },
//     }

//     const tier = tiers[tierId]
//     return tier ? (
//       <Badge className={tier.className}>{tier.label}</Badge>
//     ) : (
//       <Badge variant="outline">{tierId}</Badge>
//     )
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   const getInitials = (name?: string, email?: string) => {
//     if (name) {
//       return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
//     }
//     return email?.charAt(0).toUpperCase() || '?'
//   }

//   return (
//     <div className="min-h-screen bg-stone-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-3xl font-bold">Financial Management</h1>
//             <p className="text-muted-foreground mt-1">
//               Track donations, payments, and transactions
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <Button variant="outline" onClick={() => {
//               refetchDonations()
//               refetchPayments()
//             }}>
//               <RefreshCw className="w-4 h-4 mr-2" />
//               Refresh
//             </Button>
//             <Button>
//               <FileText className="w-4 h-4 mr-2" />
//               Export Report
//             </Button>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <Card>
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Total Donations</p>
//                   <p className="text-2xl font-bold">
//                     {formatCurrency(totalCompletedAmount / 100, 'USD')}
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     {completedDonations.length} completed
//                   </p>
//                 </div>
//                 <div className="p-3 bg-green-100 rounded-full">
//                   <DollarSign className="w-5 h-5 text-green-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Total Payments</p>
//                   <p className="text-2xl font-bold">
//                     {formatCurrency(totalCompletedPayments / 100, 'KES')}
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     {completedPayments.length} completed
//                   </p>
//                 </div>
//                 <div className="p-3 bg-blue-100 rounded-full">
//                   <TrendingUp className="w-5 h-5 text-blue-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Pending Transactions</p>
//                   <p className="text-2xl font-bold">
//                     {donations.filter(d => d.status === 'PENDING').length +
//                       payments.filter(p => p.status === 'PENDING').length}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-yellow-100 rounded-full">
//                   <Clock className="w-5 h-5 text-yellow-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Unique Donors</p>
//                   <p className="text-2xl font-bold">
//                     {new Set(donations.map(d => d.donorEmail)).size}
//                   </p>
//                 </div>
//                 <div className="p-3 bg-purple-100 rounded-full">
//                   <Users className="w-5 h-5 text-purple-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//           <TabsList>
//             <TabsTrigger value="donations">Donations</TabsTrigger>
//             <TabsTrigger value="payments">Payments</TabsTrigger>
//             <TabsTrigger value="analytics">Analytics</TabsTrigger>
//           </TabsList>

//           <TabsContent value="donations">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Donations Management</CardTitle>
//                 <CardDescription>
//                   View and manage all donation transactions
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {/* Filters */}
//                 <div className="flex flex-col md:flex-row gap-4 mb-6">
//                   <div className="flex-1 relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//                     <Input
//                       placeholder="Search by name, email, or ID..."
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="pl-9"
//                     />
//                   </div>
//                   <div className="flex gap-2">
//                     <Select value={statusFilter} onValueChange={setStatusFilter}>
//                       <SelectTrigger className="w-[150px]">
//                         <Filter className="w-4 h-4 mr-2" />
//                         <SelectValue placeholder="Status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="ALL">All Status</SelectItem>
//                         <SelectItem value="COMPLETED">Completed</SelectItem>
//                         <SelectItem value="PENDING">Pending</SelectItem>
//                         <SelectItem value="FAILED">Failed</SelectItem>
//                         <SelectItem value="REFUNDED">Refunded</SelectItem>
//                       </SelectContent>
//                     </Select>

//                     <Select value={dateRange} onValueChange={(v: typeof dateRange) => setDateRange(v)}>
//                       <SelectTrigger className="w-[150px]">
//                         <Calendar className="w-4 h-4 mr-2" />
//                         <SelectValue placeholder="Date Range" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All Time</SelectItem>
//                         <SelectItem value="today">Today</SelectItem>
//                         <SelectItem value="week">This Week</SelectItem>
//                         <SelectItem value="month">This Month</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 {/* Donations Table */}
//                 {donationsLoading ? (
//                   <DonationsTableSkeleton />
//                 ) : (
//                   <div className="border rounded-lg">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>Donor</TableHead>
//                           <TableHead>Amount</TableHead>
//                           <TableHead>Tier</TableHead>
//                           <TableHead>Status</TableHead>
//                           <TableHead>Date</TableHead>
//                           <TableHead className="text-right">Actions</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {filteredDonations.length === 0 ? (
//                           <TableRow>
//                             <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
//                               No donations found
//                             </TableCell>
//                           </TableRow>
//                         ) : (
//                           filteredDonations.map((donation) => (
//                             <TableRow key={donation.id}>
//                               <TableCell>
//                                 <div className="flex items-center gap-3">
//                                   <Avatar className="h-8 w-8">
//                                     <AvatarFallback className="text-xs bg-stone-200">
//                                       {getInitials(donation.donorName, donation.donorEmail)}
//                                     </AvatarFallback>
//                                   </Avatar>
//                                   <div>
//                                     <div className="font-medium">
//                                       {donation.donorName || 'Anonymous'}
//                                     </div>
//                                     <div className="text-xs text-muted-foreground">
//                                       {donation.donorEmail || 'No email'}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </TableCell>
//                               <TableCell className="font-medium">
//                                 {formatCurrency(donation.amount / 100, donation.currency)}
//                               </TableCell>
//                               <TableCell>
//                                 {getTierBadge(donation.tierId, donation.isCustom)}
//                               </TableCell>
//                               <TableCell>
//                                 <Badge className={getStatusBadge(donation.status)}>
//                                   {donation.status}
//                                 </Badge>
//                               </TableCell>
//                               <TableCell>
//                                 <div className="text-sm">
//                                   {formatDate(donation.createdAt)}
//                                 </div>
//                               </TableCell>
//                               <TableCell className="text-right">
//                                 <DropdownMenu>
//                                   <DropdownMenuTrigger asChild>
//                                     <Button variant="ghost" className="h-8 w-8 p-0">
//                                       <MoreHorizontal className="h-4 w-4" />
//                                     </Button>
//                                   </DropdownMenuTrigger>
//                                   <DropdownMenuContent align="end">
//                                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                                     <DropdownMenuItem onClick={() => {
//                                       setSelectedDonation(donation)
//                                       setIsDonationModalOpen(true)
//                                     }}>
//                                       <Eye className="mr-2 h-4 w-4" />
//                                       View Details
//                                     </DropdownMenuItem>
//                                     {donation.status === 'COMPLETED' && (
//                                       <DropdownMenuItem>
//                                         <Download className="mr-2 h-4 w-4" />
//                                         Download Receipt
//                                       </DropdownMenuItem>
//                                     )}
//                                     <DropdownMenuSeparator />
//                                     {donation.status === 'PENDING' && (
//                                       <DropdownMenuItem className="text-red-600">
//                                         <XCircle className="mr-2 h-4 w-4" />
//                                         Mark as Failed
//                                       </DropdownMenuItem>
//                                     )}
//                                     {donation.status === 'COMPLETED' && (
//                                       <DropdownMenuItem className="text-purple-600">
//                                         <RefreshCw className="mr-2 h-4 w-4" />
//                                         Process Refund
//                                       </DropdownMenuItem>
//                                     )}
//                                   </DropdownMenuContent>
//                                 </DropdownMenu>
//                               </TableCell>
//                             </TableRow>
//                           ))
//                         )}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="payments">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Payments Management</CardTitle>
//                 <CardDescription>
//                   View and manage all payment transactions
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {/* Filters */}
//                 <div className="flex flex-col md:flex-row gap-4 mb-6">
//                   <div className="flex-1 relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
//                     <Input
//                       placeholder="Search by user, ID, or reference..."
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="pl-9"
//                     />
//                   </div>
//                   <div className="flex gap-2">
//                     <Select value={statusFilter} onValueChange={setStatusFilter}>
//                       <SelectTrigger className="w-[150px]">
//                         <Filter className="w-4 h-4 mr-2" />
//                         <SelectValue placeholder="Status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="ALL">All Status</SelectItem>
//                         <SelectItem value="COMPLETED">Completed</SelectItem>
//                         <SelectItem value="PENDING">Pending</SelectItem>
//                         <SelectItem value="FAILED">Failed</SelectItem>
//                       </SelectContent>
//                     </Select>

//                     <Select value={providerFilter} onValueChange={setProviderFilter}>
//                       <SelectTrigger className="w-[150px]">
//                         <CreditCard className="w-4 h-4 mr-2" />
//                         <SelectValue placeholder="Provider" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="ALL">All Providers</SelectItem>
//                         <SelectItem value="STRIPE">Stripe</SelectItem>
//                         <SelectItem value="MPESA">M-Pesa</SelectItem>
//                         <SelectItem value="STANBIC_MPESA">Stanbic M-Pesa</SelectItem>
//                         <SelectItem value="PAYPAL">PayPal</SelectItem>
//                         <SelectItem value="PESAPAL">PesaPal</SelectItem>
//                       </SelectContent>
//                     </Select>

//                     <Select value={dateRange} onValueChange={(v: typeof dateRange) => setDateRange(v)}>
//                       <SelectTrigger className="w-[150px]">
//                         <Calendar className="w-4 h-4 mr-2" />
//                         <SelectValue placeholder="Date Range" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="all">All Time</SelectItem>
//                         <SelectItem value="today">Today</SelectItem>
//                         <SelectItem value="week">This Week</SelectItem>
//                         <SelectItem value="month">This Month</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 {/* Payments Table */}
//                 {paymentsLoading ? (
//                   <PaymentsTableSkeleton />
//                 ) : (
//                   <div className="border rounded-lg">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>User</TableHead>
//                           <TableHead>Amount</TableHead>
//                           <TableHead>Provider</TableHead>
//                           <TableHead>Reference</TableHead>
//                           <TableHead>Status</TableHead>
//                           <TableHead>Date</TableHead>
//                           <TableHead className="text-right">Actions</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {filteredPayments.length === 0 ? (
//                           <TableRow>
//                             <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
//                               No payments found
//                             </TableCell>
//                           </TableRow>
//                         ) : (
//                           filteredPayments.map((payment) => (
//                             <TableRow key={payment.id}>
//                               <TableCell>
//                                 <div className="flex items-center gap-3">
//                                   <Avatar className="h-8 w-8">
//                                     <AvatarFallback className="text-xs bg-stone-200">
//                                       {getInitials(payment.user?.name, payment.user?.email)}
//                                     </AvatarFallback>
//                                   </Avatar>
//                                   <div>
//                                     <div className="font-medium">
//                                       {payment.user?.name || 'Unknown User'}
//                                     </div>
//                                     <div className="text-xs text-muted-foreground">
//                                       {payment.user?.email}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </TableCell>
//                               <TableCell className="font-medium">
//                                 {formatCurrency(payment.amount / 100, payment.currency)}
//                               </TableCell>
//                               <TableCell>
//                                 <div className="flex items-center gap-1">
//                                   {getProviderIcon(payment.provider)}
//                                   <span className="text-sm capitalize">
//                                     {payment.provider.toLowerCase().replace('_', ' ')}
//                                   </span>
//                                 </div>
//                               </TableCell>
//                               <TableCell>
//                                 <div className="text-sm">
//                                   {payment.receiptNumber || payment.referenceId || 'N/A'}
//                                 </div>
//                               </TableCell>
//                               <TableCell>
//                                 <Badge className={getStatusBadge(payment.status)}>
//                                   {payment.status}
//                                 </Badge>
//                               </TableCell>
//                               <TableCell>
//                                 <div className="text-sm">
//                                   {formatDate(payment.createdAt)}
//                                 </div>
//                               </TableCell>
//                               <TableCell className="text-right">
//                                 <DropdownMenu>
//                                   <DropdownMenuTrigger asChild>
//                                     <Button variant="ghost" className="h-8 w-8 p-0">
//                                       <MoreHorizontal className="h-4 w-4" />
//                                     </Button>
//                                   </DropdownMenuTrigger>
//                                   <DropdownMenuContent align="end">
//                                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                                     <DropdownMenuItem onClick={() => {
//                                       setSelectedPayment(payment)
//                                       setIsPaymentModalOpen(true)
//                                     }}>
//                                       <Eye className="mr-2 h-4 w-4" />
//                                       View Details
//                                     </DropdownMenuItem>
//                                     {payment.status === 'COMPLETED' && (
//                                       <DropdownMenuItem>
//                                         <Download className="mr-2 h-4 w-4" />
//                                         Download Receipt
//                                       </DropdownMenuItem>
//                                     )}
//                                     <DropdownMenuSeparator />
//                                     {payment.provider === 'MPESA' && payment.status === 'PENDING' && (
//                                       <DropdownMenuItem>
//                                         <RefreshCw className="mr-2 h-4 w-4" />
//                                         Check Status
//                                       </DropdownMenuItem>
//                                     )}
//                                   </DropdownMenuContent>
//                                 </DropdownMenu>
//                               </TableCell>
//                             </TableRow>
//                           ))
//                         )}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="analytics">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Financial Analytics</CardTitle>
//                 <CardDescription>
//                   View detailed analytics and reports
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-lg">Donation Trends</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="h-[300px] flex items-center justify-center text-muted-foreground">
//                         Chart component here
//                       </div>
//                     </CardContent>
//                   </Card>
//                   <Card>
//                     <CardHeader>
//                       <CardTitle className="text-lg">Payment Methods</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="h-[300px] flex items-center justify-center text-muted-foreground">
//                         Chart component here
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Modals */}
//       <DonationDetailsModal
//         donation={selectedDonation}
//         isOpen={isDonationModalOpen}
//         onClose={() => {
//           setIsDonationModalOpen(false)
//           setSelectedDonation(null)
//         }}
//       />
//       <PaymentDetailsModal
//         payment={selectedPayment}
//         isOpen={isPaymentModalOpen}
//         onClose={() => {
//           setIsPaymentModalOpen(false)
//           setSelectedPayment(null)
//         }}
//       />
//       {!donationsLoading && pagination && (
//         <div className="flex items-center justify-between px-4 py-4 border-t">
//           <div className="text-sm text-muted-foreground">
//             Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
//             {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
//             {pagination.totalCount} donations
//           </div>
//           <div className="flex gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setPage(p => Math.max(1, p - 1))}
//               disabled={!pagination.hasPrevPage}
//             >
//               Previous
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => setPage(p => p + 1)}
//               disabled={!pagination.hasNextPage}
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// function DonationsTableSkeleton() {
//   return (
//     <div className="border rounded-lg">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Donor</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Tier</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Date</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {[...Array(5)].map((_, i) => (
//             <TableRow key={i}>
//               <TableCell>
//                 <div className="flex items-center gap-3">
//                   <Skeleton className="h-8 w-8 rounded-full" />
//                   <div>
//                     <Skeleton className="h-4 w-32" />
//                     <Skeleton className="h-3 w-24 mt-1" />
//                   </div>
//                 </div>
//               </TableCell>
//               <TableCell><Skeleton className="h-4 w-20" /></TableCell>
//               <TableCell><Skeleton className="h-6 w-20" /></TableCell>
//               <TableCell><Skeleton className="h-6 w-20" /></TableCell>
//               <TableCell><Skeleton className="h-4 w-24" /></TableCell>
//               <TableCell className="text-right">
//                 <Skeleton className="h-8 w-8 rounded-full ml-auto" />
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

// function PaymentsTableSkeleton() {
//   return (
//     <div className="border rounded-lg">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>User</TableHead>
//             <TableHead>Amount</TableHead>
//             <TableHead>Provider</TableHead>
//             <TableHead>Reference</TableHead>
//             <TableHead>Status</TableHead>
//             <TableHead>Date</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody>
//           {[...Array(5)].map((_, i) => (
//             <TableRow key={i}>
//               <TableCell>
//                 <div className="flex items-center gap-3">
//                   <Skeleton className="h-8 w-8 rounded-full" />
//                   <div>
//                     <Skeleton className="h-4 w-32" />
//                     <Skeleton className="h-3 w-24 mt-1" />
//                   </div>
//                 </div>
//               </TableCell>
//               <TableCell><Skeleton className="h-4 w-20" /></TableCell>
//               <TableCell><Skeleton className="h-4 w-24" /></TableCell>
//               <TableCell><Skeleton className="h-4 w-24" /></TableCell>
//               <TableCell><Skeleton className="h-6 w-20" /></TableCell>
//               <TableCell><Skeleton className="h-4 w-24" /></TableCell>
//               <TableCell className="text-right">
//                 <Skeleton className="h-8 w-8 rounded-full ml-auto" />
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

// // Add missing Smartphone icon
// function Smartphone(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
//       <line x1="12" x2="12" y1="18" y2="18" />
//     </svg>
//   )
// }
// app/dashboard/admin/finances/page.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  MoreHorizontal,
  Eye,
  Download,
  Search,
  Filter,
  Calendar,
  DollarSign,
  CreditCard,
  XCircle,
  RefreshCw,
  FileText,
  Activity,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { DonationDetailsModal } from '@/components/donations/donation-details-modal'
import { PaymentDetailsModal } from '@/components/payments/payment-details-modal'
import { OverviewAnalytics } from '@/components/admin/analytics/overview-analytics'
import { DonationsAnalytics } from '@/components/admin/analytics/donation-analytics'
import { PaymentsAnalytics } from '@/components/admin/analytics/payment-analytics'

interface Donation {
  id: string
  stripeSessionId?: string
  stripePaymentId?: string
  paypalOrderId?: string
  pesapalOrderId?: string
  amount: number
  currency: string
  tierId: string
  isCustom: boolean
  donorName?: string
  donorEmail?: string
  message?: string
  userId?: string
  user?: {
    id: string
    name?: string
    email: string
    profile?: {
      firstName?: string
      lastName?: string
    }
  }
  status: DonationStatus
  paidAt?: string
  createdAt: string
  updatedAt: string
}

interface Payment {
  id: string
  userId: string
  amount: number
  currency: string
  provider: PaymentProvider
  status: PaymentStatus
  referenceId?: string
  receiptNumber?: string
  merchantReference?: string
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name?: string
    email: string
    profile?: {
      firstName?: string
      lastName?: string
    }
  }
}

interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  stats?: any
}

type DonationStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
type PaymentProvider = 'STRIPE' | 'MPESA' | 'STANBIC_MPESA' | 'PAYPAL' | 'PESAPAL'
type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export default function AdminFinancesPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // Donations state
  const [donationSearch, setDonationSearch] = useState('')
  const [donationStatusFilter, setDonationStatusFilter] = useState<string>('ALL')
  const [donationTierFilter, setDonationTierFilter] = useState<string>('ALL')
  const [donationDateRange, setDonationDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [donationPage, setDonationPage] = useState(1)

  // Payments state
  const [paymentSearch, setPaymentSearch] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL')
  const [paymentProviderFilter, setPaymentProviderFilter] = useState<string>('ALL')
  const [paymentDateRange, setPaymentDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [paymentPage, setPaymentPage] = useState(1)

  // Analytics state
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  // Modals state
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Fetch donations with pagination
  const {
    data: donationsData,
    isLoading: donationsLoading,
    refetch: refetchDonations
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

  // Fetch payments with pagination
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    refetch: refetchPayments
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

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics
  } = useQuery({
    queryKey: ['admin-finance-analytics', analyticsPeriod],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.append('period', analyticsPeriod)

      const response = await fetch(`/api/admin/finance/analytics?${params}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })

  const donations = donationsData?.items || []
  const donationPagination = donationsData?.pagination
  const donationStats = donationsData?.stats

  const payments = paymentsData?.items || []
  const paymentPagination = paymentsData?.pagination
  const paymentStats = paymentsData?.stats

  const getStatusBadge = (status: string) => {
    const styles = {
      COMPLETED: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200',
      REFUNDED: 'bg-purple-100 text-purple-800 border-purple-200',
    }
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'STRIPE': return <CreditCard className="w-4 h-4" />
      case 'MPESA':
      case 'STANBIC_MPESA': return <Smartphone className="w-4 h-4" />
      case 'PAYPAL': return <DollarSign className="w-4 h-4" />
      case 'PESAPAL': return <DollarSign className="w-4 h-4" />
      default: return <CreditCard className="w-4 h-4" />
    }
  }

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

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.charAt(0).toUpperCase() || '?'
  }

  const handleRefresh = () => {
    refetchDonations()
    refetchPayments()
    refetchAnalytics()
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Financial Management</h1>
            <p className="text-muted-foreground mt-1">
              Track donations, payments, and transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Donations
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payments
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewAnalytics
              data={analyticsData}
              isLoading={analyticsLoading}
              period={analyticsPeriod}
              onPeriodChange={setAnalyticsPeriod}
            />

            <div className="grid grid-cols-1 gap-6">
              <DonationsAnalytics
                data={analyticsData?.donations}
                isLoading={analyticsLoading}
              />
              <PaymentsAnalytics
                data={analyticsData?.payments}
                isLoading={analyticsLoading}
              />
            </div>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations">
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
                      <SelectTrigger className="w-[130px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={donationTierFilter} onValueChange={(value) => {
                      setDonationTierFilter(value)
                      setDonationPage(1)
                    }}>
                      <SelectTrigger className="w-[130px]">
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
                      <SelectTrigger className="w-[130px]">
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
                                        {getInitials(donation.donorName, donation.donorEmail)}
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
                                  {formatCurrency(donation.amount, donation.currency, false)}
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
                                      {donation.status === 'COMPLETED' && (
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
                                      {donation.status === 'COMPLETED' && (
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
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
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
                      <SelectTrigger className="w-[130px]">
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
                      <SelectTrigger className="w-[130px]">
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
                      <SelectTrigger className="w-[130px]">
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
                                    {getProviderIcon(payment.provider)}
                                    <span className="text-sm capitalize">
                                      {payment.provider.toLowerCase().replace('_', ' ')}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <DonationDetailsModal
        donation={selectedDonation}
        isOpen={isDonationModalOpen}
        onClose={() => {
          setIsDonationModalOpen(false)
          setSelectedDonation(null)
        }}
      />
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