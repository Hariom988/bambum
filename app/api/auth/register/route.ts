import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const SESSION_DURATION = 4 * 60 * 60; // 4 hours in seconds

async function getDb() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("users");
  return { client, col: db.collection("credentials") };
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const { client, col } = await getDb();

    // Check if email already exists
    const existing = await col.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
    });

    if (existing) {
      await client.close();
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await col.insertOne({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      provider: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await client.close();

    // Issue JWT session token
    const token = await new SignJWT({
      sub: result.insertedId.toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      provider: "email",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DURATION}s`)
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      ok: true,
      user: {
        id: result.insertedId.toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
      },
    }, { status: 201 });

    response.cookies.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_DURATION, // 4 hours - persists across tabs
    });

    return response;
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}