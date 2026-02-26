'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, ThumbsDown, Clock, ArrowLeft, Mail, User, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface OpportunityDetail {
  id: string
  title: string
  organization: string
  description: string
  sport: string
  type: string
  status: string
  location: string
  requirements: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    ClientProfile?: {
      id: string
      organization: string
      title: string
      name: string
      email: string
    }
  }
  Application: Array<{
    id: string
    status: string
    appliedAt: string
    athlete: {
      user: {
        name: string
        email: string
        image: string
      }
    }
  }>
  _count: {
    applications: number
    savedBy: number
  }
}

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: opportunity, isLoading } = useQuery<OpportunityDetail>({
    queryKey: ['admin-opportunity', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/opportunities/${id}`)
      if (!response.ok) throw new Error('Failed to fetch opportunity')
      return response.json()
    }
  })

  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/admin/opportunities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (!response.ok) throw new Error('Failed to update status')
      return response.json()
    },
    onSuccess: (_, status) => {
      toast.success(`Opportunity ${status.toLowerCase()}`, {
        description: `The opportunity has been ${status.toLowerCase()}.`
      })
      router.refresh()
    },
    onError: () => {
      toast.error('Failed to update status')
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-600">Opportunity not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto py-8 px-4 max-w-6xl">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/dashboard/admin/opportunities">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Opportunities
          </Link>
        </Button>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{opportunity.title}</h1>
            <p className="text-stone-600 mt-1">{opportunity.organization}</p>
          </div>
          <div className="flex items-center gap-2">
            {opportunity.status === 'PENDING' && (
              <>
                <Button
                  onClick={() => statusMutation.mutate('APPROVED')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => statusMutation.mutate('REJECTED')}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <ThumbsDown className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status and metadata */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-stone-500">Status</p>
              <Badge className="mt-1">
                {opportunity.status}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-stone-500">Applications</p>
              <p className="text-2xl font-bold">{opportunity._count.applications}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-stone-500">Saved</p>
              <p className="text-2xl font-bold">{opportunity._count.savedBy}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-stone-500">Created</p>
              <p className="font-medium">{new Date(opportunity.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-stone-600">{opportunity.description}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <p className="text-stone-600 whitespace-pre-line">{opportunity.requirements}</p>
                </div>
              </CardContent>
            </Card>

            {/* Applications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {opportunity.Application.length === 0 ? (
                  <p className="text-stone-500 text-center py-4">No applications yet</p>
                ) : (
                  <div className="space-y-4">
                    {opportunity.Application.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{app.athlete.user.name}</p>
                          <p className="text-sm text-stone-500">{app.athlete.user.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{app.status}</Badge>
                          <p className="text-xs text-stone-400 mt-1">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator info */}
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-stone-100 rounded-full">
                    <User className="w-5 h-5 text-stone-600" />
                  </div>
                  <div>
                    <p className="font-medium">{opportunity.user?.ClientProfile?.name || 'Unknown'}</p>
                    <p className="text-sm text-stone-500">{opportunity?.user?.ClientProfile?.email}</p>
                  </div>
                </div>
                {opportunity.user?.ClientProfile && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-stone-500">Organization</p>
                    <p className="font-medium">{opportunity.user?.ClientProfile.organization}</p>
                    <p className="text-sm text-stone-500 mt-1">Title: {opportunity.user.ClientProfile.title}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/dashboard/admin/users/${opportunity.user?.ClientProfile?.id}`}>
                    <User className="w-4 h-4 mr-2" />
                    View Creator Profile
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/dashboard/admin/users?search=${opportunity.user?.ClientProfile?.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Creator
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/dashboard/admin/opportunities/${id}/edit`}>
                    <FileText className="w-4 h-4 mr-2" />
                    Edit Opportunity
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}