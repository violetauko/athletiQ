'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Users,
    Briefcase,
    MessageSquare,
    TrendingUp,
    Eye,
    Plus,
    Loader2,
    Calendar,
    Pencil,
    // Settings,
    // CheckCircle2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { ApplicationModal } from './client/application-modal'
import { Opportunity } from '@/app/types/athlete'

type Tab = 'opportunities' | 'applications' | 'messages'

export function ClientDashboard() {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<Tab>('opportunities')

    const [isOppModalOpen, setOppModalOpen] = useState(false)
    const [editingOpp, setEditingOpp] = useState<any>(null)

    const [selectedApp, setSelectedApp] = useState<any>(null)
    const router = useRouter()

    // Data Fetching
    const { data: opportunities = [], isLoading: oppsLoading } = useQuery({
        queryKey: ['client-opportunities'],
        queryFn: async () => {
            const res = await fetch('/api/client/opportunities')
            if (!res.ok) throw new Error('Failed to fetch opportunities')
            return res.json()
        },
        staleTime: 1000*60*10
    })

    const { data: applications = [], isLoading: appsLoading } = useQuery({
        queryKey: ['client-applications'],
        queryFn: async () => {
            const res = await fetch('/api/client/applications')
            if (!res.ok) throw new Error('Failed to fetch applications')
            return res.json()
        },
        staleTime: 1000*60*10
    })

    const { data: messages = [], isLoading: msgsLoading } = useQuery({
        queryKey: ['client-messages'],
        queryFn: async () => {
            const res = await fetch('/api/client/messages')
            if (!res.ok) throw new Error('Failed to fetch messages')
            return res.json()
        }
    })

    // Mutations
    const createOppMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch('/api/client/opportunities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error('Failed to create')
            return res.json()
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-opportunities'] })
    })

    const updateOppMutation = useMutation({
        mutationFn: async ({ id, payload }: { id: string, payload: any }) => {
            const res = await fetch(`/api/client/opportunities/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            if (!res.ok) throw new Error('Failed to update')
            return res.json()
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-opportunities'] })
    })

    const isLoading = oppsLoading || appsLoading || msgsLoading

    const stats = {
        activeListings: opportunities.filter((o: any) => o.status === 'ACTIVE').length,
        pendingListings: opportunities.filter((o: any) => o.status === 'DRAFT' || o.status === 'PENDING_APPROVAL').length,
        totalApplicants: applications.length,
        newMessages: messages.filter((m: any) => !m.isRead).length,
    }

    const handleOppSubmit = async (payload: any) => {
        if (editingOpp) {
            await updateOppMutation.mutateAsync({ id: editingOpp.id, payload })
        } else {
            await createOppMutation.mutateAsync(payload)
        }
        setOppModalOpen(false)
        setEditingOpp(null)
    }

    return (
        <div className="min-h-screen">
            {/* Header */}
            <section className="bg-linear-to-br from-stone-900 to-black text-white py-12 mt-12 rounded-2xl px-12">
                <div className="">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold mb-2">Recruiter Dashboard</h1>
                            <p className="text-white/80">Manage your postings and review top talent.</p>
                        </div>
                        <Button className="bg-white text-black hover:bg-white/90" 
                            onClick={() => router.push('/opportunities/new')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Post Opportunity
                        </Button>
                    </div>
                </div>
            </section>

            <div className="py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-6">
                                <nav className="space-y-2">
                                    {/* <Button variant={activeTab === 'overview' ? 'default' : 'ghost'} className={`w-full justify-start ${activeTab === 'overview' ? 'bg-black' : ''}`} onClick={() => setActiveTab('overview')}>
                                        <TrendingUp className="w-4 h-4 mr-2" /> Overview
                                    </Button> */}
                                    <Button variant={activeTab === 'opportunities' ? 'default' : 'ghost'} className={`w-full justify-start ${activeTab === 'opportunities' ? 'bg-black' : ''}`} onClick={() => setActiveTab('opportunities')}>
                                        <Briefcase className="w-4 h-4 mr-2" /> My Opportunities
                                    </Button>
                                    <Button variant={activeTab === 'applications' ? 'default' : 'ghost'} className={`w-full justify-start ${activeTab === 'applications' ? 'bg-black' : ''}`} onClick={() => setActiveTab('applications')}>
                                        <Users className="w-4 h-4 mr-2" /> Applications
                                    </Button>
                                    <Button variant={activeTab === 'messages' ? 'default' : 'ghost'} className={`w-full justify-start ${activeTab === 'messages' ? 'bg-black' : ''}`} onClick={() => setActiveTab('messages')}>
                                        <MessageSquare className="w-4 h-4 mr-2" /> Messages
                                    </Button>
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        {isLoading ? (
                            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>
                        ) : (
                            <>
                                {/* {activeTab === 'overview' && ( */}
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <Card>
                                                <CardContent className="p-6">
                                                    <Briefcase className="w-8 h-8 text-blue-600 mb-2" />
                                                    <div className="text-3xl font-bold mb-1">{stats.activeListings}</div>
                                                    <div className="text-sm text-muted-foreground">Active Listings</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="p-6">
                                                    <Loader2 className="w-8 h-8 text-amber-600 mb-2" />
                                                    <div className="text-3xl font-bold mb-1">{stats.pendingListings}</div>
                                                    <div className="text-sm text-muted-foreground">Pending Approval</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="p-6">
                                                    <Users className="w-8 h-8 text-green-600 mb-2" />
                                                    <div className="text-3xl font-bold mb-1">{stats.totalApplicants}</div>
                                                    <div className="text-sm text-muted-foreground">Total Applicants</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardContent className="p-6">
                                                    <MessageSquare className="w-8 h-8 text-purple-600 mb-2" />
                                                    <div className="text-3xl font-bold mb-1">{stats.newMessages}</div>
                                                    <div className="text-sm text-muted-foreground">Unread Messages</div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                {/* )}*/}

                                {activeTab === 'opportunities' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>My Opportunities</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {opportunities.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-10">You have not posted any opportunities yet.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {opportunities.map((opp:Opportunity) => (
                                                        <div key={opp.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-white transition-colors gap-4 bg-stone-50">
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold text-lg">{opp.title}</h3>
                                                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-1">
                                                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {opp.createdAt? new Date(opp.createdAt).toLocaleDateString(): Date.now()}</span>
                                                                    <span>•</span>
                                                                    <span>{opp.location}</span>
                                                                    <span>•</span>
                                                                    <span className="font-medium text-black">{opp.count || 0} Apps</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="outline" className={`
                                                                    ${opp.status === 'ACTIVE' ? 'border-green-200 text-green-700 bg-green-50' :
                                                                        opp.status === 'PENDING_APPROVAL' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                                                                            'border-stone-200 text-stone-700'}
                                                                `}>
                                                                    {opp.status.replace('_', ' ')}
                                                                </Badge>
                                                                <Button variant="outline" size="sm" onClick={() => router.push(`/opportunities/${opp.id}/edit`)}>
                                                                    <Pencil className="w-3 h-3 mr-2" /> Edit
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {activeTab === 'applications' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Applications</CardTitle>
                                            <CardDescription>Review athletes who have applied to your opportunities.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {applications.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-10">No applications received yet.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {applications.map((app: any) => (
                                                        <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-stone-50 transition-colors">
                                                            <div>
                                                                <h3 className="font-semibold">{app.athlete.firstName} {app.athlete.lastName}</h3>
                                                                <p className="text-sm text-muted-foreground">Applied for: {app.opportunity.title}</p>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <Badge variant="secondary">{app.status}</Badge>
                                                                <Button variant="ghost" size="sm" onClick={() => setSelectedApp(app)}>
                                                                    <Eye className="w-4 h-4 mr-2" /> Review
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}

                                {activeTab === 'messages' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Inbox</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {messages.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-10">No messages in your inbox.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {messages.map((msg: any) => (
                                                        <div key={msg.id} className={`p-4 border rounded-lg ${!msg.isRead ? 'bg-blue-50/50 border-blue-100' : 'bg-stone-50'}`}>
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <span className="font-semibold text-sm">{msg.sender?.name || 'Unknown User'}</span>
                                                                    <Badge variant="outline" className="ml-2 text-[10px]">{msg.opportunity?.title}</Badge>
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleString()}</span>
                                                            </div>
                                                            <p className="text-sm text-stone-700">{msg.content}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ApplicationModal
                isOpen={!!selectedApp}
                onClose={() => setSelectedApp(null)}
                application={selectedApp}
            />

        </div>
    )
}
