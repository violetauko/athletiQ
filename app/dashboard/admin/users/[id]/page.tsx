// app/dashboard/admin/users/[id]/page.tsx
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import UserDetailClient from './client-page';

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    redirect('/login');
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      suspended: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      AthleteProfile: true,
      ClientProfile: true,
      accounts: true,
      sessions: true,
      applications: {
        include: {
          opportunity: {
            select: {
              id: true,
              title: true,
              clientProfile: {
                select: {
                  organization: true,
                },
              },
              status: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: 10,
      },
      donations: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      contactSubmissions: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: {
        select: {
          applications: true,
          donations: true,
          contactSubmissions: true,
        },
      },
    },
  });

  if (!user) {
    redirect('/admin/users');
  }

  return <UserDetailClient user={user} />;
}