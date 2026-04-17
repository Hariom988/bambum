import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import Razorpay from "razorpay";

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

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { amount } = await req.json(); 

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("[payment/create-order]", err);
    return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
  }
}