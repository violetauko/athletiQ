// 'use client'

// import { useState, useMemo, useCallback } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Badge } from '@/components/ui/badge'
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
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
//   ChevronLeft, 
//   ChevronRight, 
//   Search, 
//   Filter, 
//   Eye, 
//   CheckCircle, 
//   XCircle,
//   AlertCircle,
//   Download
// } from 'lucide-react'
// import Link from 'next/link'
// import { useDebounce } from '@/hooks/use-debounce'

// interface Opportunity {
//   id: string
//   title: string
//   organization: string
//   sport: string
//   type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
//   status: 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'EXPIRED'
//   location: string
//   applicationsCount: number
//   views: number
//   createdAt: string
//   createdBy: {
//     name: string
//     email: string
//   }
// }

// interface PaginatedResponse<T> {
//   data: T[]
//   pagination: {
//     page: number
//     limit: number
//     total: number
//     totalPages: number
//     hasNext: boolean
//     hasPrev: boolean
//   }
//   filters: {
//     sports: string[]
//     types: string[]
//     statuses: string[]
//   }
// }

// export default function AdminOpportunitiesPage() {
//   const [page, setPage] = useState(1)
//   const [search, setSearch] = useState('')
//   const [sport, setSport] = useState('all')
//   const [type, setType] = useState('all')
//   const [status, setStatus] = useState('all')
//   const [sortBy, setSortBy] = useState('createdAt')
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
//   const debouncedSearch = useDebounce(search, 300)

//   // Build query string
//   const queryString = useMemo(() => {
//     const params = new URLSearchParams({
//       page: page.toString(),
//       limit: '10',
//       sortBy,
//       sortOrder,
//       ...(debouncedSearch && { search: debouncedSearch }),
//       ...(sport !== 'all' && { sport }),
//       ...(type !== 'all' && { type }),
//       ...(status !== 'all' && { status }),
//     })
//     return params.toString()
//   }, [page, debouncedSearch, sport, type, status, sortBy, sortOrder])

//   const { data, isLoading, error } = useQuery<PaginatedResponse<Opportunity>>({
//     queryKey: ['admin-opportunities', queryString],
//     queryFn: async () => {
//       const response = await fetch(`/api/admin/opportunities?${queryString}`)
//       if (!response.ok) throw new Error('Failed to fetch opportunities')
//       return response.json()
//     },
//     staleTime: 30 * 1000, // 30 seconds
//     gcTime: 5 * 60 * 1000, // 5 minutes
//     placeholderData: (previousData) => previousData, // Keep showing previous data while fetching
//   })

//   const handleExport = useCallback(async () => {
//     try {
//       const response = await fetch('/api/admin/opportunities/export', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           sport: sport !== 'all' ? sport : undefined,
//           type: type !== 'all' ? type : undefined,
//           status: status !== 'all' ? status : undefined,
//           fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
//         })
//       })
      
//       if (!response.ok) throw new Error('Export failed')
      
//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = `opportunities-export-${new Date().toISOString().split('T')[0]}.csv`
//       a.click()
//     } catch (error) {
//       console.error('Export error:', error)
//     }
//   }, [sport, type, status])

//   const getStatusBadge = (status: string) => {
//     const variants = {
//       ACTIVE: { className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
//       CLOSED: { className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
//       DRAFT: { className: 'bg-stone-100 text-stone-700 border-stone-200', icon: AlertCircle },
//       EXPIRED: { className: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertCircle },
//     }
//     const variant = variants[status as keyof typeof variants] || variants.DRAFT
//     const Icon = variant.icon
    
//     return (
//       <Badge variant="outline" className={`${variant.className} flex items-center gap-1 w-fit`}>
//         <Icon className="w-3 h-3" />
//         {status}
//       </Badge>
//     )
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <Card className="border-red-200 bg-red-50">
//           <CardContent className="p-6">
//             <p className="text-red-600">Error loading opportunities. Please try again.</p>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-stone-50">
//       <div className="mx-auto py-8 px-4">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-stone-900">All Opportunities</h1>
//           <p className="text-stone-600 mt-1">Manage and monitor all opportunities across the platform</p>
//         </div>

