import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only run on /admin/* paths
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow the login page through
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    // If already logged in → redirect to dashboard
    const token = req.cookies.get("admin_token")?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } catch {
        // Token invalid/expired → stay on login
      }
    }
    return NextResponse.next();
  }

  // All other /admin/* paths require a valid token
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Ensure it's actually an admin token
    if (payload.role !== "admin") {
      throw new Error("Not admin");
    }

    // Token valid — refresh it (sliding session: reset 30-min window on each request)
    const { SignJWT } = await import("jose");
    const refreshed = await new SignJWT({
      sub: payload.sub,
      username: payload.username,
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30m")
      .sign(JWT_SECRET);

    const response = NextResponse.next();
    // Session cookie (no maxAge) → still clears on browser close
    response.cookies.set("admin_token", refreshed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      // No maxAge → session cookie
    });
    return response;
  } catch {
    // Expired or invalid → kick to login
    const response = NextResponse.redirect(new URL("/admin/login", req.url));
    response.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};