"use client";

import React from "react";
import { usePathname } from "next/navigation";
import ProfileSidebar from "./profileSidebar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Dynamically change headers based on the current Next.js route
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

  // Passing top-level profile data down
  const userData = {
    name: "Hariom Sahu",
    email: "hariomsahuu2005@gmail.com",
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] p-4 md:p-10 font-sans text-[#333]">
      <div className="max-w-6xl mx-auto">
        {/* Dynamic Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-[#111827] mb-1">{title}</h1>
          <p className="text-gray-500 text-sm">{subtitle}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* The Exact Design Sidebar */}
          <ProfileSidebar userData={userData} />

          {/* Child Pages (Overview, Orders, etc.) render here */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
