//  app/api/admin/delhivery/pickup/route.ts


import { NextRequest, NextResponse } from "next/server";
import { createPickupRequest } from "@/lib/delhivery";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pickup_date, pickup_time, expected_package_count } = body;

    // ── Validate required fields ─────────────────────────────────────────────
    if (!pickup_date || !pickup_time || !expected_package_count) {
      return NextResponse.json(
        { error: "pickup_date, pickup_time, and expected_package_count are required." },
        { status: 400 }
      );
    }

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(pickup_date)) {
      return NextResponse.json(
        { error: "pickup_date must be in YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    // Validate time format HH:mm:ss
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeRegex.test(pickup_time)) {
      return NextResponse.json(
        { error: "pickup_time must be in HH:mm:ss format." },
        { status: 400 }
      );
    }

    const packageCount = Number(expected_package_count);
    if (!Number.isInteger(packageCount) || packageCount < 1) {
      return NextResponse.json(
        { error: "expected_package_count must be a positive integer." },
        { status: 400 }
      );
    }

    // ── Call Delhivery ───────────────────────────────────────────────────────
    const result = await createPickupRequest(pickup_date, pickup_time, packageCount);

    if (!result.success) {
      console.error("[admin/delhivery/pickup] Delhivery error:", result.raw);
      return NextResponse.json(
        { error: result.error || "Pickup request creation failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      pickupId: result.pickupId,
      message: `Pickup request created for ${pickup_date} at ${pickup_time}.`,
    });
  } catch (err) {
    console.error("[admin/delhivery/pickup POST]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}