//         {/* Filters */}
//         <Card className="mb-6 border-stone-200 shadow-sm">
//           <CardContent className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
//                 <Input
//                   placeholder="Search opportunities..."
//                   value={search}
//                   onChange={(e) => {
//                     setSearch(e.target.value)
//                     setPage(1)
//                   }}
//                   className="pl-9 border-stone-200"
//                 />
//               </div>
              
//               <Select value={sport} onValueChange={(value) => { setSport(value); setPage(1) }}>
//                 <SelectTrigger>
//                   <Filter className="w-4 h-4 mr-2" />
//                   <SelectValue placeholder="All Sports" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Sports</SelectItem>
//                   {data?.filters.sports.map(sport => (
//                     <SelectItem key={sport} value={sport}>{sport}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <Select value={type} onValueChange={(value) => { setType(value); setPage(1) }}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Types" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Types</SelectItem>
//                   {data?.filters.types.map(type => (
//                     <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Statuses" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Statuses</SelectItem>
//                   {data?.filters.statuses.map(status => (
//                     <SelectItem key={status} value={status}>{status}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <Button variant="outline" onClick={handleExport} className="border-stone-200">
//                 <Download className="w-4 h-4 mr-2" />
//                 Export
//               </Button>
//             </div>

//             {/* Sort Controls */}
//             <div className="flex items-center gap-4 mt-4 text-sm">
//               <span className="text-stone-500">Sort by:</span>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   setSortBy('createdAt')
//                   setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
//                 }}
//                 className={sortBy === 'createdAt' ? 'bg-stone-100' : ''}
//               >
//                 Date {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   setSortBy('applicationsCount')
//                   setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
//                 }}
//                 className={sortBy === 'applicationsCount' ? 'bg-stone-100' : ''}
//               >
//                 Applications {sortBy === 'applicationsCount' && (sortOrder === 'desc' ? '↓' : '↑')}
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   setSortBy('views')
//                   setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
//                 }}
//                 className={sortBy === 'views' ? 'bg-stone-100' : ''}
//               >
//                 Views {sortBy === 'views' && (sortOrder === 'desc' ? '↓' : '↑')}
//               </Button>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Table */}
//         <Card className="border-stone-200 shadow-sm">
//           <CardContent className="p-0">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Title</TableHead>
//                   <TableHead>Organization</TableHead>
//                   <TableHead>Sport</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="text-center">Applications</TableHead>
//                   <TableHead className="text-center">Views</TableHead>
//                   <TableHead>Created By</TableHead>
//                   <TableHead>Created</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoading ? (
//                   <TableRow>
//                     <TableCell colSpan={10} className="text-center py-8">
//                       <div className="flex items-center justify-center">
//                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-900"></div>
//                         <span className="ml-2">Loading opportunities...</span>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ) : data?.data.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={10} className="text-center py-8 text-stone-500">
//                       No opportunities found
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   data?.data.map((opportunity) => (
//                     <TableRow key={opportunity.id} className="hover:bg-stone-50">
//                       <TableCell className="font-medium">{opportunity.title}</TableCell>
//                       <TableCell>{opportunity.organization}</TableCell>
//                       <TableCell>{opportunity.sport}</TableCell>
//                       <TableCell>{opportunity.type.replace('_', ' ')}</TableCell>
//                       <TableCell>{getStatusBadge(opportunity.status)}</TableCell>
//                       <TableCell className="text-center">{opportunity.applicationsCount}</TableCell>
//                       <TableCell className="text-center">{opportunity.views}</TableCell>
//                       <TableCell>{opportunity.createdBy?.name || 'Unknown'}</TableCell>
//                       <TableCell>{new Date(opportunity.createdAt).toLocaleDateString()}</TableCell>
//                       <TableCell className="text-right">
//                         <Button variant="ghost" size="sm" asChild>
//                           <Link href={`/dashboard/admin/opportunities/${opportunity.id}`}>
//                             <Eye className="w-4 h-4" />
//                           </Link>
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>

//         {/* Pagination */}
//         {data && data.pagination.totalPages > 1 && (
//           <div className="flex items-center justify-between mt-6">
//             <p className="text-sm text-stone-600">
//               Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
//               {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
//               {data.pagination.total} results
//             </p>
//             <div className="flex items-center gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={!data.pagination.hasPrev}
//               >
//                 <ChevronLeft className="w-4 h-4" />
//                 Previous
//               </Button>
//               <div className="flex items-center gap-1">
//                 {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
//                   let pageNum: number
//                   if (data.pagination.totalPages <= 5) {
//                     pageNum = i + 1
//                   } else if (data.pagination.page <= 3) {
//                     pageNum = i + 1
//                   } else if (data.pagination.page >= data.pagination.totalPages - 2) {
//                     pageNum = data.pagination.totalPages - 4 + i
//                   } else {
//                     pageNum = data.pagination.page - 2 + i
//                   }
                  
//                   return (
//                     <Button
//                       key={pageNum}
//                       variant={pageNum === data.pagination.page ? "default" : "outline"}
//                       size="sm"
//                       onClick={() => setPage(pageNum)}
//                       className={pageNum === data.pagination.page ? 'bg-stone-900' : ''}
//                     >
//                       {pageNum}
//                     </Button>
//                   )
//                 })}
//               </div>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setPage(p => p + 1)}
//                 disabled={!data.pagination.hasNext}
//               >
//                 Next
//                 <ChevronRight className="w-4 h-4 ml-1" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
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
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Eye, 
  MoreVertical,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import { useDebounce } from '@/hooks/use-debounce'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Opportunity {
  id: string
  title: string
  organization: string
  sport: string
  type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  status: 'PENDING' | 'REJECTED' | 'ACTIVE' | 'CLOSED' | 'DRAFT' | 'EXPIRED'
  location: string
  createdAt: string
    ClientProfile?: {
      User: {
        id: string
        name: string | null
        email: string
      }
      organization: string
      title: string
      name: string
      email: string
    } | null
  _count: {
    applications: number
    savedBy: number
  }
}

interface PaginatedResponse {
  data: Opportunity[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: {
    sports: string[]
    types: string[]
    statuses: string[]
  }
}

export default function AdminOpportunitiesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sport, setSport] = useState('all')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [approvalFilter, setApprovalFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([])
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean
    action: 'approve' | 'reject' | 'pending' | 'delete' | null
  }>({ open: false, action: null })
  const [activeTab, setActiveTab] = useState('all')
  
  const debouncedSearch = useDebounce(search, 300)

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      sortBy,
      sortOrder,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(sport !== 'all' && { sport }),
      ...(type !== 'all' && { type }),
      ...(status !== 'all' && { status }),
      ...(approvalFilter !== 'all' && { approvalStatus: approvalFilter })
    })
    return params.toString()
  }, [page, debouncedSearch, sport, type, status, approvalFilter, sortBy, sortOrder])

  const { data, isLoading, error } = useQuery<PaginatedResponse>({
    queryKey: ['admin-opportunities', queryString],
    queryFn: async () => {
      const response = await fetch(`/api/admin/opportunities?${queryString}`)
      if (!response.ok) throw new Error('Failed to fetch opportunities')
      return response.json()
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })
  console.log('Fetched opportunities:', data)

  const bulkMutation = useMutation({
    mutationFn: async ({ action, data }: { action: string; data?: any }) => {
      const response = await fetch('/api/admin/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityIds: selectedOpportunities,
          action,
          data
        })
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Bulk operation failed')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      const actionMessages = {
        approve: 'approved',
        reject: 'rejected',
        pending: 'marked as pending',
        delete: 'deleted'
      }
      toast.success('Bulk operation completed', {
        description: `Successfully ${actionMessages[variables.action as keyof typeof actionMessages]} ${selectedOpportunities.length} opportunit${selectedOpportunities.length > 1 ? 'ies' : 'y'}.`
      })
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] })
      setSelectedOpportunities([])
      setBulkActionDialog({ open: false, action: null })
    },
    onError: (error: Error) => {
      toast.error('Bulk operation failed', {
        description: error.message
      })
      setBulkActionDialog({ open: false, action: null })
    }
  })

  const handleExport = useCallback(async () => {
    try {
      toast.loading('Preparing export...')
      
      const response = await fetch('/api/admin/opportunities/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: sport !== 'all' ? sport : undefined,
          type: type !== 'all' ? type : undefined,
          status: status !== 'all' ? status : undefined,
          approvalStatus: approvalFilter !== 'all' ? approvalFilter : undefined
        })
      })
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `opportunities-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      
      toast.success('Export completed', {
        description: 'Your file has been downloaded.'
      })
    } catch (error) {
      toast.error('Export failed', {
        description: 'Please try again later.'
      })
    }
  }, [sport, type, status, approvalFilter])

  const handleBulkAction = (action: 'approve' | 'reject' | 'pending' | 'delete') => {
    if (selectedOpportunities.length === 0) {
      toast.warning('No opportunities selected', {
        description: 'Please select at least one opportunity.'
      })
      return
    }
    setBulkActionDialog({ open: true, action })
  }

  const confirmBulkAction = () => {
    if (bulkActionDialog.action) {
      bulkMutation.mutate({ action: bulkActionDialog.action })
    }
  }

  const toggleSelectAll = () => {
    if (selectedOpportunities.length === (data?.data.length || 0)) {
      setSelectedOpportunities([])
    } else {
      setSelectedOpportunities(data?.data.map(o => o.id) || [])
    }
  }

  const toggleSelectOpportunity = (opportunityId: string) => {
    setSelectedOpportunities(prev =>
      prev.includes(opportunityId)
        ? prev.filter(id => id !== opportunityId)
        : [...prev, opportunityId]
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
      // APPROVED: { className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      REJECTED: { className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
      ACTIVE: { className: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
      CLOSED: { className: 'bg-stone-100 text-stone-700 border-stone-200', icon: XCircle },
      DRAFT: { className: 'bg-stone-100 text-stone-700 border-stone-200', icon: FileText },
      EXPIRED: { className: 'bg-stone-100 text-stone-700 border-stone-200', icon: AlertCircle },
    }
    const variant = variants[status as keyof typeof variants] || variants.PENDING
    const Icon = variant.icon
    
    return (
      <Badge variant="outline" className={`${variant.className} flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    )
  }

  // Count pending opportunities
  const pendingCount = data?.data.filter(o => o.status === 'PENDING').length || 0

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">Error loading opportunities. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-stone-900">Opportunity Management</h1>
              <p className="text-stone-600 mt-1">Review, approve, and manage all opportunities</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport} className="border-stone-200">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Approval Summary */}
          {pendingCount > 0 && (
            <Card className="mt-6 border-amber-200 bg-amber-50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-full">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">
                      {pendingCount} opportunity{pendingCount > 1 ? 'ies' : ''} pending approval
                    </p>
                    <p className="text-sm text-amber-600">
                      Review and approve these opportunities to make them visible to athletes.
                    </p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="border-amber-300 bg-white hover:bg-amber-100"
                  onClick={() => setApprovalFilter('pending')}
                >
                  View Pending
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={(value:string) => setApprovalFilter(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All Opportunities</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending
              {pendingCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <Card className="mb-6 border-stone-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Search opportunities..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9 border-stone-200"
                />
              </div>
              
              <Select value={sport} onValueChange={(value) => { setSport(value); setPage(1) }}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sports</SelectItem>
                  {data?.filters.sports.map(sport => (
                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={type} onValueChange={(value) => { setType(value); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {data?.filters.types.map(type => (
                    <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {data?.filters.statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-')
                setSortBy(newSortBy)
                setSortOrder(newSortOrder as 'asc' | 'desc')
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt-desc">Newest first</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest first</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                  <SelectItem value="applications-desc">Most applications</SelectItem>
                  <SelectItem value="applications-asc">Least applications</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedOpportunities.length > 0 && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-stone-100 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedOpportunities.length} opportunit{selectedOpportunities.length > 1 ? 'ies' : 'y'} selected
                </span>
                <div className="h-4 w-px bg-stone-300 mx-2" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('approve')}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('reject')}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('pending')}
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Mark Pending
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOpportunities([])}
                  className="ml-auto"
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opportunities Table */}
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedOpportunities.length === (data?.data.length || 0)}
                      onChange={toggleSelectAll}
                      className="rounded border-stone-300"
                    />
                  </TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Applications</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-900"></div>
                        <span className="ml-2">Loading opportunities...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-stone-500">
                      No opportunities found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((opportunity) => (
                    <TableRow key={opportunity.id} className="hover:bg-stone-50">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedOpportunities.includes(opportunity.id)}
                          onChange={() => toggleSelectOpportunity(opportunity.id)}
                          className="rounded border-stone-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{opportunity.title}</TableCell>
                      <TableCell>
                        {opportunity?.ClientProfile?.organization || opportunity.organization}
                      </TableCell>
                      <TableCell>{opportunity.sport}</TableCell>
                      <TableCell>{opportunity.type.replace('_', ' ')}</TableCell>
                      <TableCell>{getStatusBadge(opportunity.status)}</TableCell>
                      <TableCell className="text-center">{opportunity._count.applications}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{opportunity?.ClientProfile?.User?.name || 'Unknown'}</p>
                          <p className="text-xs text-stone-500">{opportunity?.ClientProfile?.User?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-stone-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(opportunity.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {opportunity.status === 'PENDING' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOpportunities([opportunity.id])
                                  bulkMutation.mutate({ action: 'approve' })
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Approve"
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOpportunities([opportunity.id])
                                  bulkMutation.mutate({ action: 'reject' })
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Reject"
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/admin/opportunities/${opportunity.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/admin/opportunities/${opportunity.id}/edit`}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {opportunity.status !== 'ACTIVE' && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedOpportunities([opportunity.id])
                                    bulkMutation.mutate({ action: 'approve' })
                                  }}
                                  className="text-green-600"
                                >
                                  <ThumbsUp className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {opportunity.status !== 'REJECTED' && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedOpportunities([opportunity.id])
                                    bulkMutation.mutate({ action: 'reject' })
                                  }}
                                  className="text-red-600"
                                >
                                  <ThumbsDown className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              )}
                              {opportunity.status !== 'PENDING' && (
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedOpportunities([opportunity.id])
                                    bulkMutation.mutate({ action: 'pending' })
                                  }}
                                  className="text-amber-600"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Mark Pending
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedOpportunities([opportunity.id])
                                  setBulkActionDialog({ open: true, action: 'delete' })
                                }}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-stone-600">
              Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
              {data.pagination.total} opportunities
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!data.pagination.hasPrev}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                  let pageNum: number
                  if (data.pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (data.pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (data.pagination.page >= data.pagination.totalPages - 2) {
                    pageNum = data.pagination.totalPages - 4 + i
                  } else {
                    pageNum = data.pagination.page - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === data.pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={pageNum === data.pagination.page ? 'bg-stone-900' : ''}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!data.pagination.hasNext}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Action Dialog */}
        <AlertDialog 
          open={bulkActionDialog.open} 
          onOpenChange={(open) => !open && setBulkActionDialog({ open: false, action: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {bulkActionDialog.action === 'approve' && 'Approve Opportunities'}
                {bulkActionDialog.action === 'reject' && 'Reject Opportunities'}
                {bulkActionDialog.action === 'pending' && 'Mark Opportunities as Pending'}
                {bulkActionDialog.action === 'delete' && 'Delete Opportunities'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {bulkActionDialog.action === 'approve' && (
                  <>You are about to approve {selectedOpportunities.length} opportunit{selectedOpportunities.length > 1 ? 'ies' : 'y'}. Approved opportunities will be visible to athletes.</>
                )}
                {bulkActionDialog.action === 'reject' && (
                  <>You are about to reject {selectedOpportunities.length} opportunit{selectedOpportunities.length > 1 ? 'ies' : 'y'}. Rejected opportunities will not be visible to athletes.</>
                )}
                {bulkActionDialog.action === 'pending' && (
                  <>You are about to mark {selectedOpportunities.length} opportunit{selectedOpportunities.length > 1 ? 'ies' : 'y'} as pending. They will require review again.</>
                )}
                {bulkActionDialog.action === 'delete' && (
                  <>You are about to delete {selectedOpportunities.length} opportunit{selectedOpportunities.length > 1 ? 'ies' : 'y'}. Opportunities with applications will be closed instead of permanently deleted.</>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBulkAction}
                className={
                  bulkActionDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  bulkActionDialog.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  bulkActionDialog.action === 'pending' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-red-600 hover:bg-red-700'
                }
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}