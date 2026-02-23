import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, image: true, role: true } },
        opportunity: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[ATHLETE_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ATHLETE") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { receiverId, content, opportunityId } = body;

    if (!receiverId || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        receiverId,
        content,
        // Optional linkage to an opportunity
        ...(opportunityId && { opportunityId })
      },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true, role: true } },
        receiver: { select: { id: true, name: true, email: true, image: true, role: true } },
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[ATHLETE_MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
