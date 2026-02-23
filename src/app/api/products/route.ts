import { NextResponse } from "next/server";
import { getProductsBySlugs } from "@/lib/products";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slugsParam = searchParams.get("slugs");
    if (!slugsParam) {
      return NextResponse.json({ error: "slugs query required" }, { status: 400 });
    }
    const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (slugs.length === 0) {
      return NextResponse.json([]);
    }
    const products = await getProductsBySlugs(slugs);
    return NextResponse.json(products);
  } catch (e) {
    console.error("[Products] Get by slugs error:", e);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
