import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

async function getDb() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("content");
  return { client, col: db.collection("faq") };
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
    console.error("[faq GET]", err);
    return NextResponse.json({ error: "Failed to fetch FAQs." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, answer } = body;
    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: "Question and answer are required." }, { status: 400 });
    }
    const { client, col } = await getDb();
    const count = await col.countDocuments();
    const result = await col.insertOne({
      question: question.trim(),
      answer: answer.trim(),
      isActive: true,
      order: count,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await client.close();
    return NextResponse.json({ ok: true, id: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("[faq POST]", err);
    return NextResponse.json({ error: "Failed to create FAQ." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { _id, question, answer, order } = body;
    if (!_id) return NextResponse.json({ error: "ID required." }, { status: 400 });
    const { client, col } = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = { updatedAt: new Date() };
    if (question !== undefined) update.question = question.trim();
    if (answer !== undefined) update.answer = answer.trim();
    if (order !== undefined) update.order = order;
    await col.updateOne({ _id: new ObjectId(_id) }, { $set: update });
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[faq PUT]", err);
    return NextResponse.json({ error: "Failed to update FAQ." }, { status: 500 });
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
    console.error("[faq PATCH]", err);
    return NextResponse.json({ error: "Failed to toggle FAQ." }, { status: 500 });
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
    console.error("[faq DELETE]", err);
    return NextResponse.json({ error: "Failed to delete FAQ." }, { status: 500 });
  }
}