'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  CheckCircle2,
  Users,
  Trophy,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Opportunity {
  id: string
  title: string
  sport: string
  category: string
  organization: string
  location: string
  city: string
  state: string
  type: string
  salaryMin?: number | null
  salaryMax?: number | null
  description: string
  requirements: string[]
  benefits: string[]
  responsibilities: string[]
  status: string
  postedDate: string
  deadline?: string | null
  applicants: number
  imageUrl?: string | null
}

interface OpportunityDetailsProps {
  id: string
  /** Where the "Back" link navigates to */
  backHref: string
  /** Override the apply link base, defaults to `/opportunities/:id/apply` */
  applyHref?: string
}

async function fetchOpportunity(id: string): Promise<Opportunity> {
  const res = await fetch(`/api/opportunities/${id}`)
  if (!res.ok) throw new Error('Failed to load opportunity')
  return res.json()
}

export function OpportunityDetails({ id, backHref, applyHref }: OpportunityDetailsProps) {
  const { data: opportunity, isLoading, isError } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: () => fetchOpportunity(id),
  })

  const resolvedApplyHref = applyHref ?? `/opportunities/${id}/apply`

  if (isLoading) return <OpportunityDetailsSkeleton />
  if (isError || !opportunity) {
    return (
      <div className="container py-24 text-center">
        <p className="text-muted-foreground">Could not load this opportunity.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={backHref}>Go Back</Link>
        </Button>
      </div>
    )
  }

  const postedDate = new Date(opportunity.postedDate)
  const deadline = opportunity.deadline ? new Date(opportunity.deadline) : null

  return (
    <div className="flex flex-col">
      {/* Back link */}
      <div className="container pt-8">
        <Button asChild variant="ghost" className="gap-2 -ml-2 text-muted-foreground">
          <Link href={backHref}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-br from-stone-900 to-black rounded-2xl px-16 mt-4 overflow-hidden mx-4 lg:mx-0">
        <div className="absolute inset-0">
          {opportunity.imageUrl && (
            <Image
              src={opportunity.imageUrl}
              alt={opportunity.title}
              fill
              className="object-cover opacity-40"
            />
          )}
        </div>
        <div className="container relative h-full flex items-end pb-12">
          <div className="text-white space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-amber-600 hover:bg-amber-700">{opportunity.sport}</Badge>
              <Badge className="bg-white text-black">{opportunity.type}</Badge>
              <Badge variant="outline" className="border-white text-white">
                {opportunity.applicants} Applicants
              </Badge>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold">{opportunity.title}</h1>
            <p className="text-xl text-white/90">{opportunity.organization}</p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Info */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-medium">Location</span>
                      </div>
                      <p className="font-semibold">{opportunity.city}</p>
                      <p className="text-sm text-muted-foreground">{opportunity.state}</p>
                    </div>

                    {(opportunity.salaryMin || opportunity.salaryMax) && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xs font-medium">Salary</span>
                        </div>
                        {opportunity.salaryMin && (
                          <p className="font-semibold">${opportunity.salaryMin.toLocaleString()}</p>
                        )}
                        {opportunity.salaryMax && (
                          <p className="text-sm text-muted-foreground">
                            — ${opportunity.salaryMax.toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-xs font-medium">Type</span>
                      </div>
                      <p className="font-semibold">{opportunity.type}</p>
                    </div>

                    {deadline && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-medium">Deadline</span>
                        </div>
                        <p className="font-semibold">
                          {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-muted-foreground">{deadline.getFullYear()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">About This Opportunity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {opportunity.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </CardContent>
              </Card>

              {/* Responsibilities */}
              {opportunity.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-amber-600" />
                      Responsibilities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {opportunity.responsibilities.map((item, index) => (
                        <li key={index} className="flex gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Requirements */}
              {opportunity.requirements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-amber-600" />
                      Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {opportunity.requirements.map((item, index) => (
                        <li key={index} className="flex gap-3">
                          <div className="w-2 h-2 bg-amber-600 rounded-full flex-shrink-0 mt-2" />
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {opportunity.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Users className="w-6 h-6 text-amber-600" />
                      Benefits & Perks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {opportunity.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex gap-3 p-4 bg-gradient-to-br from-amber-50 to-stone-50 rounded-lg border border-amber-200"
                        >
                          <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Application Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-2 border-amber-200 bg-gradient-to-br from-white to-amber-50">
                  <CardHeader>
                    <CardTitle className="text-xl">Ready to Apply?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Posted</span>
                        <span className="font-medium">
                          {postedDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Applicants</span>
                        <span className="font-medium">{opportunity.applicants}</span>
                      </div>
                      {deadline && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Deadline</span>
                          <span className="font-medium text-amber-700">
                            {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t space-y-3">
                      <Button
                        className="w-full bg-black hover:bg-black/90 rounded-full"
                        size="lg"
                        asChild
                      >
                        <Link href={resolvedApplyHref}>Apply Now</Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-black"
                        size="lg"
                      >
                        Save for Later
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      Application takes approximately 10–15 minutes
                    </p>
                  </CardContent>
                </Card>

                {/* Organization Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About the Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-100 rounded-lg flex items-center justify-center">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold">{opportunity.organization}</p>
                        <p className="text-sm text-muted-foreground">{opportunity.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Leading sports organization dedicated to developing world-class athletes and
                      providing exceptional opportunities for growth and success.
                    </p>
                    <Button variant="outline" className="w-full rounded-full" size="sm">
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Loading Skeleton ────────────────────────────────────────────────────────

function OpportunityDetailsSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="container pt-8">
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="relative h-96 bg-stone-200 rounded-2xl mx-4 mt-4 overflow-hidden animate-pulse" />
      <div className="py-12 container grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  )
}
