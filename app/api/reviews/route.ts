import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import * as jose from "jose";

  //  Auth helper
async function getUserFromCookie(): Promise<{ id: string; name: string } | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_token")?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jose.jwtVerify(token, secret);
    return {
      id: ((payload.userId ?? payload.id ?? payload.sub) as string),
      name: ((payload.name ?? payload.userName ?? "Anonymous") as string),
    };
  } catch (err) {
    console.error("[reviews] auth error:", err);
    return null;
  }
}

  //  GET

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId") || "";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Number(searchParams.get("limit") || "9"));
  const skip = (page - 1) * limit;

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const col = client.db("users").collection("reviews");
    const filter = { productId, status: "visible" };

    const [reviews, total, aggregation] = await Promise.all([
      col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      col.countDocuments(filter),
      col.aggregate([
        { $match: { productId, status: "visible" } },
        {
          $group: {
            _id: null,
            average: { $avg: "$rating" },
            total: { $sum: 1 },
            r1: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
            r2: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            r3: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            r4: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            r5: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          },
        },
      ]).toArray(),
    ]);

    const agg = aggregation[0] ?? null;

    return NextResponse.json({
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
      stats: agg
        ? {
            average: Math.round((agg.average || 0) * 10) / 10,
            total: agg.total || 0,
            distribution: { 1: agg.r1||0, 2: agg.r2||0, 3: agg.r3||0, 4: agg.r4||0, 5: agg.r5||0 },
          }
        : null,
    });
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

  //  POST 
export async function POST(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const productId = formData.get("productId") as string;
    const productSlug = formData.get("productSlug") as string;
    const productName = formData.get("productName") as string;
    const rating = Number(formData.get("rating"));
    const title = ((formData.get("title") as string) ?? "").slice(0, 80);
    const body = ((formData.get("body") as string) ?? "").slice(0, 1000);
    const imageFiles = formData.getAll("images") as File[];

    if (!productId || !rating || !body || body.trim().length < 10) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const client = await clientPromise;
    const col = client.db("users").collection("reviews");
    const imageUrls: string[] = [];
    for (const file of imageFiles.slice(0, 4)) {
      if (!(file instanceof File) || file.size === 0) continue;
      try {
        const buf = Buffer.from(await file.arrayBuffer());
        const base64 = buf.toString("base64");
        const mime = file.type || "image/jpeg";
        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              file: `data:${mime};base64,${base64}`,
              upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
              folder: "bambum/reviews",
            }),
          }
        );
        if (cloudRes.ok) {
          const d = await cloudRes.json();
          if (d.secure_url) imageUrls.push(d.secure_url);
          else console.error("[reviews] Cloudinary no secure_url:", d);
        } else {
          console.error("[reviews] Cloudinary error:", await cloudRes.text());
        }
      } catch (uploadErr) {
        console.error("[reviews] Cloudinary upload threw:", uploadErr);
      }
    }

    await col.insertOne({
      productId, productSlug, productName,
      userId: user.id, userName: user.name,
      rating, title, body,
      images: imageUrls,
      status: "visible",
      helpful: 0,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

  //  DELETE 

export async function DELETE(req: NextRequest) {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const client = await clientPromise;
    const col = client.db("users").collection("reviews");

    // userId guard: users can only delete their own reviews
    const result = await col.deleteOne({
      _id: new ObjectId(id),
      userId: user.id,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Not found or not yours." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/reviews error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}