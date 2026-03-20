import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const userWithClient = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { ClientProfile: { select: { id: true } } }
    });

    if (!userWithClient?.ClientProfile) {
      return NextResponse.json({ applications: [], pagination: { total: 0, pages: 0, page, limit } });
    }

    const clientId = userWithClient.ClientProfile.id;

    // Get total count for pagination
    const total = await prisma.application.count({
      where: {
        Opportunity: {
          clientId
        }
      }
    });

    // Get paginated applications
    const applications = await prisma.application.findMany({
      where: {
        Opportunity: {
          clientId
        }
      },
      include: {
        AthleteProfile: true,
        Opportunity: {
          select: {
            id: true,
            title: true,
            sport: true,
            type: true,
            location: true,
            ClientProfile: true
          }
        },
      },
      orderBy: { appliedAt: "desc" },
      skip,
      take: limit
    });

    return NextResponse.json({
      applications,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error("[CLIENT_APPLICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
