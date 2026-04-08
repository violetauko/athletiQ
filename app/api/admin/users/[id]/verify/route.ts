import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get the user and their ClientProfile
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        ClientProfile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user?.ClientProfile) {
      return NextResponse.json(
        { error: 'User does not have a client profile' },
        { status: 400 }
      );
    }

    // Update ClientProfile verification
    const updatedProfile = await prisma.clientProfile.update({
      where: { id: user.ClientProfile.id },
      data: { verified: true },
      select: {
        id: true,
        verified: true,
        organization: true,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error verifying client:', error);
    return NextResponse.json(
      { error: 'Failed to verify client' },
      { status: 500 }
    );
  }
}
