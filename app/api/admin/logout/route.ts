import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Clear the session cookie
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0, // immediately expire
  });
  return response;
}