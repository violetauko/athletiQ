import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { OpportunityStatus, Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // Pagination (safe guards)
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10"), 1), 100);
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search")?.trim();
    const sport = searchParams.get("sport");
    const type = searchParams.get("type");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const createdBy = searchParams.get("createdBy");

    // Sorting (whitelist fields for safety)
    const allowedSortFields: Array<keyof Prisma.OpportunityOrderByWithRelationInput> = [
      "createdAt",
      "title",
      "sport",
      "type",
      "status",
      "postedDate",
      "deadline"
    ];

    const sortByParam = searchParams.get("sortBy") as keyof Prisma.OpportunityOrderByWithRelationInput;
    const sortBy = allowedSortFields.includes(sortByParam) ? sortByParam : "createdAt";

    const sortOrder: Prisma.SortOrder =
      searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const statusParam = searchParams.get("status");

    const status =
    statusParam && Object.values(OpportunityStatus).includes(statusParam as OpportunityStatus)
        ? (statusParam as OpportunityStatus)
        : undefined;

    // const typeParam = searchParams.get("type");

    // const type =
    // typeParam && Object.values(OpportunityType).includes(typeParam as OpportunityType)
    //     ? (typeParam as OpportunityType)
    //     : undefined;

    // Build where clause
    const where: Prisma.OpportunityWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          {
            ClientProfile: {
              organization: {
                contains: search,
                mode: "insensitive"
              }
            }
          },
          { description: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } }
        ]
      }),

      ...(sport && sport !== "all" && { sport }),
      ...(type && type !== "all" && { type }),
      ...(status && { status }),

      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate && { gte: new Date(fromDate) }),
              ...(toDate && { lte: new Date(toDate) })
            }
          }
        : {}),

      ...(createdBy && { clientId: createdBy }) // ✅ fixed
    };

    // Execute in single transaction (cleaner)
    const [opportunities, total, sports, types, statuses] =
      await prisma.$transaction([
        prisma.opportunity.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            ClientProfile: {
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true
                  }
                }
              }
            },
            _count: {
              select: {
                Application: true
              }
            }
          }
        }),

        prisma.opportunity.count({ where }),

        prisma.opportunity.findMany({
          select: { sport: true },
          distinct: ["sport"]
        }),

        prisma.opportunity.findMany({
          select: { type: true },
          distinct: ["type"]
        }),

        prisma.opportunity.findMany({
          select: { status: true },
          distinct: ["status"]
        })
      ]);

    return NextResponse.json({
      data: opportunities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      },
      filters: {
        sports: sports.map(s => s.sport),
        types: types.map(t => t.type),
        statuses: statuses.map(s => s.status)
      }
    });

  } catch (error) {
    console.error("[ADMIN_OPPORTUNITIES_GET]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

// Add PATCH handler for bulk operations including approve/reject
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { opportunityIds, action, data } = body;

    if (!opportunityIds || !Array.isArray(opportunityIds) || opportunityIds.length === 0) {
      return new NextResponse("No opportunities selected", { status: 400 });
    }

    let result;

    switch (action) {
      case 'approve':
        result = await prisma.opportunity.updateMany({
          where: { id: { in: opportunityIds } },
          data: { 
            status: 'ACTIVE',
            // Optionally notify the creator
          }
        });
        
        // You could also send notifications here
        // await sendApprovalNotifications(opportunityIds);
        break;

      case 'reject':
        result = await prisma.opportunity.updateMany({
          where: { id: { in: opportunityIds } },
          data: { 
            status: 'REJECTED',
            // Optionally add rejection reason
          }
        });
        break;

      case 'pending':
        result = await prisma.opportunity.updateMany({
          where: { id: { in: opportunityIds } },
          data: { status: 'PENDING_APPROVAL' }
        });
        break;

      case 'update-status':
        result = await prisma.opportunity.updateMany({
          where: { id: { in: opportunityIds } },
          data: { status: data.status }
        });
        break;

      case 'delete':
        // Check which opportunities have applications
        const opportunities = await prisma.opportunity.findMany({
          where: { id: { in: opportunityIds } },
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