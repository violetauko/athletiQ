import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const opportunitySchema = z.object({
  title: z.string().min(3),
  sport: z.string().min(2),
  category: z.string().min(2),
  location: z.string().min(2),
  city: z.string().optional(),
  state: z.string().optional(),
  type: z.string(),
  salaryMin: z.number().int().optional(),
  salaryMax: z.number().int().optional(),
  description: z.string().min(10),
  requirements: z.array(z.string()).min(1),
  benefits: z.array(z.string()).default([]),
  deadline: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    
    // Ensure only clients (recruiters) can access
    if (!session?.user || session.user.role !== "CLIENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Include the clientProfile to efficiently resolve the ID in one swoop, then fetch the client's opportunities
    const userWithClient = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        clientProfile: {
          select: { id: true }
        }
      }
    });

    if (!userWithClient?.clientProfile) {
      // Possible that the user is marked CLIENT but hasn't finished profile setup
      return NextResponse.json([]);
    }

    const opportunities = await prisma.opportunity.findMany({
      where: { clientId: userWithClient.clientProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("[CLIENT_OPPORTUNITIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
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
      return new NextResponse("Client Profile not found", { status: 404 });
    }

    const body = await req.json();
    const parsedData = opportunitySchema.parse(body);

    const newOpportunity = await prisma.opportunity.create({
      data: {
        clientId: userWithClient.clientProfile.id,
        // Enforce PENDING_APPROVAL status for new opportunities
        status: "PENDING_APPROVAL",
        title: parsedData.title,
        sport: parsedData.sport,
        category: parsedData.category,
        location: parsedData.location,
        city: parsedData.city,
        state: parsedData.state,
        type: parsedData.type,
        salaryMin: parsedData.salaryMin,
        salaryMax: parsedData.salaryMax,
        description: parsedData.description,
        requirements: parsedData.requirements,
        benefits: parsedData.benefits,
        deadline: parsedData.deadline ? new Date(parsedData.deadline) : null,
      }
    });

    return NextResponse.json(newOpportunity);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[CLIENT_OPPORTUNITIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
