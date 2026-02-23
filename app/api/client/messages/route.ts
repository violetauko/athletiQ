import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "CLIENT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Messages sent TO the client user account
    const messages = await prisma.message.findMany({
      where: {
        receiverId: session.user.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        opportunity: {
          select: {
            id: true,
            title: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("[CLIENT_MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
