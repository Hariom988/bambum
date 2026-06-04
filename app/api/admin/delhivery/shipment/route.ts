// app/api/admin/delhivery/shipment/route.ts


import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { createShipment } from "@/lib/delhivery";

const MONGODB_URI = process.env.MONGODB_URI!;

async function getOrdersCollection() {
  const client = await MongoClient.connect(MONGODB_URI);
  const col = client.db("users").collection("orders");
  return { client, col };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;
console.log(body);
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required." }, { status: 400 });
    }

    const { client, col } = await getOrdersCollection();

    const order = await col.findOne({ _id: new ObjectId(orderId) });
    if (!order) {
      await client.close();
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.delhivery?.waybill) {
      await client.close();
      return NextResponse.json(
        { error: "Shipment already created.", waybill: order.delhivery.waybill },
        { status: 409 }
      );
    }

    if (order.status !== "confirmed") {
      await client.close();
      return NextResponse.json(
        { error: `Shipment can only be created for confirmed orders. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    const result = await createShipment({
      orderId: order.orderId,
      total: order.total,
      address: order.address,
      items: order.items.map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
    });
console.log(result);
    if (!result.success || !result.waybill) {
      await client.close();
      console.error("[admin/delhivery/shipment] Delhivery error:", result.raw);
      return NextResponse.json(
        { error: result.error || "Delhivery shipment creation failed." },
        { status: 502 }
      );
    }

    const now = new Date();
    await col.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status: "shipped",
          updatedAt: now,
          "delhivery.waybill": result.waybill,
          "delhivery.shipmentCreatedAt": now,
          "delhivery.status": "Manifested",
          "delhivery.statusType": "",
          "delhivery.location": "",
          "delhivery.lastTrackedAt": null,
          "delhivery.trackingHistory": [],
        },
      }
    );

    await client.close();

    return NextResponse.json({
      ok: true,
      waybill: result.waybill,
      message: "Shipment created successfully.",
    });
  } catch (err) { 
    console.error("[admin/delhivery/shipment POST]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
} 