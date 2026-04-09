import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (!cachedClient) {
    cachedClient = await MongoClient.connect(MONGODB_URI);
  }
  return cachedClient;
}

export const revalidate = 60; // ISR: revalidate every 60s

export async function GET() {
  try {
    const client = await getClient();
    const col = client.db("inventory").collection("products");
    const products = await col
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .project({
        _id: 1,
        name: 1,
        slug: 1,
        price: 1,
        category: 1,
        variants: 1,
      })
      .toArray();

    // Serialize _id to string
    const serialized = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    return NextResponse.json({ products: serialized }, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (err) {
    console.error("[/api/products GET]", err);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}