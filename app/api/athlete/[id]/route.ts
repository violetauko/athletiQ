// app/api/athletes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Increment profile views
    await prisma.athleteProfile.update({
      where: { id },
      data: {
        profileViews: {
          increment: 1
        }
      }
    })

    // Fetch athlete with related data
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            email: true,
            role: true
          }
        }
      }
    })

    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      )
    }

    // Format the response
    const formattedAthlete = {
      id: athlete.id,
      name: `${athlete.firstName} ${athlete.lastName}`,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      sport: athlete.primarySport,
      secondarySports: athlete.secondarySports,
      position: athlete.position,
      imageUrl: athlete.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      achievements: athlete.achievements || [],
      gpa: athlete.gpa,
      experience: athlete.experience,
      location: athlete.location,
      bio: athlete.bio,
      dateOfBirth: athlete.dateOfBirth,
      gender: athlete.gender,
      phone: athlete.phone,
      height: athlete.height,
      weight: athlete.weight,
      resumeUrl: athlete.resumeUrl,
      graduationYear: athlete.graduationYear,
      currentSchool: athlete.currentSchool,
      videoHighlights: athlete.videoHighlights || [],
      profileViews: athlete.profileViews,
      createdAt: athlete.createdAt,
      updatedAt: athlete.updatedAt,
      email: athlete.User?.email,
      // Additional computed fields
      age: calculateAge(athlete.dateOfBirth),
      fullAddress: athlete.location,
    }

    return NextResponse.json(formattedAthlete)
  } catch (error) {
    console.error('Error fetching athlete:', error)
    return NextResponse.json(
      { error: 'Failed to fetch athlete' },
      { status: 500 }
    )
  }
}

// Helper function to calculate age from date of birth
function calculateAge(dateOfBirth: Date): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}