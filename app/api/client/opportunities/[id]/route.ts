import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(3).optional(),
  sport: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  type: z.string().optional(),
  salaryMin: z.number().int().optional(),
  salaryMax: z.number().int().optional(),
  description: z.string().min(10).optional(),
  requirements: z.array(z.string()).min(1).optional(),
  benefits: z.array(z.string()).optional(),
  deadline: z.string().optional(),
});

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userWithClient = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { ClientProfile: { select: { id: true } } }
    });

    if (!userWithClient?.ClientProfile) {
      return new NextResponse("Client Profile not found", { status: 404 });
    }

    // Verify ownership
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id }
    });

    if (!opportunity || opportunity.clientId !== userWithClient.ClientProfile.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    const body = await req.json();
    const parsedData = updateSchema.parse(body);

    const updated = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        ...parsedData,
        deadline: parsedData.deadline ? new Date(parsedData.deadline) : undefined,
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[OPPORTUNITY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userWithClient = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { ClientProfile: { select: { id: true } } }
    });

    if (!userWithClient?.ClientProfile?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify ownership
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id }
    });

    if (!opportunity || opportunity.clientId !== userWithClient.ClientProfile.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    await prisma.opportunity.delete({
      where: { id: params.id }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[OPPORTUNITY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
