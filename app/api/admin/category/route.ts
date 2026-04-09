import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

async function getDb() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("inventory");
  return { client, db, col: db.collection("category") };
}

// GET — all categories
export async function GET() {
  try {
    const { client, col } = await getDb();
    const categories = await col.find({}).sort({ name: 1 }).toArray();
    await client.close();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("[category GET]", err);
    return NextResponse.json({ error: "Failed to fetch categories." }, { status: 500 });
  }
}

// POST — create new category
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }
    const { client, col } = await getDb();

    // Prevent duplicates (case-insensitive)
    const existing = await col.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (existing) {
      await client.close();
      return NextResponse.json({ error: "Category already exists." }, { status: 409 });
    }

    const result = await col.insertOne({
      name: name.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await client.close();
    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("[category POST]", err);
    return NextResponse.json({ error: "Failed to create category." }, { status: 500 });
  }
}

// PUT — rename category
export async function PUT(req: NextRequest) {
  try {
    const { _id, name } = await req.json();
    if (!_id || !name?.trim()) {
      return NextResponse.json({ error: "ID and name are required." }, { status: 400 });
    }
    const { client, col } = await getDb();

    // Prevent duplicate name (exclude self)
    const existing = await col.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: new ObjectId(_id) },
    });
    if (existing) {
      await client.close();
      return NextResponse.json({ error: "Category name already exists." }, { status: 409 });
    }

    await col.updateOne(
      { _id: new ObjectId(_id) },
      { $set: { name: name.trim(), updatedAt: new Date() } }
    );
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[category PUT]", err);
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID required." }, { status: 400 });
    }
    const { client, col } = await getDb();
    await col.deleteOne({ _id: new ObjectId(id) });
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[category DELETE]", err);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}