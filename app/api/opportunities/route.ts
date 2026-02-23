import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

// GET /api/opportunities - List all opportunities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build query filters
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

    // Fetch opportunities with pagination
    const [opportunities, total] = await Promise.all([
      prisma.opportunity.findMany({
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
          postedDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.opportunity.count({ where }),
    ])

    return NextResponse.json({
      opportunities,
      pagination: {
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