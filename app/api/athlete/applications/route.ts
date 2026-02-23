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
      where: { userId: session.user.id }
    });

    if (!athleteProfile) {
        return new NextResponse("Athlete profile not found", { status: 404 });
    }

    const applications = await prisma.application.findMany({
      where: { athleteId: athleteProfile.id },
      include: {
        opportunity: {
          include: { 
            client: {
              select: { organization: true }
            }
          }
        }
      },
      orderBy: { appliedAt: "desc" }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("[ATHLETE_APPLICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
