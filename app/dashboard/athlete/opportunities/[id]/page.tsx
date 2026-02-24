'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Opportunity } from '@/app/types/athlete'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Building, MapPin, Briefcase, Calendar, CheckCircle, Bookmark, BookmarkCheck } from 'lucide-react'

export default function AthleteOpportunityDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const [coverLetter, setCoverLetter] = useState('')

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

    const applyMutation = useMutation({
        mutationFn: async (coverLetter: string) => {
            const response = await fetch(`/api/athlete/opportunities/${id}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coverLetter })
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text)
            }
            return response.json()
        },
        onSuccess: () => {
            alert('Application submitted successfully!')
            router.push('/dashboard/athlete/applications')
        },
        onError: (error: Error) => {
            alert(`Application failed: ${error.message}`)
        }
    })

    const saveMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/athlete/opportunities/${id}/save`, { method: 'POST' })
            if (!response.ok) throw new Error('Failed to toggle save')
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['is-opportunity-saved', id] })
            queryClient.invalidateQueries({ queryKey: ['athlete-dashboard'] })
        }
    })

    const handleApply = () => {
        applyMutation.mutate(coverLetter)
    }

    const handleSave = () => {
        saveMutation.mutate()
    }

    const applying = applyMutation.isPending

    if (loading) return <div className="text-center py-12">Loading details...</div>
    if (!opportunity) return <div className="text-center py-12">Opportunity not found.</div>

    return (
        <div className="min-h-screen bg-stone-50 py-8">
            <div className="container max-w-4xl mx-auto space-y-8">

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
                                    <div className="flex items-center gap-1"><Building className="w-4 h-4" /> {opportunity.client.organization}</div>
                                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {opportunity.location}</div>
                                    <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Posted: {new Date(opportunity.postedDate).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant={isSaved ? "secondary" : "outline"} onClick={handleSave}>
                                    {isSaved ? <BookmarkCheck className="w-4 h-4 mr-2" /> : <Bookmark className="w-4 h-4 mr-2" />}
                                    {isSaved ? 'Saved' : 'Save'}
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
                    </div>

                    <div className="md:col-span-1 space-y-6">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Apply Now</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cover Letter / Message (Optional)</label>
                                    <Textarea
                                        placeholder="Briefly introduce yourself and why you're a good fit..."
                                        className="min-h-37.5"
                                        value={coverLetter}
                                        onChange={(e) => setCoverLetter(e.target.value)}
                                    />
                                </div>
                                <Button className="w-full" size="lg" onClick={handleApply} disabled={applying}>
                                    {applying ? 'Submitting...' : 'Submit Application'}
                                </Button>
                                <p className="text-xs text-center text-muted-foreground">
                                    Your default profile will be attached to this application automatically.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    )
}
