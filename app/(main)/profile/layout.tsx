"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import ProfileSidebar from "./profileSidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--nav-bg)" }}
      >
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--nav-border)",
            borderTopColor: "var(--nav-accent)",
          }}
        />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--nav-bg)", fontFamily: "var(--nav-font-ui)" }}
    >
      {/* Top accent */}
      <div
        className="h-0.5 w-full"
        style={{ background: "var(--nav-accent)" }}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Page header */}
        <div className="mb-8">
          <p
            className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-1"
            style={{ color: "var(--nav-accent)" }}
          >
            My Account
          </p>
          <h1
            className="text-2xl md:text-3xl font-bold uppercase tracking-widest"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            {user.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div
              className="h-px w-8"
              style={{ background: "var(--nav-border)" }}
            />
            <div
              className="w-1 h-1 rounded-full"
              style={{ background: "var(--nav-accent)" }}
            />
            <div
              className="h-px w-8"
              style={{ background: "var(--nav-border)" }}
            />
          </div>
        </div>

        {/* Main layout: sidebar + content */}
        <div className="flex flex-col md:flex-row gap-6 pb-24 md:pb-0">
          {/* Desktop sidebar */}
          <aside className="hidden md:block shrink-0" style={{ width: 220 }}>
            <ProfileSidebar />
          </aside>

          {/* Content area */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <ProfileSidebar mobile />
    </div>
  );
}
