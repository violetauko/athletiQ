import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, UserRole } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status'); // verified/active status
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const hasProfile = searchParams.get('hasProfile');

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { id: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(role && role !== 'all' && { role: role as UserRole }),
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

    // Execute queries in parallel
    const [users, total, stats] = await prisma.$transaction([
      // Main query
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          AthleteProfile: {
            select: {
              id: true,
              primarySport: true,
              position: true,
              experience: true
            }
          },
          ClientProfile: {
            select: {
              id: true,
              organization: true,
              title: true
            }
          },
          _count: {
            select: {
              Application: true,
              donations: true,
              contactSubmissions: true,
              Account: true,
              Session: true
            }
          }
        }
      }),
      
      // Total count
      prisma.user.count({ where }),
      
      // Stats by role
      prisma.user.groupBy({
        orderBy: { _count: { id: 'desc' } },
        by: ['role'],
        _count: true
      })
    ]);

    // Format users with profile info
    const formattedUsers = users.map(user => ({
      ...user,
      profileType: user.AthleteProfile ? 'ATHLETE' : user.ClientProfile ? 'CLIENT' : null,
      profile: user.AthleteProfile || user.ClientProfile || null,
      hasProfile: !!(user.AthleteProfile || user.ClientProfile),
      isVerified: !!user.emailVerified
    }));

    return NextResponse.json({
      data: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      },
      stats: {
        byRole: stats
      }
    });
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userIds, action, data } = body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new NextResponse("No users selected", { status: 400 });
    }

    let result;

    switch (action) {
      case 'update-role':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { role: data.role }
        });
        break;

      case 'verify-email':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { emailVerified: new Date() }
        });
        break;

      case 'unverify-email':
        result = await prisma.user.updateMany({
          where: { id: { in: userIds } },
          data: { emailVerified: null }
        });
        break;

      case 'delete':
        // Check for related data before deleting
        const users = await prisma.user.findMany({
          where: { id: { in: userIds } },
          include: {
            _count: {
              select: {
                Application: true,
                donations: true,
                Account: true,
                Session: true
              }
            }
          }
        });

        const hasRelatedData = users.some(u => 
          u._count.Application > 0 || 
          u._count.donations > 0 || 
          u._count.Account > 0
        );

        if (hasRelatedData) {
          return new NextResponse(
            "Cannot delete users with existing applications, donations, or accounts", 
            { status: 400 }
          );
        }

        result = await prisma.user.deleteMany({
          where: { id: { in: userIds } }
        });
        break;

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      result,
      message: `Bulk ${action} completed successfully`
    });
  } catch (error) {
    console.error("[ADMIN_USERS_BULK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}