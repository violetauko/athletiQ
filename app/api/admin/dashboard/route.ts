import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    // Ensure only admins can access this data
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch dashboard aggregations and data using Prisma's Promise.all for performance
    const [
      totalUsers,
      activeAthletes,
      activeClients,
      opportunitiesActive,
      pendingVerifications,
      pendingOpportunitiesList,
      recentUsersData,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ATHLETE" } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.opportunity.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { emailVerified: null } }), // Users yet to verify email
      prisma.opportunity.findMany({
        where: { status: "PENDING_APPROVAL" },
        include: {
          client: {
            include: { user: { select: { name: true, email: true } } }
          }
        },
        orderBy: { createdAt: "asc" }
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      }),
    ]);

    const pendingOpportunitiesCount = pendingOpportunitiesList.length;

    const recentUsers = recentUsersData.map((user) => ({
      id: user.id,
      name: user.name || "Unknown User",
      email: user.email,
      role: user.role,
      joinedAt: new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(user.createdAt),
    }));

    // Example systemic alerts (these could come from a logging/audit db table)
    const systemAlerts = [
      { id: 1, type: 'info', message: 'System performance optimal and stable', time: 'Just now' },
    ];

    return NextResponse.json({
      stats: {
        totalUsers,
        activeAthletes,
        activeClients,
        opportunitiesActive,
        pendingVerifications,
        pendingOpportunitiesCount,
      },
      recentUsers,
      pendingOpportunitiesList,
      systemAlerts
    });
  } catch (error) {
    console.error("[ADMIN_DASHBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
