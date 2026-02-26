import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, OpportunityStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { sport, type, status, fromDate, toDate } = body;

    // Safe enum handling
    const safeStatus =
      status && Object.values(OpportunityStatus).includes(status)
        ? status
        : undefined;

    // Build where clause
    const where: Prisma.OpportunityWhereInput = {
      ...(sport && sport !== "all" && { sport }),
      ...(type && type !== "all" && { type }),
      ...(safeStatus && { status: safeStatus }),
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate && { gte: new Date(fromDate) }),
              ...(toDate && { lte: new Date(toDate) })
            }
          }
        : {})
    };

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        ClientProfile: {
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            Application: true,
            AthleteProfile: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Generate CSV safely
    const csv = [
      [
        "ID",
        "Title",
        "Organization",
        "Sport",
        "Type",
        "Status",
        "Location",
        "Applications",
        "Saved",
        "Created By",
        "Created At",
        "Updated At"
      ].join(","),

      ...opportunities.map((opp) =>
        [
          opp.id,
          `"${opp.title.replace(/"/g, '""')}"`,
          `"${opp.ClientProfile.organization.replace(/"/g, '""')}"`,
          opp.sport,
          opp.type,
          opp.status,
          `"${opp.location.replace(/"/g, '""')}"`,
          opp._count.Application,
          opp._count.AthleteProfile,
          opp.ClientProfile.User?.name ||
            opp.ClientProfile.User?.email ||
            "",
          opp.createdAt.toISOString(),
          opp.updatedAt.toISOString()
        ].join(",")
      )
    ].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=opportunities-export-${
          new Date().toISOString().split("T")[0]
        }.csv`
      }
    });
  } catch (error) {
    console.error("[ADMIN_OPPORTUNITIES_EXPORT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}