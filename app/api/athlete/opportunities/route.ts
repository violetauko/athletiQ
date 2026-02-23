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
    const search = searchParams.get("search");
    const sport = searchParams.get("sport");

    const whereClause: any = {
      status: "ACTIVE" // Athletes can only see active opportunities
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { client: { organization: { contains: search, mode: "insensitive" } } }
      ];
    }

    if (sport && sport !== "All") {
      whereClause.sport = sport;
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      include: {
        client: {
          select: { organization: true }
        },
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { postedDate: "desc" }
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("[ATHLETE_OPPORTUNITIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
