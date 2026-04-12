import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();

    const orders = await prisma.order.findMany({
      where: {
        // Consider revenue from DELIVERED or generally non-cancelled orders
        status: {
          notIn: ["CANCELLED", "REFUNDED", "PENDING", "PROCESSING", "SHIPPED"]
        }
      },
      select: { totalAmount: true }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const platformRevenue = totalRevenue * 0.20;

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      platformRevenue
    });
  } catch (error) {
    console.error("[ADMIN_MARKETPLACE_STATS_GET]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
