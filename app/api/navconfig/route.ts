import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";

const MONGODB_URI = process.env.MONGODB_URI!;

async function getCol() {
  const client = await MongoClient.connect(MONGODB_URI);
  const col = client.db("content").collection("navConfig");
  return { client, col };
}

export async function GET() {
  try {
    const { client, col } = await getCol();
    const docs = await col.find({}).sort({ order: 1 }).toArray();
    await client.close();
    return NextResponse.json({
      items: docs.map((d) => ({ ...d, _id: d._id.toString() })),
    });
  } catch (err) {
    console.error("[navconfig GET]", err);
    return NextResponse.json({ error: "Failed to fetch." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { label, order = 0 } = body;
    if (!label?.trim()) {
      return NextResponse.json({ error: "Label is required." }, { status: 400 });
    }
    const { client, col } = await getCol();

    const existing = await col.findOne({
      label: { $regex: new RegExp(`^${label.trim()}$`, "i") },
    });
    if (existing) {
      await client.close();
      return NextResponse.json({ error: "Nav item already exists." }, { status: 409 });
    }

    const result = await col.insertOne({
      label: label.trim(),
      order,
      isActive: true,
      categories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await client.close();
    revalidateTag("navconfig","default");
    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("[navconfig POST]", err);
    return NextResponse.json({ error: "Failed to create." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { _id, label, order, isActive, categories } = body;
    if (!_id || !label?.trim()) {
      return NextResponse.json({ error: "_id and label are required." }, { status: 400 });
    }
    const { client, col } = await getCol();
    await col.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          label: label.trim(),
          order: order ?? 0,
          isActive: isActive ?? true,
          categories: categories ?? [],
          updatedAt: new Date(),
        },
      }
    );
    await client.close();
    revalidateTag("navconfig", "default"); 
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[navconfig PUT]", err);
    return NextResponse.json({ error: "Failed to update." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { items } = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items array required." }, { status: 400 });
    }
    const { client, col } = await getCol();
    await Promise.all(
      items.map(({ _id, order }: { _id: string; order: number }) =>
        col.updateOne(
          { _id: new ObjectId(_id) },
          { $set: { order, updatedAt: new Date() } }
        )
      )
    );
    await client.close();
    revalidateTag("navconfig", "default");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[navconfig PATCH]", err);
    return NextResponse.json({ error: "Failed to reorder." }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id required." }, { status: 400 });
    }
    const { client, col } = await getCol();
    await col.deleteOne({ _id: new ObjectId(id) });
    await client.close();
    revalidateTag("navconfig", "default"); 
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[navconfig DELETE]", err);
    return NextResponse.json({ error: "Failed to delete." }, { status: 500 });
  }
}