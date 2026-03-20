import { NextRequest, NextResponse } from 'next/server'
import { getSports } from '@/lib/sports'

export async function GET(request: NextRequest) {
  try {
    const data = await getSports()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sports' },
      { status: 500 }
    )
  }
}