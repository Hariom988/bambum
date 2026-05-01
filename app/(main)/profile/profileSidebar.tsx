"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, Heart, Settings, LogOut } from "lucide-react";

export default function ProfileSidebar({
  userData,
}: {
  userData: { name: string; email: string };
}) {
  const pathname = usePathname();

  // Define actual Next.js routes here
  const navItems = [
    { name: "OVERVIEW", icon: User, href: "/profile" },
    { name: "MY ORDERS", icon: Package, href: "/profile/orders" },
    { name: "WISHLIST", icon: Heart, href: "/profile/wishlist" },
    { name: "SETTINGS", icon: Settings, href: "/profile/settings" },
  ];

  return (
    <aside className="w-full md:w-[280px] flex-shrink-0 bg-white rounded-xl shadow-sm overflow-hidden h-fit">
      {/* Green Header Block */}
      <div className="bg-[#1A5E54] text-white p-6 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="font-medium text-lg text-center leading-tight">
          {userData.name}
        </h2>
        <p className="text-xs text-white/80 mt-1">{userData.email}</p>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Exact match for overview to prevent it staying active on sub-routes
          const isActive =
            item.href === "/profile"
              ? pathname === "/profile"
              : pathname.includes(item.href);

          return (
            <Link href={item.href} key={item.name}>
              <div
                className={`flex items-center w-full gap-3 px-4 py-3 text-sm font-bold uppercase rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#EBEFEF] text-[#1A5E54]"
                    : "text-gray-500 hover:bg-gray-50 hover:text-[#1A5E54]"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </div>
            </Link>
          );
        })}

        {/* Logout Button */}
        <div className="pt-4 mt-2 border-t border-gray-100">
          <button className="flex items-center w-full gap-3 px-4 py-3 text-sm font-bold text-[#FF5A5F] hover:bg-red-50 rounded-lg transition-colors uppercase">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
