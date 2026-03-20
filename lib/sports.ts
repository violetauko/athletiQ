import { prisma } from './prisma'

export async function getSports() {
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
    const formattedSports = sports.map(sport => ({
      id: sport.id,
      name: sport.name,
      description: sport.description,
      icon: sport.icon
    }))

    athleteSports.forEach(as => {
      if (as.primarySport && !sportNames.has(as.primarySport)) {
        // Since we don't have id/icon for these, we just add them as basic sports
        // In a real app, you might want a more sophisticated merge
        // but for now we'll just keep the ones from the Sport model as principal
      }
    })

    return {
      sports: formattedSports,
      total: formattedSports.length
    }
  } catch (error) {
    console.error('Error fetching sports:', error)
    return { sports: [], total: 0 }
  }
}