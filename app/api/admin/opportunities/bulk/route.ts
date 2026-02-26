import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { action, ids, data } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("No opportunities selected", { status: 400 });
    }

    let result;

    switch (action) {
      case 'update-status':
        result = await prisma.opportunity.updateMany({
          where: { id: { in: ids } },
          data: { status: data.status }
        });
        break;

      case 'update-type':
        result = await prisma.opportunity.updateMany({
          where: { id: { in: ids } },
          data: { type: data.type }
        });
        break;

      case 'delete':
        // Check which opportunities have applications
        const opportunities = await prisma.opportunity.findMany({
          where: { id: { in: ids } },
          include: {
            _count: {
              select: { Application: true }
            }
          }
        });

        const withApplications = opportunities.filter(o => o._count.Application > 0).map(o => o.id);
        const withoutApplications = opportunities.filter(o => o._count.Application === 0).map(o => o.id);

        // Soft delete those with applications
        if (withApplications.length > 0) {
          await prisma.opportunity.updateMany({
            where: { id: { in: withApplications } },
            data: { status: 'CLOSED' }
          });
        }

        // Hard delete those without applications
        if (withoutApplications.length > 0) {
          await prisma.opportunity.deleteMany({
            where: { id: { in: withoutApplications } }
          });
        }

        result = {
          softDeleted: withApplications.length,
          hardDeleted: withoutApplications.length
        };
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
    console.error("[ADMIN_OPPORTUNITIES_BULK]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}