import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

async function getDb() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("inventory");
  return { client, db, col: db.collection("products") };
}

// GET — all products
export async function GET() {
  try {
    const { client, col } = await getDb();
    const products = await col.find({}).sort({ createdAt: -1 }).toArray();
    await client.close();
    return NextResponse.json({ products });
  } catch (err) {
    console.error("[inventory GET]", err);
    return NextResponse.json({ error: "Failed to fetch products." }, { status: 500 });
  }
}

// POST — create new product
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, slug, description, price, category, variants, isActive } = body;

    if (!name || !category || !price) {
      return NextResponse.json(
        { error: "Name, category and price are required." },
        { status: 400 }
      );
    }

    const { client, col } = await getDb();

    const product = {
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description || "",
      price: Number(price),
      category,
      variants: variants || [],
      isActive: isActive !== false, // default true
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await col.insertOne(product);
    await client.close();

    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("[inventory POST]", err);
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}

// PUT — full product update (all fields)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { _id, name, slug, description, price, category, variants, isActive } = body;

    if (!_id) {
      return NextResponse.json({ error: "Product ID required." }, { status: 400 });
    }

    const { client, col } = await getDb();

    await col.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          name,
          slug,
          description,
          price: Number(price),
          category,
          variants,
          isActive: isActive !== false,
          updatedAt: new Date(),
        },
      }
    );

    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[inventory PUT]", err);
    return NextResponse.json({ error: "Failed to update product." }, { status: 500 });
  }
}

// PATCH — partial update (e.g. toggle isActive only, without touching other fields)
export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required." }, { status: 400 });
    }

    const body = await req.json();

    // Only allow safe partial fields through PATCH
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allowed: Record<string, any> = {};
    if (typeof body.isActive === "boolean") allowed.isActive = body.isActive;
    // Add more patchable fields here as needed

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    allowed.updatedAt = new Date();

    const { client, col } = await getDb();
    await col.updateOne({ _id: new ObjectId(id) }, { $set: allowed });
    await client.close();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[inventory PATCH]", err);
    return NextResponse.json({ error: "Failed to patch product." }, { status: 500 });
  }
}

// DELETE — remove product
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
    console.error("[inventory DELETE]", err);
    return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
  }
}