// app/api/athletes/stats/route.ts
import { NextResponse } from 'next/server'
import { getAthleteStats } from '@/lib/stats'

export async function GET() {
  try {
    const stats = await getAthleteStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}