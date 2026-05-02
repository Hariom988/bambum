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

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      total,
      address,
      isGuest,
      guestInfo,
    } = await req.json();

    if (!userId && (!isGuest || !guestInfo?.name || !guestInfo?.phone)) {
      return NextResponse.json(
        { error: "Missing user or guest information." },
        { status: 400 }
      );
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_TEST_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Payment verification failed." },
        { status: 400 }
      );
    }

    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db("users"); 

    // 1. Save Guest Info to the "guest" collection
    let savedGuestId = null;
    if (isGuest && guestInfo) {
      const guestCol = db.collection("guest");
      // Prevent duplicates by checking phone number
      const existingGuest = await guestCol.findOne({ phone: guestInfo.phone });
      
      if (existingGuest) {
        savedGuestId = existingGuest._id.toString();
      } else {
        const guestResult = await guestCol.insertOne({
          name: guestInfo.name,
          phone: guestInfo.phone,
          email: guestInfo.email || "",
          createdAt: new Date(),
        });
        savedGuestId = guestResult.insertedId.toString();
      }
    }

    const orderId = `ORD${Date.now().toString().slice(-8)}`;

 // 2. Decrement stock
    const productsCol = client.db("inventory").collection("products");
    for (const item of items) {
      await productsCol.updateOne(
        { _id: new ObjectId(item.productId) },
        { $inc: { "variants.$[v].sizes.$[s].stock": -item.quantity } },
        {
          arrayFilters: [
            { "v.colorName": item.colorName },
            { "s.size": item.size }
          ]
        }
      );
    }

    // 3. Save Order to the "orders" collection
    const ordersCol = db.collection("orders");
    const result = await ordersCol.insertOne({
      userId: userId ?? null,
      guestId: savedGuestId,
      isGuest: isGuest ?? false,
      guestInfo: isGuest ? guestInfo : null, // Embedded for easy frontend display
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

    return NextResponse.json(
      { ok: true, id: result.insertedId, orderId },
      { status: 201 }
    );
  } catch (err) {
    console.error("[payment/verify]", err);
    return NextResponse.json(
      { error: "Failed to verify payment." },
      { status: 500 }
    );
  }
}