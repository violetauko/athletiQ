import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        User: {
          select: { name: true, email: true, image: true }
        }
      }
    });

    if (!clientProfile) {
      return new NextResponse("Profile not found", { status: 404 });
    }

    return NextResponse.json(clientProfile);
  } catch (error) {
    console.error("[CLIENT_PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Split user fields and profile fields based on ClientProfile model
    const { name, image, organization, title, phone, bio } = body;

    // Validate required fields for client
    if (!organization || !title) {
      return new NextResponse("Organization and title are required", { status: 400 });
    }

    // We do a transaction to update both User and ClientProfile
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update User if name or image provided
      if (name || image) {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            ...(name && { name }),
            ...(image && { image })
          }
        });
      }

      // Check if profile exists
      const existingProfile = await tx.clientProfile.findUnique({
        where: { userId: session.user.id }
      });

      // Update or create ClientProfile
      if (existingProfile) {
        return await tx.clientProfile.update({
          where: { userId: session.user.id },
          data: {
            organization,
            title,
            phone,
            bio
          },
          include: {
            User: { select: { name: true, email: true, image: true } }
          }
        });
      } else {
        // Create profile if it doesn't exist (though it should)
        return await tx.clientProfile.create({
          data: {
            userId: session.user.id,
            organization,
            title,
            phone,
            bio
          },
          include: {
            User: { select: { name: true, email: true, image: true } }
          }
        });
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error("[CLIENT_PROFILE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}