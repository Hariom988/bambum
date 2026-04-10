import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const col = client.db("inventory").collection("products");

    const product = await col.findOne(
      { slug, isActive: { $ne: false } },
      {
        projection: {
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          price: 1,
          category: 1,
          variants: 1,
        },
      }
    );
    await client.close();

    if (!product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({
      product: { ...product, _id: product._id.toString() },
    });
  } catch (err) {
    console.error("[/api/products/[slug] GET]", err);
    return NextResponse.json({ error: "Failed to fetch product." }, { status: 500 });
  }
}