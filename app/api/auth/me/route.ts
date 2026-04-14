import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("user_token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    return NextResponse.json({
      user: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        provider: payload.provider,
        picture: payload.picture ?? null,
      },
    });
  } catch {
    // Token expired or invalid
    const response = NextResponse.json({ user: null });
    response.cookies.set("user_token", "", { maxAge: 0, path: "/" });
    return response;
  }
}