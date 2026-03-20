import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedAthletes } from '@/lib/athletes'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '4')

    const formattedAthletes = await getFeaturedAthletes(limit)

    return NextResponse.json(formattedAthletes)
  } catch (error) {
    console.error('Error fetching featured athletes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured athletes' },
      { status: 500 }
    )
  }
}