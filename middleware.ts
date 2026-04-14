import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── ADMIN ROUTES ──────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
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

    const token = req.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.role !== "admin") throw new Error("Not admin");

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
      response.cookies.set("admin_token", refreshed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
      return response;
    } catch {
      const response = NextResponse.redirect(new URL("/admin/login", req.url));
      response.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
      return response;
    }
  }

  // ── USER AUTH ROUTES ──────────────────────────────────────────────────────
  // Redirect logged-in users away from /auth page
  if (pathname === "/auth") {
    const token = req.cookies.get("user_token")?.value;
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL("/", req.url));
      } catch {
        // Invalid token, let them through to /auth
      }
    }
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth"],
};