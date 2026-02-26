import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

    const stats = await prisma.$transaction([
      // Total counts
      prisma.opportunity.count(),
      prisma.opportunity.count({ where: { status: 'ACTIVE' } }),
      prisma.opportunity.count({ where: { status: 'CLOSED' } }),
      prisma.opportunity.count({ where: { status: 'DRAFT' } }),
      prisma.opportunity.count({ where: { status: 'PENDING_APPROVAL' } }),
      
      // This month
      prisma.opportunity.count({ where: { createdAt: { gte: startOfMonth } } }),
      
      // This week
      prisma.opportunity.count({ where: { createdAt: { gte: startOfWeek } } }),
      
      // Applications stats
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      
      // Group by sport
      prisma.opportunity.groupBy({
        orderBy: { _count: { id: 'desc' } },
        by: ['sport'],
        _count: true,
      }),
      
      // Group by type
      prisma.opportunity.groupBy({
        orderBy: { _count: { id: 'desc' } },
        by: ['type'],
        _count: true
      }),
      
      // Top creators
      prisma.opportunity.groupBy({
        by: ['clientId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5
      })
    ]);

    return NextResponse.json({
      total: stats[0],
      active: stats[1],
      closed: stats[2],
      draft: stats[3],
      pending: stats[4],
      createdThisMonth: stats[5],
      createdThisWeek: stats[6],
      totalApplications: stats[7],
      pendingApplications: stats[8],
      bySport: stats[9],
      byType: stats[10],
      topCreators: stats[11]
    });
  } catch (error) {
    console.error("[ADMIN_OPPORTUNITIES_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}