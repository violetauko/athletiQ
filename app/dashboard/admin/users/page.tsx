'use client'

import { useState, useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Shield,
  UserCog,
  MailCheck,
  MailX,
  Trash2,
  Users,
  Calendar,
  CheckCircle,
  XCircle
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
import { Label } from '@/components/ui/label'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: 'ADMIN' | 'SUPER_ADMIN' | 'ATHLETE' | 'CLIENT'
  emailVerified: Date | null
  createdAt: string
  updatedAt: string
  profileType: 'ATHLETE' | 'CLIENT' | null
  hasProfile: boolean
  isVerified: boolean
  profile: {
    id?: string
    sport?: string
    position?: string
    organization?: string
    title?: string
  } | null
  _count: {
    applications: number
    donations: number
    contactSubmissions: number
    Account: number
    Session: number
  }
}

interface PaginatedResponse {
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  stats: {
    byRole: Array<{ role: string; _count: number }>
  }
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [hasProfile, setHasProfile] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [bulkActionDialog, setBulkActionDialog] = useState<{
    open: boolean
    action: 'update-role' | 'verify' | 'unverify' | 'delete' | null
  }>({ open: false, action: null })
  const [roleToUpdate, setRoleToUpdate] = useState<string>('')
  
  const debouncedSearch = useDebounce(search, 300)

