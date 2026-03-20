import { NextResponse } from 'next/server'
import { getAthleteCount } from '@/lib/athletes'

export async function GET() {
  try {
    const count = await getAthleteCount()
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error in athlete count API:', error)
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
