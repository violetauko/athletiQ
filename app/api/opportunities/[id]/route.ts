import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const{ id } = await params
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        ClientProfile: {
          select: {
            id: true,
            organization: true,
            // logoUrl: true,
          },
        },
        _count: {
          select: { Application: true },
        },
      },
    })

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Normalize into the shape the UI expects
    const payload = {
      id: opportunity.id,
      title: opportunity.title,
      sport: opportunity.sport,
      category: opportunity.category,
      organization: opportunity.ClientProfile?.organization ?? 'Unknown Organization',
      location: opportunity.location ?? '',
      city: opportunity.city ?? '',
      state: opportunity.state ?? '',
      type: opportunity.type,
      salaryMin: opportunity.salaryMin ?? null,
      salaryMax: opportunity.salaryMax ?? null,
      description: opportunity.description,
      requirements: opportunity.requirements ?? [],
      benefits: opportunity.benefits ?? [],
      responsibilities: (opportunity as any).responsibilities ?? [],
      status: opportunity.status,
      postedDate: opportunity.createdAt.toISOString(),
      deadline: opportunity.deadline ? opportunity.deadline.toISOString() : null,
      applicants: opportunity._count.Application,
      imageUrl: (opportunity as any).imageUrl ?? null,
    }

    return NextResponse.json(payload)
  } catch (err) {
    console.error('[GET /api/opportunities/:id]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}