  // Build query string
  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      sortBy,
      sortOrder,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(role !== 'all' && { role }),
      ...(hasProfile !== 'all' && { hasProfile })
    })
    return params.toString()
  }, [page, debouncedSearch, role, hasProfile, sortBy, sortOrder])

  const { data, isLoading, error } = useQuery<PaginatedResponse>({
    queryKey: ['admin-users', queryString],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users?${queryString}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })

  const bulkMutation = useMutation({
    mutationFn: async ({ action, data }: { action: string; data?: any }) => {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUsers,
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
      toast.success('Bulk operation completed', {
        description: `Successfully ${variables.action} ${selectedUsers.length} users.`
      })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setSelectedUsers([])
      setBulkActionDialog({ open: false, action: null })
      setRoleToUpdate('')
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
      
      const response = await fetch('/api/admin/users/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: role !== 'all' ? role : undefined,
          hasProfile: hasProfile !== 'all' ? hasProfile : undefined
        })
      })
      
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      
      toast.success('Export completed', {
        description: 'Your file has been downloaded.'
      })
    } catch (error) {
      toast.error('Export failed', {
        description: 'Please try again later.'
      })
    }
  }, [role, hasProfile])

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.warning('No users selected', {
        description: 'Please select at least one user.'
      })
      return
    }

    if (action === 'update-role') {
      setBulkActionDialog({ open: true, action: 'update-role' })
    } else if (action === 'verify') {
      bulkMutation.mutate({ action: 'verify-email' })
    } else if (action === 'unverify') {
      bulkMutation.mutate({ action: 'unverify-email' })
    } else if (action === 'delete') {
      setBulkActionDialog({ open: true, action: 'delete' })
    }
  }

  const confirmBulkAction = () => {
    if (bulkActionDialog.action === 'update-role' && roleToUpdate) {
      bulkMutation.mutate({ 
        action: 'update-role', 
        data: { role: roleToUpdate } 
      })
    } else if (bulkActionDialog.action === 'delete') {
      bulkMutation.mutate({ action: 'delete' })
    }
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === (data?.data.length || 0)) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(data?.data.map(u => u.id) || [])
    }
  }

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
      ADMIN: 'bg-blue-100 text-blue-700 border-blue-200',
      ATHLETE: 'bg-green-100 text-green-700 border-green-200',
      CLIENT: 'bg-amber-100 text-amber-700 border-amber-200'
    }
    return variants[role as keyof typeof variants] || 'bg-stone-100 text-stone-700'
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">Error loading users. Please try again.</p>
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
              <h1 className="text-3xl font-bold text-stone-900">User Management</h1>
              <p className="text-stone-600 mt-1">View and manage all platform users</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExport} className="border-stone-200">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="border-stone-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Total Users</p>
                  <p className="text-2xl font-bold">{data?.pagination.total || 0}</p>
                </div>
              </CardContent>
            </Card>
            {data?.stats.byRole.map(stat => (
              <Card key={stat.role} className="border-stone-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    stat.role === 'SUPER_ADMIN' ? 'bg-purple-100' :
                    stat.role === 'ADMIN' ? 'bg-blue-100' :
                    stat.role === 'ATHLETE' ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    <Shield className={`w-5 h-5 ${
                      stat.role === 'SUPER_ADMIN' ? 'text-purple-600' :
                      stat.role === 'ADMIN' ? 'text-blue-600' :
                      stat.role === 'ATHLETE' ? 'text-green-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">{stat.role.replace('_', ' ')}s</p>
                    <p className="text-2xl font-bold">{stat._count}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-stone-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9 border-stone-200"
                />
              </div>
              
              <Select value={role} onValueChange={(value) => { setRole(value); setPage(1) }}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="ATHLETE">Athlete</SelectItem>
                  <SelectItem value="CLIENT">Client</SelectItem>
                </SelectContent>
              </Select>

              <Select value={hasProfile} onValueChange={(value) => { setHasProfile(value); setPage(1) }}>
                <SelectTrigger>
                  <SelectValue placeholder="Profile Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="true">Has Profile</SelectItem>
                  <SelectItem value="false">No Profile</SelectItem>
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
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="email-asc">Email A-Z</SelectItem>
                  <SelectItem value="email-desc">Email Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-stone-100 rounded-lg">
                <span className="text-sm font-medium">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
                <div className="h-4 w-px bg-stone-300 mx-2" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('verify')}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <MailCheck className="w-4 h-4 mr-1" />
                  Verify
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('unverify')}
                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                >
                  <MailX className="w-4 h-4 mr-1" />
                  Unverify
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('update-role')}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <UserCog className="w-4 h-4 mr-1" />
                  Change Role
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                  className="ml-auto"
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border-stone-200 shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === (data?.data.length || 0)}
                      onChange={toggleSelectAll}
                      className="rounded border-stone-300"
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead className="text-center">Applications</TableHead>
                  <TableHead className="text-center">Donations</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-900"></div>
                        <span className="ml-2">Loading users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data?.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-stone-500">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data.map((user) => (
                    <TableRow key={user.id} className="hover:bg-stone-50">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          className="rounded border-stone-300"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.image || ''} />
                            <AvatarFallback className="text-xs">
                              {getInitials(user.name, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name || 'No name'}</p>
                            <p className="text-xs text-stone-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadge(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isVerified ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                            <XCircle className="w-3 h-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.hasProfile ? (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                            {user.profileType}
                          </Badge>
                        ) : (
                          <span className="text-xs text-stone-400">No profile</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{user._count.applications}</TableCell>
                      <TableCell className="text-center">{user._count.donations}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-xs text-stone-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/users/${user.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/users/${user.id}/edit`}>
                                <UserCog className="w-4 h-4 mr-2" />
                                Edit User
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!user.isVerified ? (
                              <DropdownMenuItem onClick={() => {
                                setSelectedUsers([user.id])
                                bulkMutation.mutate({ action: 'verify-email' })
                              }}>
                                <MailCheck className="w-4 h-4 mr-2 text-green-600" />
                                Verify Email
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => {
                                setSelectedUsers([user.id])
                                bulkMutation.mutate({ action: 'unverify-email' })
                              }}>
                                <MailX className="w-4 h-4 mr-2 text-amber-600" />
                                Unverify Email
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedUsers([user.id])
                                setBulkActionDialog({ open: true, action: 'delete' })
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              {data.pagination.total} users
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
          onOpenChange={(open: boolean) => !open && setBulkActionDialog({ open: false, action: null })}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {bulkActionDialog.action === 'update-role' && 'Update User Roles'}
                {bulkActionDialog.action === 'delete' && 'Delete Users'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {bulkActionDialog.action === 'update-role' && (
                  <>
                    You are about to change the role of {selectedUsers.length} user(s).
                    This action will affect their permissions across the platform.
                  </>
                )}
                {bulkActionDialog.action === 'delete' && (
                  <>
                    You are about to delete {selectedUsers.length} user(s). 
                    This action cannot be undone. Users with existing applications 
                    or donations cannot be deleted.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {bulkActionDialog.action === 'update-role' && (
              <div className="py-4">
                <Label htmlFor="newRole">New Role</Label>
                <Select value={roleToUpdate} onValueChange={setRoleToUpdate}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select new role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="ATHLETE">Athlete</SelectItem>
                    <SelectItem value="CLIENT">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmBulkAction}
                disabled={bulkActionDialog.action === 'update-role' && !roleToUpdate}
                className={bulkActionDialog.action === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {bulkActionDialog.action === 'update-role' && 'Update Roles'}
                {bulkActionDialog.action === 'delete' && 'Delete Users'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}