import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["ACTIVE", "DRAFT", "CLOSED"]),
});

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { status } = statusSchema.parse(body);

    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json(opportunity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid status payload", { status: 400 });
    }
    console.error("[ADMIN_OPPORTUNITY_STATUS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
