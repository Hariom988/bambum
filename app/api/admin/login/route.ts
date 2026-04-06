import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// 30-minute idle timeout. Session cookie (no maxAge) → clears on tab/browser close.
const SESSION_DURATION = 30 * 60; // seconds

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(); // uses the default DB in the URI (or set: client.db("admin"))
    const adminCol = db.collection("credentials"); // admin.credentials collection
    
    // Find admin by username (case-insensitive)
    const admin = await adminCol.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });
    await client.close();

    if (!admin) {
      // Constant-time response to prevent timing attacks
      await bcrypt.compare(password, "$2b$10$invalidhashtopreventtiming");
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Verify password (bcrypt hash stored in DB)
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    // Issue JWT
    const token = await new SignJWT({
      sub: admin._id.toString(),
      username: admin.username,
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DURATION}s`)
      .sign(JWT_SECRET);

    // Session cookie: no maxAge/expires → browser deletes it on close
    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,          // JS cannot read it
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",      // CSRF protection
      path: "/",
      // NO maxAge / expires → session cookie (deleted when tab/browser closes)
    });

    return response;
  } catch (err) {
    console.error("[admin/login]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}