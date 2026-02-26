'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Building2, Briefcase, Phone, Mail, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ClientProfile {
  id: string
  userId: string
  organization: string
  title: string
  phone: string | null
  bio: string | null
  createdAt: string
  updatedAt: string
  User: {
    name: string | null
    email: string
    image: string | null
  }
  Opportunity?: any[]
}

interface ProfileUpdatePayload {
  name: string
  organization: string
  title: string
  phone: string
  bio: string
  image?: string
}

export default function ClientProfilePage() {
  const queryClient = useQueryClient()

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    title: '',
    phone: '',
    bio: '',
    image: ''
  })

  const { data: profile, isLoading: loading } = useQuery<ClientProfile>({
    queryKey: ['client-profile'],
    queryFn: async () => {
      const response = await fetch('/api/client/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()

      // Sync form data on load
      setFormData({
        name: data.User?.name || '',
        organization: data.organization || '',
        title: data.title || '',
        phone: data.phone || '',
        bio: data.bio || '',
        image: data.User?.image || ''
      })
      return data
    }
  })

  const saveMutation = useMutation({
    mutationFn: async (payload: ProfileUpdatePayload) => {
      const response = await fetch('/api/client/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error('Failed to save profile')
      return response.json()
    },
    onSuccess: () => {
      alert("Profile saved successfully")
      queryClient.invalidateQueries({ queryKey: ['client-profile'] })
      queryClient.invalidateQueries({ queryKey: ['client-dashboard'] })
    },
    onError: () => {
      alert("Failed to save profile")
    }
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    const payload = {
      name: formData.name,
      organization: formData.organization,
      title: formData.title,
      phone: formData.phone,
      bio: formData.bio,
      image: formData.image || undefined
    }
    saveMutation.mutate(payload)
  }

  const saving = saveMutation.isPending

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900 mx-auto"></div>
        <p className="mt-4 text-stone-600">Loading profile...</p>
      </div>
    </div>
  )

  if (!profile) return (
    <div className="text-center py-12">
      <p className="text-stone-600">Profile not found.</p>
      <Button onClick={handleSave} className="mt-4">
        Create Profile
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto py-8">
        {/* Profile Header */}
        <div className="mb-8 ms-3">
          <h1 className="text-3xl font-bold text-stone-900">Client Profile</h1>
          <p className="text-stone-600 mt-1">Manage your organization details and preferences</p>
        </div>

        {/* Profile Summary Card */}
        <Card className="mb-8 border-stone-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-20 h-20 border-2 border-stone-200">
                <AvatarImage src={formData.image || profile.User?.image || ''} />
                <AvatarFallback className="bg-stone-100 text-stone-600 text-xl">
                  {formData.organization?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-stone-900">{formData.organization}</h2>
                <p className="text-stone-600 mt-1">{formData.title}</p>
                <div className="flex gap-4 mt-3 text-sm text-stone-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profile.User?.email}
                  </span>
                  {formData.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {formData.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Details */}
        <Card className="mb-6 border-stone-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-stone-600" />
              <CardTitle>Organization Details</CardTitle>
            </div>
            <CardDescription>Information about your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization Name *</Label>
              <Input
                id="organization"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder="e.g., Elite Sports Management"
                className="border-stone-200 focus:border-stone-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Your Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Talent Scout, Sports Agent"
                className="border-stone-200 focus:border-stone-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6 border-stone-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-stone-600" />
              <CardTitle>Contact Information</CardTitle>
            </div>
            <CardDescription>How can athletes and recruiters reach you?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="border-stone-200 focus:border-stone-400"
              />
              <p className="text-xs text-stone-500">This is how your name will appear publicly</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="border-stone-200 focus:border-stone-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        <Card className="mb-6 border-stone-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-stone-600" />
              <CardTitle>About / Bio</CardTitle>
            </div>
            <CardDescription>Tell athletes about your organization and what you're looking for</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Describe your organization, areas of expertise, and what kind of athletes you're seeking..."
              className="min-h-32 border-stone-200 focus:border-stone-400"
            />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-stone-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !formData.organization || !formData.title}
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

        {/* Help Text */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            <span className="font-semibold">Note:</span> Fields marked with * are required. 
            Complete your profile to appear more credible to athletes.
          </p>
        </div>
      </div>
    </div>
  )
}