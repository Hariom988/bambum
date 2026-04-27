import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

async function getDb() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("content");
  return { client, col: db.collection("testimonials") };
}

export async function GET() {
  try {
    const { client, col } = await getDb();
    const items = await col.find({}).sort({ order: 1, createdAt: 1 }).toArray();
    await client.close();
    return NextResponse.json({
      items: items.map((i) => ({ ...i, _id: i._id.toString() })),
    });
  } catch (err) {
    console.error("[testimonials GET]", err);
    return NextResponse.json({ error: "Failed to fetch testimonials." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, location, rating, title, text, product } = body;
    if (!name?.trim() || !title?.trim() || !text?.trim()) {
      return NextResponse.json({ error: "Name, title, and text are required." }, { status: 400 });
    }
    const { client, col } = await getDb();
    const count = await col.countDocuments();
    const initials = name
      .trim()
      .split(" ")
      .map((n: string) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    const result = await col.insertOne({
      name: name.trim(),
      location: location?.trim() || "",
      rating: Number(rating) || 5,
      title: title.trim(),
      text: text.trim(),
      product: product?.trim() || "",
      initials,
      isActive: true,
      order: count,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await client.close();
    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("[testimonials POST]", err);
    return NextResponse.json({ error: "Failed to create testimonial." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { _id, name, location, rating, title, text, product, order } = body;
    if (!_id) return NextResponse.json({ error: "ID required." }, { status: 400 });
    const { client, col } = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) {
      update.name = name.trim();
      update.initials = name
        .trim()
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    if (location !== undefined) update.location = location.trim();
    if (rating !== undefined) update.rating = Number(rating);
    if (title !== undefined) update.title = title.trim();
    if (text !== undefined) update.text = text.trim();
    if (product !== undefined) update.product = product.trim();
    if (order !== undefined) update.order = order;
    await col.updateOne({ _id: new ObjectId(_id) }, { $set: update });
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[testimonials PUT]", err);
    return NextResponse.json({ error: "Failed to update testimonial." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });
    const body = await req.json();
    const { client, col } = await getDb();
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: body.isActive, updatedAt: new Date() } }
    );
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[testimonials PATCH]", err);
    return NextResponse.json({ error: "Failed to toggle testimonial." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required." }, { status: 400 });
    const { client, col } = await getDb();
    await col.deleteOne({ _id: new ObjectId(id) });
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[testimonials DELETE]", err);
    return NextResponse.json({ error: "Failed to delete testimonial." }, { status: 500 });
  }
}