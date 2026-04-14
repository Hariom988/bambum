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
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const { client, col } = await getDb();

    const user = await col.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
      provider: "email",
    });

    if (!user) {
      await bcrypt.compare(password, "$2b$12$invalidhashtopreventtiming");
      await client.close();
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await client.close();
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await client.close();

    const token = await new SignJWT({
      sub: user._id.toString(),
      name: user.name,
      email: user.email,
      provider: "email",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DURATION}s`)
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });

    response.cookies.set("user_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_DURATION, // 4 hours - persists across tabs
    });

    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}