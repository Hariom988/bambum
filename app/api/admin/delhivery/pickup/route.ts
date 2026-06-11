// app/api/admin/delhivery/pickup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createPickupRequest } from "@/lib/delhivery";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { pickup_date, pickup_time, expected_package_count } = body as {
      pickup_date?: string;
      pickup_time?: string;
      expected_package_count?: number;
    };

    if (!pickup_date || !pickup_time || !expected_package_count) {
      return NextResponse.json(
        { error: "pickup_date, pickup_time, and expected_package_count are required." },
        { status: 400 }
      );
    }

    const result = await createPickupRequest(
      pickup_date,
      pickup_time.length === 5 ? `${pickup_time}:00` : pickup_time,
      Number(expected_package_count)
    );

    if (!result.success) {
      console.error("[admin/delhivery/pickup] Delhivery error:", result.raw);
      return NextResponse.json(
        { error: result.error || "Pickup request failed." },
        { status: 502 }
      );
    }

    console.log("[admin/delhivery/pickup] Pickup created:", {
      pickupId: result.pickupId,
      pickup_date,
      pickup_time,
      expected_package_count,
    });

    return NextResponse.json({
      ok: true,
      pickupId: result.pickupId,
      message: "Pickup request created successfully.",
    });
  } catch (err) {
    console.error("[admin/delhivery/pickup POST] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}