import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        savedOpportunities: {
          include: {
            client: {
              select: { organization: true }
            }
          },
          orderBy: { postedDate: "desc" }
        }
      }
    });

    if (!athleteProfile) {
        return new NextResponse("Athlete profile not found", { status: 404 });
    }

    return NextResponse.json(athleteProfile.savedOpportunities);
  } catch (error) {
    console.error("[ATHLETE_SAVED_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
