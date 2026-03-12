import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await request.json();
    const applicationId = (await params).id;

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    // Get the client's profile
    const userWithClient = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { ClientProfile: { select: { id: true } } }
    });

    if (!userWithClient?.ClientProfile) {
      return new NextResponse("Client profile not found", { status: 404 });
    }

    // Verify the application exists and belongs to one of the client's opportunities
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        Opportunity: {
          select: {
            clientId: true,
          }
        }
      }
    });

    if (!application) {
      return new NextResponse("Application not found", { status: 404 });
    }

    if (application.Opportunity.clientId !== userWithClient.ClientProfile.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Update the application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status }
    });

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("[APPLICATION_STATUS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
