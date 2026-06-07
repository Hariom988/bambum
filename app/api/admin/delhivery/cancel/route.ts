//  app/api/admin/delhivery/cancel/route.ts


import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { cancelShipment } from "@/lib/delhivery";

const MONGODB_URI = process.env.MONGODB_URI!;

async function getOrdersCollection() {
  const client = await MongoClient.connect(MONGODB_URI);
  const col = client.db("users").collection("orders");
  return { client, col };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { waybill, orderId } = body;

    if (!waybill || !orderId) {
      return NextResponse.json(
        { error: "waybill and orderId are required." },
        { status: 400 }
      );
    }

    const { client, col } = await getOrdersCollection();

    // ── Verify the waybill belongs to this order (security check) ────────────
    const order = await col.findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      await client.close();
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.delhivery?.waybill !== waybill) {
      await client.close();
      return NextResponse.json(
        { error: "Waybill does not match this order." },
        { status: 403 }
      );
    }

    // ── Call Delhivery ───────────────────────────────────────────────────────
    const result = await cancelShipment(waybill);

    if (!result.success) {
      await client.close();
      console.error("[admin/delhivery/cancel] Delhivery error:", result.raw);
      return NextResponse.json(
        { error: result.error || "Shipment cancellation failed." },
        { status: 502 }
      );
    }

    // ── Update order document ────────────────────────────────────────────────
    const now = new Date();
    await col.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "cancelled",
          updatedAt: now,
          "delhivery.cancelledAt": now,
          "delhivery.status": "Cancelled",
        },
      }
    );

    await client.close();

    return NextResponse.json({
      ok: true,
      message: "Shipment cancelled successfully.",
    });
  } catch (err) {
    console.error("[admin/delhivery/cancel POST]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}