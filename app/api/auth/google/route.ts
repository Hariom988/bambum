import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { SignJWT } from "jose";

const MONGODB_URI = process.env.MONGODB_URI!;
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const SESSION_DURATION = 4 * 60 * 60;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

async function getDb() {
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db("users");
  return { client, col: db.collection("credentials") };
}

// GET /api/auth/google - redirect to Google OAuth
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "callback") {
    // Handle OAuth callback
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error || !code) {
      return NextResponse.redirect(`${BASE_URL}/auth?error=google_denied`);
    }

    try {
      // Exchange code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: `${BASE_URL}/api/auth/google?action=callback`,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        throw new Error("Token exchange failed");
      }

      // Get user info from Google
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const googleUser = await userRes.json();
      if (!googleUser.email) {
        throw new Error("No email from Google");
      }

      const { client, col } = await getDb();

      // Upsert user
      const result = await col.findOneAndUpdate(
        { email: googleUser.email.toLowerCase() },
        {
          $set: {
            name: googleUser.name || googleUser.email,
            email: googleUser.email.toLowerCase(),
            picture: googleUser.picture || null,
            provider: "google",
            googleId: googleUser.id,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" }
      );

      await client.close();

      const userId = result?._id?.toString() || googleUser.id;

      const token = await new SignJWT({
        sub: userId,
        name: googleUser.name || googleUser.email,
        email: googleUser.email.toLowerCase(),
        picture: googleUser.picture || null,
        provider: "google",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION}s`)
        .sign(JWT_SECRET);

      const response = NextResponse.redirect(`${BASE_URL}/`);
      response.cookies.set("user_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION,
      });

      return response;
    } catch (err) {
      console.error("[google callback]", err);
      return NextResponse.redirect(`${BASE_URL}/auth?error=google_failed`);
    }
  }

  // Initiate OAuth flow
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${BASE_URL}/api/auth/google?action=callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}