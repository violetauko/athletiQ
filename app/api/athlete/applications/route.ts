import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!athleteProfile) {
        return new NextResponse("Athlete profile not found", { status: 404 });
    }

    // Get total count for pagination
    const total = await prisma.application.count({
      where: { athleteId: athleteProfile.id }
    });

    // Get paginated applications
    const applications = await prisma.application.findMany({
      where: { athleteId: athleteProfile.id },
      include: {
        Opportunity: {
          include: { 
            ClientProfile: {
              select: { organization: true }
            }
          }
        }
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
    console.error("[ATHLETE_APPLICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
