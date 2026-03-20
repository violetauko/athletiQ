import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { getLatestOpportunities } from '@/lib/opportunites'

// GET /api/opportunities - List all opportunities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const sport = searchParams.get('sport')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const latest = searchParams.get('latest') === 'true'

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || (latest ? '6' : '10'))
    const skip = (page - 1) * limit

    // Special case for latest=true - use library function
    if (latest) {
      const data = await getLatestOpportunities(limit)
      return NextResponse.json({
        opportunities: data.opportunities,
        pagination: null
      })
    }

    // Build query filters (original logic for paginated results)
    const where: any = {
      status: 'ACTIVE',
    }

    if (sport) {
      where.sport = sport
    }

    if (category) {
      where.category = category
    }

    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive',
      }
    }

    // If latest=true → ignore pagination skip
    const opportunitiesQuery = prisma.opportunity.findMany({
      where,
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
        postedDate: 'desc', // newest first
      },
      take: latest ? limit : limit,
      skip: latest ? 0 : skip,
    })

    const [opportunities, total] = await Promise.all([
      opportunitiesQuery,
      prisma.opportunity.count({ where }),
    ])

    return NextResponse.json({
      opportunities,
      pagination: latest
        ? null
        : {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
    })
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    )
  }
}
// POST /api/opportunities - Create new opportunity (Recruiter only)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const session = await auth()
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Unauthorized - Only clients can create opportunities' }, { status: 403 })
    }

    // Get the client profile ID for this user
    const userWithClient = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { ClientProfile: { select: { id: true } } }
    })

    if (!userWithClient?.ClientProfile) {
      return NextResponse.json({ error: 'Client profile not found' }, { status: 404 })
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        ...body,
        clientId: userWithClient.ClientProfile.id,
      },
      include: {
        ClientProfile: true,
      },
    })

    return NextResponse.json(opportunity, { status: 201 })
  } catch (error) {
    console.error('Error creating opportunity:', error)
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    )
  }
}