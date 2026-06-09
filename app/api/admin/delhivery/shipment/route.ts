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
  let client: MongoClient | null = null;

  // FIX: Parse the body BEFORE the try block so orderId is in scope inside
  // the catch block. req.json() can only be called once — the previous code
  // called it again inside catch, which returned {} and left the
  // delhivery.creating lock permanently set on the order document.
  const body = await req.json().catch(() => ({}));
  const { orderId } = body as { orderId?: string };

  try {
    if (!orderId) {
      return NextResponse.json({ error: "orderId is required." }, { status: 400 });
    }

    const { client: c, col } = await getOrdersCollection();
    client = c;

    // ── Atomic idempotency lock ───────────────────────────────────────────────
    // findOneAndUpdate atomically checks + sets a "creating" flag.
    // Prevents duplicate shipments if the admin double-clicks.
    const locked = await col.findOneAndUpdate(
      {
        _id: new ObjectId(orderId),
        status: "confirmed",
        "delhivery.waybill":   { $exists: false }, // no waybill yet
        "delhivery.creating":  { $ne: true },       // not already mid-creation
      },
      {
        $set: { "delhivery.creating": true, "delhivery.creatingAt": new Date() },
      },
      { returnDocument: "after" }
    );

    if (!locked) {
      const order = await col.findOne({ _id: new ObjectId(orderId) });

      await client.close();

      if (!order) {
        return NextResponse.json({ error: "Order not found." }, { status: 404 });
      }
      if (order.delhivery?.waybill) {
        return NextResponse.json(
          { error: "Shipment already created.", waybill: order.delhivery.waybill },
          { status: 409 }
        );
      }
      if (order.delhivery?.creating) {
        return NextResponse.json(
          { error: "Shipment creation is already in progress. Please wait." },
          { status: 409 }
        );
      }
      if (order.status !== "confirmed") {
        return NextResponse.json(
          { error: `Shipment can only be created for confirmed orders. Current status: ${order.status}` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "Could not acquire lock. Please try again." },
        { status: 409 }
      );
    }

    const order = locked;

    // ── Resolve phone ─────────────────────────────────────────────────────────
    // After the root-cause fix in payment/verify/route.ts, address.phone will
    // always be populated. The guestInfo fallback is kept for backward
    // compatibility with any orders created before the fix was deployed.
    const resolvedPhone: string =
      order.address?.phone ||
      order.guestInfo?.phone ||
      "";

    if (!resolvedPhone) {
      await col.updateOne(
        { _id: new ObjectId(orderId) },
        { $unset: { "delhivery.creating": "", "delhivery.creatingAt": "" } }
      );
      await client.close();
      return NextResponse.json(
        { error: "No phone number found on this order. Cannot create shipment." },
        { status: 400 }
      );
    }

    // ── Resolve name ──────────────────────────────────────────────────────────
    // Same backward-compatibility pattern for fullName.
    const resolvedName: string =
      order.address?.fullName ||
      order.guestInfo?.name   ||
      "";

    if (!resolvedName) {
      await col.updateOne(
        { _id: new ObjectId(orderId) },
        { $unset: { "delhivery.creating": "", "delhivery.creatingAt": "" } }
      );
      await client.close();
      return NextResponse.json(
        { error: "No consignee name found on this order. Cannot create shipment." },
        { status: 400 }
      );
    }

    // ── Call Delhivery ────────────────────────────────────────────────────────
    const result = await createShipment({
      orderId: order.orderId,
      total:   order.total,
      address: {
        ...order.address,
        fullName: resolvedName,  // guaranteed non-empty
        phone:    resolvedPhone, // guaranteed non-empty
      },
      items: order.items.map((i: {
        name: string;
        quantity: number;
        price: number;
      }) => ({
        name:     i.name,
        quantity: i.quantity,
        price:    i.price,
      })),
    });

    if (!result.success) {
      console.error("[admin/delhivery/shipment] Delhivery rejected shipment:", {
        orderId:  order.orderId,
        error:    result.error,
        packages: JSON.stringify((result.raw as { packages?: unknown })?.packages, null, 2),
        rmk:      (result.raw as { rmk?: string })?.rmk,
      });

      // Release the lock so admin can retry
      await col.updateOne(
        { _id: new ObjectId(orderId) },
        { $unset: { "delhivery.creating": "", "delhivery.creatingAt": "" } }
      );
      await client.close();

      return NextResponse.json(
        { error: result.error || "Delhivery shipment creation failed." },
        { status: 502 }
      );
    }

    // ── Success: persist waybill and update order status ──────────────────────
    const now = new Date();
    await col.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status:                        "shipped",
          updatedAt:                     now,
          "delhivery.waybill":           result.waybill,
          "delhivery.shipmentCreatedAt": now,
          "delhivery.status":            "Manifested",
          "delhivery.statusType":        "",
          "delhivery.location":          "",
          "delhivery.lastTrackedAt":     null,
          "delhivery.trackingHistory":   [],
        },
        $unset: {
          "delhivery.creating":   "",
          "delhivery.creatingAt": "",
        },
      }
    );

    await client.close();

    console.log("[admin/delhivery/shipment] Shipment created:", {
      orderId: order.orderId,
      waybill: result.waybill,
    });

    return NextResponse.json({
      ok:      true,
      waybill: result.waybill,
      message: "Shipment created successfully.",
    });
  } catch (err) {
    // ── Safety net: always release the lock on unexpected error ───────────────
    // orderId is in scope here because it was parsed before the try block.
    if (client) {
      try {
        if (orderId) {
          const col = client.db("users").collection("orders");
          await col.updateOne(
            { _id: new ObjectId(orderId) },
            { $unset: { "delhivery.creating": "", "delhivery.creatingAt": "" } }
          );
        }
      } catch {
        // best-effort, do not mask the original error
      }
      await client.close();
    }

    console.error("[admin/delhivery/shipment POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}