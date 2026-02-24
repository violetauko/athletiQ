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
    if (!id) {
        return new NextResponse("Opportunity ID required", { status: 400 });
    }

    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!athleteProfile) {
        return new NextResponse("Athlete profile not found", { status: 404 });
    }

    const body = await req.json();
    const { 
      coverLetter,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      city,
      state,
      address,
      height,
      weight,
      position,
      experience,
      currentTeam,
      achievements,
      stats,
      resumeFileName,
      portfolioFileNames,
      additionalDocsFileNames
    } = body;

    // Ensure opportunity exists and is active
    const opportunity = await prisma.opportunity.findUnique({
      where: { id, status: "ACTIVE" }
    });

    if (!opportunity) {
        return new NextResponse("Opportunity not found or not active", { status: 404 });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        athleteId_opportunityId: {
          athleteId: athleteProfile.id,
          opportunityId: id
        }
      }
    });

    if (existingApplication) {
        return new NextResponse("Already applied to this opportunity", { status: 400 });
    }

    // Create application with all the data
    const application = await prisma.application.create({
      data: {
        athleteId: athleteProfile.id,
        opportunityId: id,
        userId: session.user.id,
        coverLetter: coverLetter || null,
        status: "PENDING",
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        city,
        state,
        address,
        height: height ? parseInt(height) : null,
        weight: weight ? parseInt(weight) : null,
        position,
        experience: experience ? parseInt(experience) : null,
        currentTeam,
        achievements,
        stats,
        resumeFileName,
        portfolioFileNames,
        additionalDocsFileNames
      }
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("[ATHLETE_APPLY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}