import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userWithClient = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { clientProfile: { select: { id: true } } }
    });

    if (!userWithClient?.clientProfile) {
      return NextResponse.json([]);
    }

    // Get all applications that are attached to this client's opportunities
    const applications = await prisma.application.findMany({
      where: {
        opportunity: {
          clientId: userWithClient.clientProfile.id
        }
      },
      include: {
        athlete: true, // we need applicant details
        opportunity: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: { appliedAt: "desc" }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("[CLIENT_APPLICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
