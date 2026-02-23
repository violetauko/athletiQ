import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    
    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        savedOpportunities: {
          where: { id }
        }
      }
    });

    if (!athleteProfile) {
        return new NextResponse("Athlete profile not found", { status: 404 });
    }

    const isSaved = athleteProfile.savedOpportunities.length > 0;

    if (isSaved) {
      // Unsave
      await prisma.athleteProfile.update({
        where: { id: athleteProfile.id },
        data: {
          savedOpportunities: {
            disconnect: { id }
          }
        }
      });
      return NextResponse.json({ saved: false });
    } else {
      // Save
      await prisma.athleteProfile.update({
        where: { id: athleteProfile.id },
        data: {
          savedOpportunities: {
            connect: { id }
          }
        }
      });
      return NextResponse.json({ saved: true });
    }
  } catch (error) {
    console.error("[ATHLETE_SAVE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
