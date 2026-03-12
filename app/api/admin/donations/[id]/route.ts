import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET single donation by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params

    const donation = await prisma.donation.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!donation) {
      return new NextResponse('Donation not found', { status: 404 })
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error('Error fetching donation:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}