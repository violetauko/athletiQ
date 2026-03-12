'use client'

import { useQuery } from '@tanstack/react-query'
import { Application } from '@/app/types/athlete'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, XCircle, Building, MapPin, Calendar, User, Phone, Mail, Award, Target, FileText } from 'lucide-react'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal, Eye, Download, Edit } from 'lucide-react'

interface ApplicationsTableProps {
  userType?: 'athlete' | 'admin' | 'client'
  initialData?: Application[]
  onStatusChange?: (applicationId: string, newStatus: string) => void
  onViewDetails?: (application: Application) => void
}

export default function ApplicationsTable({
  userType = 'athlete',
  initialData,
  onStatusChange,
  onViewDetails
}: ApplicationsTableProps) {

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ['applications', userType],
    queryFn: async () => {
      const endpoint = userType === 'athlete'
        ? '/api/athlete/applications'
        : userType === 'client'
          ? '/api/client/applications'
          : '/api/admin/applications'

      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Failed to fetch applications')
      return response.json()
    },
    initialData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REVIEWING': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SHORTLISTED': return 'bg-green-100 text-green-800 border-green-200'
      case 'INTERVIEWED': return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'ACCEPTED': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200'
      case 'WITHDRAWN': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SHORTLISTED':
      case 'ACCEPTED':
        return <CheckCircle2 className="w-3.5 h-3.5" />
      case 'REJECTED':
      case 'WITHDRAWN':
        return <XCircle className="w-3.5 h-3.5" />
      default:
        return <Clock className="w-3.5 h-3.5" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  if (isLoading) {
    return <ApplicationsTableSkeleton />
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-stone-100 p-3 mb-4">
            <FileText className="h-6 w-6 text-stone-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No applications found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {userType === 'athlete'
              ? "You haven't applied to any opportunities yet."
              : "No applications have been submitted yet."}
          </p>
          {userType === 'athlete' && (
            <Button asChild>
              <Link href="/dashboard/athlete/opportunities">Browse Opportunities</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='min-h-screen'>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {userType !== 'athlete' && <TableHead>Applicant</TableHead>}
              <TableHead>Opportunity</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id} className="hover:bg-stone-50">
                {userType !== 'athlete' && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-stone-200">
                          {getInitials(app.firstName || '', app.lastName || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{app.firstName} {app.lastName}</div>
                        <div className="text-xs text-muted-foreground">{app.email}</div>
                      </div>
                    </div>
                  </TableCell>
                )}
                <TableCell>
                  <div>
                    <div className="font-medium">{app.Opportunity?.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {app.Opportunity?.sport}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {app.Opportunity?.type}
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm">
                      {app.Opportunity?.ClientProfile?.organization}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm">{app.Opportunity?.location || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm">{formatDate(app.appliedAt)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(app.status)} border flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium w-fit`}>
                    {getStatusIcon(app.status)}
                    {app.status}
                  </Badge>
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
                      <DropdownMenuItem onClick={() => onViewDetails?.(app)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      {userType === 'athlete' && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/athlete/opportunities/${app.opportunityId}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Opportunity
                          </Link>
                        </DropdownMenuItem>
                      )}

                      {app.resumeFileName && (
                        <DropdownMenuItem asChild>
                          <Link href={`/api/applications/${app.id}/resume`} target="_blank">
                            <Download className="mr-2 h-4 w-4" />
                            Download Resume
                          </Link>
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      {userType === 'client' && onStatusChange && (
                        <>
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          {['PENDING', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWED', 'ACCEPTED', 'REJECTED'].map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => onStatusChange(app.id, status)}
                              disabled={status === app.status}
                            >
                              <Badge className={`${getStatusColor(status)} mr-2`}>
                                {status}
                              </Badge>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function ApplicationsTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opportunity</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                  <div className="flex gap-1 mt-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}