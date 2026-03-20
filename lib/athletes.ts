import { prisma } from './prisma'

export async function getFeaturedAthletes(limit: number = 4) {
  try {
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

    return featuredAthletes.map(athlete => ({
      id: athlete.id,
      name: `${athlete.firstName} ${athlete.lastName}`,
      sport: athlete.primarySport,
      position: athlete.position || '',
      imageUrl: athlete.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      achievements: athlete.achievements || [],
      gpa: athlete.gpa || 0,
      experience: athlete.experience as 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional',
      location: athlete.location,
      profileViews: athlete.profileViews
    }))
  } catch (error) {
    console.error('Error getting featured athletes:', error)
    return []
  }
}

export async function getAthleteCount() {
  try {
    const totalCount = await prisma.athleteProfile.count()
    return totalCount || 10000 // Default to 10000 if total is missing
  } catch (error) {
    console.error('Error getting athlete count:', error)
    return 10000 // Fallback
  }
}