import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { jwtVerify } from "jose";

const MONGODB_URI = process.env.MONGODB_URI!;
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

async function getDb() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("users");
  return { client, col: db.collection("addresses") };
}

// GET — all addresses for user
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { client, col } = await getDb();
    const addresses = await col
      .find({ userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .toArray();
    await client.close();
    return NextResponse.json({
      addresses: addresses.map(a => ({ ...a, _id: a._id.toString() })),
    });
  } catch (err) {
    console.error("[user/addresses GET]", err);
    return NextResponse.json({ error: "Failed to fetch addresses." }, { status: 500 });
  }
}

// POST — add new address
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();
    const { label, fullName, phone, line1, line2, city, state, pincode } = body;

    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const { client, col } = await getDb();

    // First address is auto-default
    const count = await col.countDocuments({ userId });
    const isDefault = count === 0;

    const result = await col.insertOne({
      userId,
      label: label || "Home",
      fullName,
      phone,
      line1,
      line2: line2 || "",
      city,
      state,
      pincode,
      isDefault,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await client.close();
    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("[user/addresses POST]", err);
    return NextResponse.json({ error: "Failed to add address." }, { status: 500 });
  }
}

// PUT — update address
export async function PUT(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = await req.json();
    const { _id, label, fullName, phone, line1, line2, city, state, pincode } = body;

    if (!_id) return NextResponse.json({ error: "Address ID required." }, { status: 400 });

    const { client, col } = await getDb();
    await col.updateOne(
      { _id: new ObjectId(_id), userId },
      {
        $set: {
          label: label || "Home",
          fullName,
          phone,
          line1,
          line2: line2 || "",
          city,
          state,
          pincode,
          updatedAt: new Date(),
        },
      }
    );
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[user/addresses PUT]", err);
    return NextResponse.json({ error: "Failed to update address." }, { status: 500 });
  }
}

// PATCH — set default address
export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { _id, isDefault } = await req.json();
    if (!_id) return NextResponse.json({ error: "Address ID required." }, { status: 400 });

    const { client, col } = await getDb();

    if (isDefault) {
      // Unset all defaults first
      await col.updateMany({ userId }, { $set: { isDefault: false } });
      // Set new default
      await col.updateOne({ _id: new ObjectId(_id), userId }, { $set: { isDefault: true } });
    }

    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[user/addresses PATCH]", err);
    return NextResponse.json({ error: "Failed to update address." }, { status: 500 });
  }
}

// DELETE — remove address
export async function DELETE(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });

    const { client, col } = await getDb();
    const addr = await col.findOne({ _id: new ObjectId(id), userId });

    await col.deleteOne({ _id: new ObjectId(id), userId });

    // If deleted was default, assign new default to most recent
    if (addr?.isDefault) {
      const next = await col.findOne({ userId }, { sort: { createdAt: -1 } });
      if (next) {
        await col.updateOne({ _id: next._id }, { $set: { isDefault: true } });
      }
    }

    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[user/addresses DELETE]", err);
    return NextResponse.json({ error: "Failed to delete address." }, { status: 500 });
  }
}