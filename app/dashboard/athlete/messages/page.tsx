'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Message, Conversation, User } from '@/app/types/athlete'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, User as UserIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function AthleteMessagesPage() {
    const { data: session } = useSession()
    const queryClient = useQueryClient()

    // UI State
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')

    const { data: messages = [], isLoading: loading } = useQuery<Message[]>({
        queryKey: ['athlete-messages'],
        queryFn: async () => {
            const response = await fetch('/api/athlete/messages')
            if (!response.ok) throw new Error('Failed to fetch messages')
            return response.json()
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    })

    const sendMutation = useMutation({
        mutationFn: async ({ receiverId, content }: { receiverId: string, content: string }) => {
            const response = await fetch('/api/athlete/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId, content })
            })
            if (!response.ok) throw new Error('Failed to send message')
            return response.json()
        },
        onSuccess: () => {
            setReplyContent('')
            queryClient.invalidateQueries({ queryKey: ['athlete-messages'] })
        }
    })

    // Group messages by counterpart (the other person in the conversation)
    const groupedMessages = messages.reduce<Record<string, Conversation>>((acc, msg) => {
        const isSender = session?.user?.id === msg.senderId
        const counterpart = isSender ? msg.receiver : msg.sender
        const counterpartId = counterpart.id

        if (!acc[counterpartId]) {
            acc[counterpartId] = {
                counterpart,
                messages: [],
                lastUpdated: msg.createdAt
            }
        }
        acc[counterpartId].messages.push(msg)
        return acc
    }, {})

    const conversations = Object.values(groupedMessages).sort(
        (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    )

    const handleSend = () => {
        if (!replyContent.trim() || !selectedConversation) return
        sendMutation.mutate({ receiverId: selectedConversation, content: replyContent })
    }

    const sending = sendMutation.isPending

    return (
        <div className="min-h-screen bg-stone-50 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6">Messages</h1>

                {loading ? (
                    <div className="text-center py-12">Loading messages...</div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        You don&apos;t have any messages yet. Apply to opportunities to start conversations.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Conversation List */}
                        <Card className="md:col-span-1 h-[600px] overflow-y-auto">
                            <div className="flex flex-col">
                                {conversations.map((conv) => (
                                    <div
                                        key={conv.counterpart.id}
                                        className={`p-4 border-b cursor-pointer hover:bg-stone-50 transition-colors ${selectedConversation === conv.counterpart.id ? 'bg-stone-100 border-l-4 border-l-black' : ''}`}
                                        onClick={() => setSelectedConversation(conv.counterpart.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-stone-500" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h3 className="font-semibold truncate">{conv.counterpart.name || 'Unknown User'}</h3>
                                                <p className="text-xs text-muted-foreground truncate">{conv.counterpart.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Active Conversation */}
                        <Card className="md:col-span-2 h-[600px] flex flex-col">
                            {selectedConversation ? (
                                <>
                                    <CardHeader className="border-b">
                                        <CardTitle>{groupedMessages[selectedConversation].counterpart.name || 'Unknown User'}</CardTitle>
                                        <CardDescription>{groupedMessages[selectedConversation].counterpart.role}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
                                        {/* Messages are displayed in reverse chronological order from API, so reverse them for chat view */}
                                        {[...groupedMessages[selectedConversation].messages].reverse().map((msg) => {
                                            const isMe = msg.senderId === session?.user?.id
                                            return (
                                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[75%] rounded-lg p-3 ${isMe ? 'bg-black text-white' : 'bg-stone-100 text-stone-900 border'}`}>
                                                        {msg.opportunity && (
                                                            <div className={`text-xs mb-1 mb-2 pb-1 border-b ${isMe ? 'border-white/20' : 'border-stone-200'} opacity-80`}>
                                                                Regarding: {msg.opportunity.title}
                                                            </div>
                                                        )}
                                                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'opacity-70' : 'text-muted-foreground'}`}>
                                                            {new Date(msg.createdAt).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </CardContent>
                                    <div className="p-4 border-t mt-auto">
                                        <div className="flex gap-2">
                                            <Textarea
                                                placeholder="Type your message..."
                                                className="min-h-[60px] resize-none"
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                            />
                                            <Button
                                                className="h-auto"
                                                onClick={handleSend}
                                                disabled={sending || !replyContent.trim()}
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    Select a conversation to start messaging
                                </div>
                            )}
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
