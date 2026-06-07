//  app/api/admin/delhivery/track/route.ts


import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { trackShipment } from "@/lib/delhivery";

const MONGODB_URI = process.env.MONGODB_URI!;

async function getOrdersCollection() {
  const client = await MongoClient.connect(MONGODB_URI);
  const col = client.db("users").collection("orders");
  return { client, col };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const waybill = searchParams.get("waybill");
    const orderId = searchParams.get("orderId");

    if (!waybill) {
      return NextResponse.json({ error: "waybill is required." }, { status: 400 });
    }

    // ── Call Delhivery ───────────────────────────────────────────────────────
    const result = await trackShipment(waybill);

    if (!result.success || !result.data) {
      console.error("[admin/delhivery/track] Delhivery error:", result.error);
      return NextResponse.json(
        { error: result.error || "Tracking data unavailable." },
        { status: 502 }
      );
    }

    // ── Persist latest status back to the order document (best-effort) ───────
    if (orderId) {
      try {
        const { client, col } = await getOrdersCollection();
        await col.updateOne(
          { _id: new ObjectId(orderId) },
          {
            $set: {
              "delhivery.status": result.data.status,
              "delhivery.statusType": result.data.statusType,
              "delhivery.location": result.data.location,
              "delhivery.expectedDelivery": result.data.expectedDelivery,
              "delhivery.lastTrackedAt": new Date(),
              "delhivery.trackingHistory": result.data.scans,
            },
          }
        );
        await client.close();
      } catch (dbErr) {
        // Non-fatal — tracking data is still returned to the UI
        console.error("[admin/delhivery/track] DB persist error:", dbErr);
      }
    }

    return NextResponse.json({ ok: true, tracking: result.data });
  } catch (err) {
    console.error("[admin/delhivery/track GET]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}