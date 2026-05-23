import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { MongoClient } from "mongodb";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const MONGODB_URI = process.env.MONGODB_URI!;

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  if (!orderId) {
    return NextResponse.json({ error: "Order ID required." }, { status: 400 });
  }

  const userId = await getUserId(req);

  let client: MongoClient | null = null;
  try {
    client = await MongoClient.connect(MONGODB_URI);
    const db = client.db("users");
    const ordersCol = db.collection("orders");

    const order = await ordersCol.findOne({ orderId });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const isOwner = userId && order.userId && order.userId === userId;
    const isGuestOrder = order.isGuest === true;

    if (!isOwner && !isGuestOrder) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (err) {
    console.error("[orders/[orderId]]", err);
    return NextResponse.json(
      { error: "Failed to fetch order." },
      { status: 500 }
    );
  } finally {
    await client?.close();
  }
}