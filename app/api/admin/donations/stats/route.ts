import { auth } from "@/auth"
import { getDonationStats } from "@/lib/donations"
import { NextResponse } from "next/server"


// Export donation statistics endpoint
export async function GET_STATS(request: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const stats = await getDonationStats({})
    console.log(stats)

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching donation stats:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}