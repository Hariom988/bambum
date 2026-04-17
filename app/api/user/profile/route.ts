import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

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
  return { client, col: db.collection("credentials") };
}

// GET — fetch profile
export async function GET(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { client, col } = await getDb();
    const user = await col.findOne(
      { _id: new ObjectId(userId) },
      { projection: { name: 1, email: 1, provider: 1 } }
    );
    await client.close();
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user: { ...user, _id: user._id.toString() } });
  } catch (err) {
    console.error("[user/profile GET]", err);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

// PUT — update name
export async function PUT(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required." }, { status: 400 });

    const { client, col } = await getDb();
    await col.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { name: name.trim(), updatedAt: new Date() } }
    );
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[user/profile PUT]", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}

// PATCH — change password
export async function PATCH(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Both current and new password required." }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const { client, col } = await getDb();
    const user = await col.findOne({ _id: new ObjectId(userId), provider: "email" });
    if (!user) {
      await client.close();
      return NextResponse.json({ error: "Password change not available for this account." }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      await client.close();
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await col.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { passwordHash, updatedAt: new Date() } }
    );
    await client.close();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[user/profile PATCH]", err);
    return NextResponse.json({ error: "Failed to change password." }, { status: 500 });
  }
}