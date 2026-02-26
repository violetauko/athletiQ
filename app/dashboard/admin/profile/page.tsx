'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Mail, User, Shield, Calendar, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface AdminUser {
  id: string
  name: string | null
  email: string
  image: string | null
  role: 'ADMIN' | 'SUPER_ADMIN' | 'ATHLETE' | 'CLIENT'
  createdAt: string
  updatedAt: string
  _count?: {
    donations?: number
    contactSubmissions?: number
  }
}

interface ProfileUpdatePayload {
  name: string
  image?: string
}

export default function AdminProfilePage() {
  const queryClient = useQueryClient()

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    image: ''
  })

  const { data: user, isLoading: loading } = useQuery<AdminUser>({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const response = await fetch('/api/admin/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()

      // Sync form data on load
      setFormData({
        name: data.name || '',
        image: data.image || ''
      })
      return data
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const response = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save profile')
      }
      return response.json()
    },
    onSuccess: () => {
      toast.success('Profile saved successfully', {
        description: 'Your changes have been saved.',
        duration: 3000,
      })
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] })
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] })
    },
    onError: (error: Error) => {
      toast.error('Failed to save profile', {
        description: error.message || 'Please try again later.',
        duration: 5000,
      })
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // Validate
    if (!formData.name.trim()) {
      toast.warning('Name is required', {
        description: 'Please enter your name.',
        duration: 3000,
      })
      return
    }

    const payload = {
      name: formData.name,
      image: formData.image || undefined
    }
    saveMutation.mutate(payload)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      image: user?.image || ''
    })
    toast.info('Changes discarded', {
      description: 'Your changes have been reset.',
      duration: 2000,
    })
  }

  const saving = saveMutation.isPending

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'ADMIN':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200'
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto"></div>
        <p className="mt-4 text-stone-600">Loading profile...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <div className="mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-stone-600" />
            <h1 className="text-3xl font-bold text-stone-900">Admin Profile</h1>
          </div>
          <p className="text-stone-600">Manage your account details</p>
        </div>

        {/* Profile Summary Card */}
        <Card className="mb-8 border-stone-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="w-24 h-24 border-2 border-stone-200">
                <AvatarImage src={formData.image || user?.image || ''} />
                <AvatarFallback className="bg-stone-100 text-stone-600 text-2xl">
                  {formData.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-stone-900">
                    {formData.name || user?.name || 'Admin User'}
                  </h2>
                  <Badge variant="outline" className={getRoleBadgeColor(user?.role || 'ADMIN')}>
                    {user?.role}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-stone-600">
                    <Mail className="w-4 h-4" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user?.createdAt || '').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  {user?._count && (
                    <div className="flex gap-4 mt-2 text-sm">
                      {user._count.donations !== undefined && (
                        <span className="text-stone-600">
                          <span className="font-semibold">{user._count.donations}</span> donations processed
                        </span>
                      )}
                      {user._count.contactSubmissions !== undefined && (
                        <span className="text-stone-600">
                          <span className="font-semibold">{user._count.contactSubmissions}</span> contact submissions
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-6 border-stone-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-stone-600" />
              <CardTitle>Personal Information</CardTitle>
            </div>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="border-stone-200 focus:border-stone-400"
              />
              <p className="text-xs text-stone-500">This is how your name will appear across the platform</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="border-stone-200 bg-stone-50"
              />
              <p className="text-xs text-stone-500">Email cannot be changed. Contact support for email updates.</p>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="mb-6 border-stone-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-stone-600" />
              <CardTitle>Account Information</CardTitle>
            </div>
            <CardDescription>Your account details and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="divide-y divide-stone-200">
              <div className="py-3 flex justify-between">
                <dt className="text-sm text-stone-500">User ID</dt>
                <dd className="text-sm font-mono text-stone-900">{user?.id}</dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-sm text-stone-500">Role</dt>
                <dd className="text-sm">
                  <Badge variant="outline" className={getRoleBadgeColor(user?.role || 'ADMIN')}>
                    {user?.role}
                  </Badge>
                </dd>
              </div>
              <div className="py-3 flex justify-between">
                <dt className="text-sm text-stone-500">Last Updated</dt>
                <dd className="text-sm text-stone-900">
                  {new Date(user?.updatedAt || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="border-stone-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-stone-900 hover:bg-stone-800 text-white min-w-32"
          >
            {saving ? (
              <>
                <span className="animate-spin mr-2">◌</span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}