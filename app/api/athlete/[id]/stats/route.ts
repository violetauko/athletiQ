// app/api/athletes/[id]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string } >}
) {
  try {
    const { id } = await params

    // Fetch athlete to get their primary sport
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id },
      select: {
        primarySport: true,
        achievements: true
      }
    })

    if (!athlete) {
      return NextResponse.json(
        { error: 'Athlete not found' },
        { status: 404 }
      )
    }

    // Calculate stats based on achievements and sport
    // This is sample logic - you should customize based on your data model
    const stats = {
      gamesPlayed: calculateGamesPlayed(athlete.achievements),
      avgPoints: calculateAveragePoints(athlete.primarySport, athlete.achievements),
      avgAssists: calculateAverageAssists(athlete.primarySport, athlete.achievements),
      avgRebounds: calculateAverageRebounds(athlete.primarySport, athlete.achievements),
      achievementsCount: athlete.achievements.length,
      // Additional stats you might want to add
      winRate: calculateWinRate(athlete.achievements),
      seasonHighlights: extractSeasonHighlights(athlete.achievements)
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching athlete stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch athlete stats' },
      { status: 500 }
    )
  }
}

// Helper functions to calculate stats from achievements
function calculateGamesPlayed(achievements: string[]): number {
  // Look for game counts in achievements
  const gamePatterns = [
    /(\d+)\s*games?/i,
    /played\s*(\d+)/i,
    /(\d+)\s*appearances?/i
  ]
  
  for (const achievement of achievements) {
    for (const pattern of gamePatterns) {
      const match = achievement.match(pattern)
      if (match) {
        return parseInt(match[1])
      }
    }
  }
  
  // Default value
  return 120
}

function calculateAveragePoints(sport: string, achievements: string[]): number {
  if (sport !== 'Basketball') return 0
  
  // Look for scoring averages in achievements
  const pointPatterns = [
    /(\d+(?:\.\d+)?)\s*points?\s*per\s*game/i,
    /avg\.?\s*(\d+(?:\.\d+)?)\s*points?/i,
    /(\d+(?:\.\d+)?)\s*ppg/i
  ]
  
  for (const achievement of achievements) {
    for (const pattern of pointPatterns) {
      const match = achievement.match(pattern)
      if (match) {
        return parseFloat(match[1])
      }
    }
  }
  
  // Default value based on position or general average
  return 15.5
}

function calculateAverageAssists(sport: string, achievements: string[]): number {
  if (sport !== 'Basketball') return 0
  
  const assistPatterns = [
    /(\d+(?:\.\d+)?)\s*assists?\s*per\s*game/i,
    /avg\.?\s*(\d+(?:\.\d+)?)\s*assists?/i,
    /(\d+(?:\.\d+)?)\s*apg/i
  ]
  
  for (const achievement of achievements) {
    for (const pattern of assistPatterns) {
      const match = achievement.match(pattern)
      if (match) {
        return parseFloat(match[1])
      }
    }
  }
  
  return 5.2
}

function calculateAverageRebounds(sport: string, achievements: string[]): number {
  if (sport !== 'Basketball') return 0
  
  const reboundPatterns = [
    /(\d+(?:\.\d+)?)\s*rebounds?\s*per\s*game/i,
    /avg\.?\s*(\d+(?:\.\d+)?)\s*rebounds?/i,
    /(\d+(?:\.\d+)?)\s*rpg/i
  ]
  
  for (const achievement of achievements) {
    for (const pattern of reboundPatterns) {
      const match = achievement.match(pattern)
      if (match) {
        return parseFloat(match[1])
      }
    }
  }
  
  return 4.8
}

function calculateWinRate(achievements: string[]): number {
  // Calculate win rate based on championships and achievements
  let wins = 0
  let total = 0
  
  const championshipPatterns = [
    /champion/i,
    /winner/i,
    /victory/i,
    /gold/i
  ]
  
  for (const achievement of achievements) {
    for (const pattern of championshipPatterns) {
      if (pattern.test(achievement)) {
        wins++
        break
      }
    }
    total++
  }
  
  return total > 0 ? Math.round((wins / total) * 100) : 75
}

function extractSeasonHighlights(achievements: string[]): string[] {
  // Extract notable achievements from the last season
  const currentYear = new Date().getFullYear()
  const lastYear = currentYear - 1
  
  return achievements.filter(achievement => 
    achievement.includes(currentYear.toString()) || 
    achievement.includes(lastYear.toString())
  )
}