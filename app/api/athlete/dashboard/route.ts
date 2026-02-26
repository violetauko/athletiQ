import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    // Ensure only athletes can access this data
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the athlete profile to get the id for querying
    const athleteProfile = await prisma.athleteProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!athleteProfile) {
      return new NextResponse("Athlete profile not found", { status: 404 });
    }

    // Fetch dashboard aggregations and data
    const [
      activeApplications,
      savedOpportunities,
      recentApplicationsData,
      recommendedOpportunitiesData
    ] = await Promise.all([
      prisma.application.count({ where: { athleteId: athleteProfile.id, status: { notIn: ["REJECTED", "WITHDRAWN"] } } }),
      prisma.opportunity.count({ where: { AthleteProfile: { some: { id: athleteProfile.id } } } }),
      prisma.application.findMany({
        where: { athleteId: athleteProfile.id },
        include: {
          Opportunity: {
            include: { ClientProfile: { select: { organization: true } } }
          }
        },
        orderBy: { appliedAt: "desc" },
        take: 3
      }),
      prisma.opportunity.findMany({
        where: { sport: athleteProfile.primarySport, status: "ACTIVE" },
        include: { ClientProfile: true },
        orderBy: { postedDate: "desc" },
        take: 3
      })
    ]);

    // Calculate profile completion logic (mocked up a bit based on existing fields)
    let completedFields = 0;
    const totalFields = 8;
    
    if (athleteProfile.firstName && athleteProfile.lastName) completedFields++;
    if (athleteProfile.dateOfBirth) completedFields++;
    if (athleteProfile.location) completedFields++;
    if (athleteProfile.bio) completedFields++;
    if (athleteProfile.primarySport) completedFields++;
    if (athleteProfile.experience) completedFields++;
    if (athleteProfile.resumeUrl || athleteProfile.videoHighlights.length > 0) completedFields++;
    if (athleteProfile.profileImage) completedFields++;

    const profileCompletion = Math.round((completedFields / totalFields) * 100);

    const recentApplications = recentApplicationsData.map(app => ({
      id: app.id,
      title: app.Opportunity.title,
      organization: app.Opportunity.ClientProfile.organization,
      status: app.status,
      appliedDate: app.appliedAt.toISOString().split('T')[0],
      location: app.Opportunity.location,
    }));

    const recommendedOpportunities = recommendedOpportunitiesData.map(opp => ({
      id: opp.id,
      title: opp.title,
      organization: opp.ClientProfile.organization,
      location: opp.location,
      type: opp.type,
      postedDate: opp.postedDate.toISOString().split('T')[0]
    }));

    return NextResponse.json({
      stats: {
        profileViews: athleteProfile.profileViews,
        activeApplications,
        savedOpportunities,
        profileCompletion,
      },
      recentApplications,
      recommendedOpportunities
    });
  } catch (error) {
    console.error("[ATHLETE_DASHBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
