"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import ProfileSidebar from "./profileSidebar";
import { useAuth } from "@/context/authContext";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--brand-background-page)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: "var(--brand-teal)",
              borderTopColor: "transparent",
            }}
          />
          <p
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  let title = "My Account";
  let subtitle = "Manage your profile and orders";

  if (pathname.includes("/orders")) {
    title = "My Orders";
    subtitle = "Track and manage your orders";
  } else if (pathname.includes("/wishlist")) {
    title = "My Wishlist";
    subtitle = "Your favorites, just a click away";
  } else if (pathname.includes("/settings")) {
    title = "Settings";
    subtitle = "Manage your preferences";
  } else if (pathname.includes("/addresses")) {
    title = "My Addresses";
    subtitle = "Manage your shipping locations";
  }

  return (
    <div
      className="min-h-screen p-4 md:p-10 font-sans"
      style={{
        background: "var(--brand-background-page)",
        color: "var(--nav-fg)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-4xl mb-1"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            {title}
          </h1>
          <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
            {subtitle}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <ProfileSidebar user={user} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
