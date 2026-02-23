import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    if (!id) {
        return new NextResponse("Opportunity ID required", { status: 400 });
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        client: {
          include: { user: { select: { image: true } } }
        }
      }
    });

    if (!opportunity) {
      return new NextResponse("Opportunity not found", { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error("[ATHLETE_OPPORTUNITY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
