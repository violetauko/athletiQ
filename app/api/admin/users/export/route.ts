import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { role, fromDate, toDate, hasProfile } = body;

    // Build where clause
    const where: Prisma.UserWhereInput = {
      ...(role && role !== 'all' && { role }),
      ...(fromDate && { createdAt: { gte: new Date(fromDate) } }),
      ...(toDate && { createdAt: { lte: new Date(toDate) } }),
      ...(hasProfile === 'true' && {
        OR: [
          { AthleteProfile: { isNot: null } },
          { ClientProfile: { isNot: null } }
        ]
      }),
      ...(hasProfile === 'false' && {
        AND: [
          { AthleteProfile: null },
          { ClientProfile: null }
        ]
      })
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        AthleteProfile: {
          select: {
            primarySport: true,
            position: true,
            experience: true
          }
        },
        ClientProfile: {
          select: {
            organization: true,
            title: true
          }
        },
        _count: {
          select: {
            Application: true,
            donations: true,
            contactSubmissions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Generate CSV
    const csv = [
      ['ID', 'Name', 'Email', 'Role', 'Verified', 'Profile Type', 'Profile Details', 'Applications', 'Donations', 'Contact Submissions', 'Created At', 'Updated At'].join(','),
      ...users.map(user => {
        const profileType = user.AthleteProfile ? 'ATHLETE' : user.ClientProfile ? 'CLIENT' : 'NONE';
        const profileDetails = user.AthleteProfile 
          ? `${user.AthleteProfile.primarySport || ''} - ${user.AthleteProfile.position || ''} (${user.AthleteProfile.experience || 0} yrs)`
          : user.ClientProfile
          ? `${user.ClientProfile.organization || ''} - ${user.ClientProfile.title || ''}`
          : '';

        return [
          user.id,
          `"${user.name?.replace(/"/g, '""') || ''}"`,
          user.email,
          user.role,
          user.emailVerified ? 'Yes' : 'No',
          profileType,
          `"${profileDetails.replace(/"/g, '""')}"`,
          user._count.Application,
          user._count.donations,
          user._count.contactSubmissions,
          user.createdAt.toISOString(),
          user.updatedAt.toISOString()
        ].join(',');
      })
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=users-export-${new Date().toISOString().split('T')[0]}.csv`
      }
    });
  } catch (error) {
    console.error("[ADMIN_USERS_EXPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}