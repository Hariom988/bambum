import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

export async function GET() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);
    const col = client.db("content").collection("testimonials");
    const items = await col
      .find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    await client.close();
    return NextResponse.json(
      { items: items.map((i) => ({ ...i, _id: i._id.toString() })) },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error("[public testimonials GET]", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}