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
  responsibilities:z.array(z.string()).min(1),
  imageUrl: z.string().optional(),
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
        ClientProfile: {
          select: { id: true }
        }
      }
    });

    if (!userWithClient?.ClientProfile) {
      // Possible that the user is marked CLIENT but hasn't finished profile setup
      return NextResponse.json([]);
    }

    const opportunities = await prisma.opportunity.findMany({
      where: { clientId: userWithClient.ClientProfile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { Application: true }
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
      select: {
        ClientProfile: {
          select: { id: true },
        },
      },
    });

    if (!userWithClient?.ClientProfile) {
      return new NextResponse("Client Profile not found", { status: 404 });
    }

    const body = await req.json();
    console.log("Request body:", body);

    const parsedData = opportunitySchema.parse(body);

    const newOpportunity = await prisma.opportunity.create({
      data: {
        clientId: userWithClient.ClientProfile.id,

        // force status
        status: "PENDING_APPROVAL",

        title: parsedData.title,
        sport: parsedData.sport,
        category: parsedData.category,

        // ensure location is never empty
        location: parsedData.location || "N/A",

        city: parsedData.city || null,
        state: parsedData.state || null,

        type: parsedData.type,

        salaryMin: parsedData.salaryMin ?? null,
        salaryMax: parsedData.salaryMax ?? null,

        description: parsedData.description,

        requirements: parsedData.requirements || [],
        benefits: parsedData.benefits || [],
        responsibilities: parsedData?.responsibilities || [], // ✅ FIXED

        imageUrl: parsedData.imageUrl || null, // ✅ FIXED

        deadline: parsedData.deadline
          ? new Date(parsedData.deadline)
          : null,
      },
    });

    return NextResponse.json(newOpportunity);
  } catch (error) {
    console.log("Creation error",error)
    if (error instanceof z.ZodError) {
      return new NextResponse(error.message, { status: 400 });
    }
    console.error("[CLIENT_OPPORTUNITIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
