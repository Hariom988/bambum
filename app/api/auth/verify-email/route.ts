import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth?error=invalid-token", req.url));
  }

  await connectDB();

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpiry: { $gt: new Date() },
  }).select("+verificationToken +verificationTokenExpiry");

  if (!user) {
    return NextResponse.redirect(new URL("/auth?error=token-expired", req.url));
  }

  user.isEmailVerified = true;
  user.emailVerified = new Date();
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  return NextResponse.redirect(new URL("/auth?verified=1", req.url));
}