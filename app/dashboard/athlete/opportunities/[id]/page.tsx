'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Opportunity } from '@/app/types/athlete'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, MapPin, Calendar, CheckCircle, Bookmark, BookmarkCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function AthleteOpportunityDetailsPage() {
    const { id } = useParams()
    const router = useRouter()

    const queryClient = useQueryClient()

    const { data: opportunity, isLoading: loading } = useQuery<Opportunity>({
        queryKey: ['opportunity', id],
        queryFn: async () => {
            const response = await fetch(`/api/athlete/opportunities/${id}`)
            if (!response.ok) throw new Error('Failed to fetch opportunity')
            return response.json()
        },
        enabled: !!id
    })

    const { data: isSaved = false } = useQuery({
        queryKey: ['is-opportunity-saved', id],
        queryFn: async () => {
            const response = await fetch('/api/athlete/saved')
            if (!response.ok) return false
            const data: Opportunity[] = await response.json()
            return data.some((item) => item.id === id)
        },
        enabled: !!id
    })

    const saveMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/athlete/opportunities/${id}/save`, { method: 'POST' })
            if (!response.ok) throw new Error('Failed to toggle save')
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['saved-opportunities', id] })
            queryClient.invalidateQueries({ queryKey: ['athlete-dashboard'] })
        }
    })

    const handleSave = () => {
        saveMutation.mutate()
    }

    if (loading) return <div className="text-center py-12">Loading details...</div>
    if (!opportunity) return <div className="text-center py-12">Opportunity not found.</div>

    return (
        <div className="min-h-screen  pb-8">
            <div className="container mx-auto space-y-8">

                {/* Navigation */}
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        onClick={() => router.back()}
                        className="hover:bg-transparent"
                    >
                        ← Back
                    </Button>
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/dashboard/athlete" className="hover:text-foreground">
                            Dashboard
                        </Link>
                        <span>/</span>
                        <Link href="/dashboard/athlete/opportunities" className="hover:text-foreground">
                            Opportunities
                        </Link>
                        <span>/</span>
                        <span className="text-foreground font-medium truncate max-w-[200px]">
                            {opportunity.title}
                        </span>
                    </nav>
                </div>

                {/* Header Section */}
                <Card>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline">{opportunity.sport}</Badge>
                                    <Badge>{opportunity.type}</Badge>
                                    <Badge variant="secondary">{opportunity.category}</Badge>
                                </div>
                                <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
                                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-1"><Building className="w-4 h-4" /> {opportunity.client?.organization}</div>
                                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {opportunity.location}</div>
                                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Posted: {new Date(opportunity.postedDate).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant={isSaved ? "secondary" : "outline"} onClick={handleSave}>
                                    {isSaved ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                                    {isSaved ? 'Saved' : 'Save'}
                                </Button>
                                <Button size="lg" asChild>
                                    <Link href={`/dashboard/athlete/opportunities/${id}/apply`}>
                                        Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Salary Range</p>
                                <p className="font-semibold">{opportunity.salaryMin ? `$${opportunity.salaryMin.toLocaleString()}` : 'Negotiable'} {opportunity.salaryMax && `- $${opportunity.salaryMax.toLocaleString()}`}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Application Deadline</p>
                                <p className="font-semibold">{opportunity.deadline ? new Date(opportunity.deadline).toLocaleDateString() : 'Open'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                            <CardContent className="prose max-w-none">
                                <p className="whitespace-pre-wrap">{opportunity.description}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {opportunity.requirements?.map((req: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                            <span>{req}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Benefits</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {opportunity.benefits?.map((benefit: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <span>{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Application Process Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Application Process</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-muted-foreground">
                                        This opportunity requires a comprehensive application including:
                                    </p>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <span>Personal information and contact details</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <span>Athletic background and achievements</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <span>Cover letter or personal statement</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <span>Resume or CV upload</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <span>References (optional but recommended)</span>
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-1 space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Ready to Apply?</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="bg-primary/5 p-4 rounded-lg">
                                    <p className="text-sm font-medium mb-2">Complete Application Required</p>
                                    <p className="text-sm text-muted-foreground">
                                        This position requires a detailed application. Please use our dedicated application form to ensure all required information is submitted.
                                    </p>
                                </div>
                                
                                <Button 
                                    className="w-full" 
                                    size="lg" 
                                    asChild
                                >
                                    <Link href={`/dashboard/athlete/opportunities/${id}/apply`}>
                                        Start Application
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Link>
                                </Button>

                                <div className="space-y-3">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Before you apply
                                    </p>
                                    <div className="text-xs text-muted-foreground space-y-2">
                                        <p>✓ Ensure your athlete profile is up to date</p>
                                        <p>✓ Have your resume/CV ready to upload</p>
                                        <p>✓ Prepare any relevant achievements or stats</p>
                                        <p>✓ Applications typically take 10-15 minutes</p>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <p className="text-xs text-center text-muted-foreground">
                                        Have questions? <Link href="/contact" className="text-primary hover:underline">Contact support</Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Similar Opportunities Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Similar Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <p className="text-muted-foreground col-span-full text-center py-8">
                                Similar opportunities will appear here based on your preferences.
                            </p>
                        </div>
                        <div className="flex justify-center mt-4">
                            <Button variant="outline" asChild>
                                <Link href="/dashboard/athlete/opportunities">
                                    Browse All Opportunities
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}