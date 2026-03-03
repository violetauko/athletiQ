// app/api/athletes/featured/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '4')

    // Fetch featured athletes (you can define your own logic for "featured")
    // Here we're using a combination of high profile views, high GPA, and recent activity
    const featuredAthletes = await prisma.athleteProfile.findMany({
      where: {
        OR: [
          { profileViews: { gt: 100 } },
          { gpa: { gt: 3.5 } }
        ]
      },
      orderBy: [
        { profileViews: 'desc' },
        { gpa: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        primarySport: true,
        position: true,
        achievements: true,
        gpa: true,
        experience: true,
        location: true,
        profileViews: true
      }
    })

    const formattedAthletes = featuredAthletes.map(athlete => ({
      id: athlete.id,
      name: `${athlete.firstName} ${athlete.lastName}`,
      sport: athlete.primarySport,
      position: athlete.position || '',
      imageUrl: athlete.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      achievements: athlete.achievements || [],
      gpa: athlete.gpa || 0,
      experience: athlete.experience as 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional' || 'Beginner',
      location: athlete.location,
      profileViews: athlete.profileViews
    }))

    return NextResponse.json(formattedAthletes)
  } catch (error) {
    console.error('Error fetching featured athletes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured athletes' },
      { status: 500 }
    )
  }
}