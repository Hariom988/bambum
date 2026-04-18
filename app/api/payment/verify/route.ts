import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import crypto from "crypto";
import { MongoClient, ObjectId } from "mongodb";

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

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      total,
      address,
    } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    // Create order in DB
    const client = await MongoClient.connect(MONGODB_URI);
    const col = client.db("users").collection("orders");

    const orderId = `ORD${Date.now().toString().slice(-8)}`;

    // Decrement stock for each item
    const productsCol = client.db("inventory").collection("products");
    for (const item of items) {
      await productsCol.updateOne(
        { _id: new ObjectId(item.productId) },
        { $inc: { stock: -item.quantity } }
      );
    }

    const result = await col.insertOne({
      userId,
      orderId,
      items,
      total,
      address,
      status: "confirmed",
      payment: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        method: "razorpay",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await client.close();

    return NextResponse.json({
      ok: true,
      id: result.insertedId,
      orderId,
    }, { status: 201 });
  } catch (err) {
    console.error("[payment/verify]", err);
    return NextResponse.json({ error: "Failed to verify payment." }, { status: 500 });
  }
}