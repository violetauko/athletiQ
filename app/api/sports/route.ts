// app/api/sports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export async function GET(request: NextRequest) {
  try {
    const sports = await prisma.sport.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        createdAt: true
      }
    })

    // Also get unique primary sports from athlete profiles
    const athleteSports = await prisma.athleteProfile.findMany({
      distinct: ['primarySport'],
      select: {
        primarySport: true
      },
    })

    // Combine both sources, ensuring no duplicates
    const sportNames = new Set(sports.map(s => s.name))
    athleteSports.forEach(as => {
      if (as.primarySport && !sportNames.has(as.primarySport)) {
        sportNames.add(as.primarySport)
      }
    })

    // Format response
    const formattedSports = sports.map(sport => ({
      id: sport.id,
      name: sport.name,
      description: sport.description,
      icon: sport.icon
    }))

    return NextResponse.json({
      sports: formattedSports,
      total: formattedSports.length
    })
  } catch (error) {
    console.error('Error fetching sports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sports' },
      { status: 500 }
    )
  }
}