// app/api/user/wishlist/route.ts

import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { jwtVerify } from "jose";
import { WishlistItem } from "@/lib/types/wishlist";

const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    const token = req.cookies.get("user_token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.sub as string;
  } catch {
    return null;
  }
}

async function getDb() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("users");
  return { client, col: db.collection("wishlists") };
}

// GET /api/user/wishlist
// Returns the user's wishlist items array
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { client, col } = await getDb();
    const doc = await col.findOne({ userId });
    await client.close();
    return NextResponse.json({ items: doc?.items ?? [] });
  } catch (err) {
    console.error("[user/wishlist GET]", err);
    return NextResponse.json(
      { error: "Failed to fetch wishlist." },
      { status: 500 },
    );
  }
}

// PUT /api/user/wishlist
// Replaces the full wishlist array — called after every add/remove
export async function PUT(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId)
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { items }: { items: WishlistItem[] } = await req.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array." },
        { status: 400 },
      );
    }

    const { client, col } = await getDb();
    await col.updateOne(
      { userId },
      {
        $set: {
          userId,
          items,
          updatedAt: new Date(),
        },
      },
      { upsert: true }, // creates the document on first save
    );
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[user/wishlist PUT]", err);
    return NextResponse.json(
      { error: "Failed to update wishlist." },
      { status: 500 },
    );
  }
}