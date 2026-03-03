import { prisma } from "./prisma"

// Types
interface DashboardStats {
    totalOpportunities: number
    activeListings: number
    pendingListings: number
    draftListings: number
    expiredListings: number
    totalApplicants: number
    newApplications: number
    reviewedApplications: number
    shortlistedApplications: number
    rejectedApplications: number
    totalMessages: number
    unreadMessages: number
    averageResponseTime: string
    applicationRate: number
    interviewRate: number
    successRate: number
}

interface ApplicationTrend {
    date: string
    count: number
}

interface CategoryDistribution {
    category: string
    count: number
}
export async function getClientDashboardData(userId: string) {
    try {
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: userId },
            select: { id: true }
        })
        const clientId = clientProfile?.id
        const opportunities = await prisma.opportunity.findMany({
            where: { clientId },
            include: {
                Application: {
                    include: {
                        AthleteProfile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profileImage: true,
                                primarySport: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Get messages for this client
        const messages = await prisma.message.findMany({
            where: { 
                OR: [
                    { senderId: clientId },
                    { receiverId: clientId }
                ]
            },
            orderBy: { createdAt: 'desc' }
        })

        // Calculate application trends (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentApplications = await prisma.application.findMany({
            where: {
                Opportunity: {
                    clientId
                },
                appliedAt: {
                    gte: thirtyDaysAgo
                }
            },
            orderBy: { appliedAt: 'asc' }
        })

        // Group applications by date for trend
        const applicationTrends: ApplicationTrend[] = []
        const dateMap = new Map()

        recentApplications.forEach(app => {
            const date = app.appliedAt.toISOString().split('T')[0]
            dateMap.set(date, (dateMap.get(date) || 0) + 1)
        })

        // Fill in all dates in the last 30 days
        for (let i = 0; i < 30; i++) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            applicationTrends.unshift({
                date: dateStr,
                count: dateMap.get(dateStr) || 0
            })
        }

        // Calculate category distribution
        const categoryDistribution: CategoryDistribution[] = []
        const categoryMap = new Map()

        opportunities.forEach(opp => {
            if (opp.category) {
                categoryMap.set(opp.category, (categoryMap.get(opp.category) || 0) + 1)
            }
        })

        categoryMap.forEach((count, category) => {
            categoryDistribution.push({ category, count })
        })

        // Calculate stats
        const allApplications = opportunities.flatMap(o => o.Application)
        const unreadMessages = messages.filter(m => !m.isRead && m.receiverId === clientId).length
        
        // Calculate application status distribution
        const newApplications = allApplications.filter(a => a.status === 'PENDING').length
        const reviewedApplications = allApplications.filter(a => a.status === 'REVIEWING').length
        const shortlistedApplications = allApplications.filter(a => a.status === 'SHORTLISTED').length
        const rejectedApplications = allApplications.filter(a => a.status === 'REJECTED').length
        const acceptedApplications = allApplications.filter(a => a.status === 'ACCEPTED').length

        // Calculate rates
        const totalApplications = allApplications.length
        const applicationRate = totalApplications > 0 
            ? Math.round((totalApplications / opportunities.length) * 10) / 10 
            : 0
        
        const interviewRate = totalApplications > 0
            ? Math.round((shortlistedApplications / totalApplications) * 100)
            : 0

        const successRate = totalApplications > 0
            ? Math.round((acceptedApplications / totalApplications) * 100)
            : 0

        // Calculate average response time (mock data - replace with actual logic)
        const averageResponseTime = '2.5 days'

        const stats: DashboardStats = {
            totalOpportunities: opportunities.length,
            activeListings: opportunities.filter(o => o.status === 'ACTIVE').length,
            pendingListings: opportunities.filter(o => o.status === 'PENDING_APPROVAL').length,
            draftListings: opportunities.filter(o => o.status === 'DRAFT').length,
            expiredListings: opportunities.filter(o => o.status === 'EXPIRED').length,
            totalApplicants: allApplications.length,
            newApplications,
            reviewedApplications,
            shortlistedApplications,
            rejectedApplications,
            totalMessages: messages.length,
            unreadMessages,
            averageResponseTime,
            applicationRate,
            interviewRate,
            successRate
        }

        return {
            stats,
            opportunities,
            applications: allApplications.slice(0, 10), // Last 10 applications
            messages: messages.slice(0, 5), // Last 5 messages
            applicationTrends,
            categoryDistribution
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error)
        return null
    }
}