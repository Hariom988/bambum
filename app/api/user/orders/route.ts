import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { jwtVerify } from "jose";

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
  return { client, col: db.collection("orders") };
}

// GET — all orders for the user
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { client, col } = await getDb();
    const orders = await col
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    await client.close();
    return NextResponse.json({
      orders: orders.map(o => ({ ...o, _id: o._id.toString() })),
    });
  } catch (err) {
    console.error("[user/orders GET]", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

// POST — create a new order (called from checkout)
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();
    const { items, total, address } = body;

    if (!items?.length || !total || !address) {
      return NextResponse.json({ error: "Missing order data." }, { status: 400 });
    }

    // Generate a short order ID: ORD + timestamp
    const orderId = `ORD${Date.now().toString().slice(-8)}`;

    const { client, col } = await getDb();
    const result = await col.insertOne({
      userId,
      orderId,
      items,
      total,
      address,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await client.close();
    return NextResponse.json({ ok: true, id: result.insertedId, orderId }, { status: 201 });
  } catch (err) {
    console.error("[user/orders POST]", err);
    return NextResponse.json({ error: "Failed to create order." }, { status: 500 });
  }
}