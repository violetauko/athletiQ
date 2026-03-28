
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  notes?: string
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return { success: false, error: "Unauthorized" };
    }

    // Verify the client owns the opportunity
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { Opportunity: { select: { clientId: true } } }
    });

    if (!application) {
      return { success: false, error: "Application not found" };
    }

    const userWithClient = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { ClientProfile: { select: { id: true } } }
    });

    if (!userWithClient?.ClientProfile || 
        userWithClient.ClientProfile.id !== application.Opportunity.clientId) {
      return { success: false, error: "Unauthorized to update this application" };
    }

    // Update the application
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        notes: notes || undefined,
      },
    });

    revalidatePath("/client/applications");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_APPLICATION_STATUS]", error);
    return { success: false, error: "Failed to update application status" };
  }
}