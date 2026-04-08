import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
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
    const body = await request.json();
    const { suspended } = body;

    if (typeof suspended !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid suspended value' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { suspended },
      select: {
        id: true,
        name: true,
        email: true,
        suspended: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error suspending user:', error);
    return NextResponse.json(
      { error: 'Failed to suspend user' },
      { status: 500 }
    );
  }
}
