import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = await clientPromise;
    const col = client.db("inventory").collection("products");

    const product = await col.findOne(
      { slug, isActive: { $ne: false } },
      {
        projection: {
          _id: 1, name: 1, slug: 1, description: 1,
          price: 1, category: 1, variants: 1, stock: 1,
        },
      }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json(
      { product: { ...product, _id: product._id.toString(), stock: product.stock ?? 0 } },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error("[/api/products/[slug] GET]", err);
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
  }
}