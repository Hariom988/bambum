import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import * as jose from "jose";

async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return false;
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET!);
    await jose.jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(50, Number(searchParams.get("limit") || "10"));
  const skip = (page - 1) * limit;
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const productId = searchParams.get("productId") || "";

  try {
    const client = await clientPromise;
    const col = client.db("users").collection("reviews");

    const filter: Record<string, unknown> = {};
    if (status !== "all") filter.status = status;
    if (productId) filter.productId = productId;
    if (search.trim()) {
      filter.$or = [
        { userName: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } },
        { body: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ];
    }

    const [reviews, total] = await Promise.all([
      col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      col.countDocuments(filter),
    ]);

    return NextResponse.json({
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id, status } = await req.json();
    if (!id || !["visible", "hidden"].includes(status)) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }

    const client = await clientPromise;
    const col = client.db("users").collection("reviews");
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "id required." }, { status: 400 });
    }

    const client = await clientPromise;
    const col = client.db("users").collection("reviews");
    await col.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}