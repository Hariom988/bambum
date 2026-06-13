"use client";

import React, { useEffect, useState } from "react";
import { Phone, Mail } from "lucide-react";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import { useWishlist } from "@/context/wishlistContext";

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
}

interface Stats {
  orders: number;
  spent: number;
  wishlistItems: number;
}

export default function ProfileOverview() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<Stats>({
    orders: 0,
    spent: 0,
    wishlistItems: 0,
  });
  const { totalItems: wishlistItems } = useWishlist();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setProfile(d.user);
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));

    fetch("/api/user/orders")
      .then((r) => r.json())
      .then((d) => {
        const orders = d.orders ?? [];
        const spent = orders.reduce(
          (sum: number, o: { total: number }) => sum + (o.total || 0),
          0,
        );
        setStats((prev) => ({ ...prev, orders: orders.length, spent }));
      })
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  // Split name into first/last
  const nameParts = (profile?.name ?? user?.name ?? "").trim().split(" ");
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || "—";

  const displayEmail = profile?.email ?? user?.email ?? "—";
  const displayPhone = profile?.phone ?? "Not added yet";

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: "var(--brand-teal)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Info Card */}
      <div
        className="p-6 md:p-8 rounded-xl relative"
        style={{ background: "#fff", border: "1px solid var(--nav-border)" }}
      >
        <Link
          href="/profile/settings"
          className="absolute top-6 right-6 flex items-center gap-2 text-sm font-bold uppercase transition-opacity hover:opacity-70"
          style={{ color: "var(--brand-teal)" }}
        >
          Edit
        </Link>
        <h3
          className="text-xl mb-6"
          style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
        >
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div>
            <p
              className="text-xs uppercase font-bold mb-1"
              style={{ color: "var(--nav-fg-muted)", opacity: 0.6 }}
            >
              First Name
            </p>
            <p className="font-medium" style={{ color: "var(--nav-fg)" }}>
              {firstName}
            </p>
          </div>
          <div>
            <p
              className="text-xs uppercase font-bold mb-1"
              style={{ color: "var(--nav-fg-muted)", opacity: 0.6 }}
            >
              Last Name
            </p>
            <p className="font-medium" style={{ color: "var(--nav-fg)" }}>
              {lastName}
            </p>
          </div>
          <div>
            <p
              className="text-xs uppercase font-bold mb-1"
              style={{ color: "var(--nav-fg-muted)", opacity: 0.6 }}
            >
              Email
            </p>
            <p
              className="font-medium flex items-center gap-2"
              style={{ color: "var(--nav-fg)" }}
            >
              <Mail
                size={16}
                style={{ color: "var(--nav-fg-muted)", opacity: 0.5 }}
              />
              {displayEmail}
            </p>
          </div>
          <div>
            <p
              className="text-xs uppercase font-bold mb-1"
              style={{ color: "var(--nav-fg-muted)", opacity: 0.6 }}
            >
              Phone
            </p>
            <p
              className="font-medium flex items-center gap-2"
              style={{ color: "var(--nav-fg)" }}
            >
              <Phone
                size={16}
                style={{ color: "var(--nav-fg-muted)", opacity: 0.5 }}
              />
              {displayPhone}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: loadingStats ? "—" : stats.orders },
          {
            label: "Total Spent",
            value: loadingStats
              ? "—"
              : `₹${stats.spent.toLocaleString("en-IN")}`,
          },
          {
            label: "Wishlist Items",
            value: loadingStats ? "—" : stats.wishlistItems,
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-6 rounded-xl flex flex-col items-center justify-center text-center"
            style={{
              background: "#fff",
              border: "1px solid var(--nav-border)",
            }}
          >
            <h4
              className="text-3xl mb-2"
              style={{
                fontFamily: "var(--nav-font)",
                color: "var(--brand-teal)",
              }}
            >
              {value}
            </h4>
            <p
              className="text-xs font-bold uppercase"
              style={{ color: "var(--nav-fg-muted)", opacity: 0.6 }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
