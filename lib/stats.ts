import { prisma } from './prisma'

export async function getAthleteStats() {
    // Get total athletes count
    const totalAthletes = await prisma.athleteProfile.count()

    // Get total sports (from Sport model + distinct primary sports)
    const sportsCount = await prisma.sport.count()
    
    const distinctPrimarySports = await prisma.athleteProfile.findMany({
      distinct: ['primarySport'],
      select: {
        primarySport: true
      }
    })

    const totalSports = sportsCount + distinctPrimarySports.length

    // Get unique locations for countries
    const locations = await prisma.athleteProfile.findMany({
      distinct: ['location'],
      where: {
        location: {
          not: null
        }
      },
      select: {
        location: true
      }
    })

    // Calculate success rate (placeholder)
    const successRate = '92%'

    // Get recent stats (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAthletes = await prisma.athleteProfile.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    })

    return {
      totalAthletes: totalAthletes.toLocaleString() + '+',
      totalSports: totalSports.toLocaleString() + '+',
      totalCountries: locations.length.toLocaleString() + '+',
      successRate,
      recentAthletes,
      averageGpa: await calculateAverageGpa(),
      athletesByExperience: await getAthletesByExperience(),
      athletesBySport: await getAthletesBySport()
    }
}

// Helper function to calculate average GPA
async function calculateAverageGpa() {
  const athletesWithGpa = await prisma.athleteProfile.findMany({
    where: {
      gpa: {
        not: null
      }
    },
    select: {
      gpa: true
    }
  })

  if (athletesWithGpa.length === 0) return 0

  const sum = athletesWithGpa.reduce((acc, curr) => acc + (curr.gpa || 0), 0)
  return parseFloat((sum / athletesWithGpa.length).toFixed(2))
}

// Helper function to get athletes by experience level
async function getAthletesByExperience() {
  const experiences = ['Beginner', 'Intermediate', 'Advanced', 'Professional']
  
  const result = await Promise.all(
    experiences.map(async (exp) => ({
      level: exp,
      count: await prisma.athleteProfile.count({
        where: { experience: exp }
      })
    }))
  )

  return result
}

// Helper function to get top sports by athlete count
async function getAthletesBySport(limit: number = 5) {
  const sports = await prisma.athleteProfile.groupBy({
    by: ['primarySport'],
    _count: {
      primarySport: true
    },
    orderBy: {
      _count: {
        primarySport: 'desc'
      }
    },
    take: limit
  })

  return sports.map(sport => ({
    sport: sport.primarySport,
    count: sport._count.primarySport
  }))
}
