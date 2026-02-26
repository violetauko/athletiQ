import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
          ClientProfile: {
            include: {
                User: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        ClientProfile: {
                        select: {
                            organization: true,
                            title: true
                        }
                        }
                    }
                },
            }
        },
        Application: {
          include: {
            AthleteProfile: {
              include: {
                User: {
                  select: {
                    name: true,
                    email: true,
                    image: true
                  }
                }
              }
            }
          },
          orderBy: { appliedAt: 'desc' }
        },
        _count: {
          select: {
            Application: true,
            // savedBy: true
          }
        }
      }
    });

    if (!opportunity) {
      return new NextResponse("Opportunity not found", { status: 404 });
    }

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error("[ADMIN_OPPORTUNITY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, organization, description, sport, type, status, location, requirements } = body;

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(organization && { organization }),
        ...(description && { description }),
        ...(sport && { sport }),
        ...(type && { type }),
        ...(status && { status }),
        ...(location && { location }),
        ...(requirements && { requirements })
      },
      include: {
        ClientProfile: {
            include: {
              User: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
      }
    });

    return NextResponse.json(opportunity);
  } catch (error) {
    console.error("[ADMIN_OPPORTUNITY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    // Check if opportunity has applications
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        _count: {
          select: { Application: true }
        }
      }
    });

    if (!opportunity) {
      return new NextResponse("Opportunity not found", { status: 404 });
    }

    if (opportunity._count.Application > 0) {
      // Soft delete - just mark as closed instead of deleting
      await prisma.opportunity.update({
        where: { id },
        data: { status: 'CLOSED' }
      });
      return NextResponse.json({ message: "Opportunity closed successfully" });
    }

    // Hard delete if no applications
    await prisma.opportunity.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    console.error("[ADMIN_OPPORTUNITY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}