import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

export async function GET() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const col = client.db("inventory").collection("products");
    const products = await col
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .project({ _id: 1, name: 1, slug: 1, price: 1, category: 1, variants: 1 })
      .toArray();
    await client.close();

    const serialized = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
    }));

    return NextResponse.json({ products: serialized });
  } catch (err) {
    console.error("[/api/products GET]", err);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}