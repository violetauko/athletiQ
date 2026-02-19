import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
          recruiter: {
            include: {
              user: {
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
    
    // TODO: Add authentication check here
    // const session = await getServerSession()
    // if (!session || session.user.role !== 'RECRUITER') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const opportunity = await prisma.opportunity.create({
      data: {
        ...body,
        recruiterId: body.recruiterId, // Should come from session
      },
      include: {
        recruiter: true,
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