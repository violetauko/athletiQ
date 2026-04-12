import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "featured";

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (category && category !== "ALL" && category !== "All Categories") {
      // Map frontend case to Prisma Enum case
      where.category = category.toUpperCase();
    }
    if (status && status !== "ALL") {
      if (status === "IN_STOCK") where.stock = { gt: 0 };
      else if (status === "OUT_OF_STOCK") where.stock = 0;
      else if (status === "LOW_STOCK") where.stock = { gt: 0, lt: 10 };
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "newest") orderBy = { createdAt: "desc" };
    else if (sort === "low-high") orderBy = { price: "asc" };
    else if (sort === "high-low") orderBy = { price: "desc" };

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error("[PUBLIC_PRODUCTS_GET]", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
