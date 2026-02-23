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
        user: {
          select: { name: true, email: true, image: true }
        }
      }
    });

    if (!athleteProfile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    return NextResponse.json(athleteProfile);
  } catch (error) {
    console.error("[ATHLETE_PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    // In a real app we'd use Zod for validation here
    
    // Split user fields and profile fields
    const { name, email, image, ...profileData } = body;

    // We do a transaction to update both User and AthleteProfile
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update User if needed
      if (name || image) {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            ...(name && { name }),
            ...(image && { image })
          }
        });
      }

      // Update AthleteProfile
      return await tx.athleteProfile.update({
        where: { userId: session.user.id },
        data: profileData,
        include: {
          user: { select: { name: true, email: true, image: true } }
        }
      });
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[ATHLETE_PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
