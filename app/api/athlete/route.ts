// app/api/athletes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '8')
    const search = searchParams.get('search') || ''
    const sportId = searchParams.get('sportId') || ''
    const experience = searchParams.get('experience') || ''
    const sort = searchParams.get('sort') || 'recent'

    // Calculate skip for pagination
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { primarySport: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Sport filter
    if (sportId && sportId !== 'all') {
      const sport = await prisma.sport.findUnique({
        where: { id: sportId }
      })
      if (sport) {
        where.primarySport = sport.name
      }
    }

    // Experience filter
    if (experience && experience !== 'all') {
      where.experience = experience
    }

    // Build orderBy
    let orderBy: any = {}
    switch (sort) {
      case 'name':
        orderBy = { firstName: 'asc' }
        break
      case 'gpa_desc':
        orderBy = { gpa: 'desc' }
        break
      case 'experience_desc':
        // Custom sorting for experience levels
        const expOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Professional': 4 }
        // Note: This requires raw SQL for custom sorting
        // For now, we'll sort by experience field alphabetically
        orderBy = { experience: 'desc' }
        break
      default: // 'recent'
        orderBy = { createdAt: 'desc' }
    }

    // Fetch athletes with pagination
    const athletes = await prisma.athleteProfile.findMany({
      where,
      skip,
      take: limit,
      orderBy,
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
        graduationYear: true,
        currentSchool: true,
        createdAt: true
      }
    })

    // Get total count for pagination
    const totalCount = await prisma.athleteProfile.count({ where })

    // Format athletes for response
    const formattedAthletes = athletes.map(athlete => ({
      id: athlete.id,
      name: `${athlete.firstName} ${athlete.lastName}`,
      sport: athlete.primarySport,
      position: athlete.position || '',
      imageUrl: athlete.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80', // Default image
      achievements: athlete.achievements || [],
      gpa: athlete.gpa || 0,
      experience: athlete.experience as 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional' || 'Beginner',
      location: athlete.location,
      graduationYear: athlete.graduationYear,
      school: athlete.currentSchool
    }))

    return NextResponse.json({
      athletes: formattedAthletes,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      limit
    })
  } catch (error) {
    console.error('Error fetching athletes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch athletes' },
      { status: 500 }
    )
  }
}