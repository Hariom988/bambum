import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

async function getDb() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("users");
  return { client, col: db.collection("orders") };
}

// GET — all orders with user details
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const { client, col } = await getDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "address.fullName": { $regex: search, $options: "i" } },
      ];
    }

    const orders = await col
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    return NextResponse.json({
      orders: orders.map((o) => ({ ...o, _id: o._id.toString() })),
    });
  } catch (err) {
    console.error("[admin/orders GET]", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

// PATCH — update order status
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });

    const body = await req.json();
    const { status } = body;

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const { client, col } = await getDb();
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    await client.close();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/orders PATCH]", err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}   