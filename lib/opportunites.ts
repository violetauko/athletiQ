import { prisma } from './prisma'

export async function getLatestOpportunities(limit: number = 4) {
  try {
    const opportunities = await prisma.opportunity.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        ClientProfile: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        postedDate: 'desc',
      },
      take: limit,
    })

    return { opportunities }
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return { opportunities: [] }
  }
}

