"use client";

import { usePathname, useRouter } from "next/navigation";
import { User, MapPin, ShoppingBag, LogOut } from "lucide-react";
import { useAuth } from "@/context/authContext";

const NAV_ITEMS = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Addresses", href: "/profile/addresses", icon: MapPin },
  { label: "Orders", href: "/profile/orders", icon: ShoppingBag },
];

export default function ProfileSidebar({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (mobile) {
    return (
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{
          height: 60,
          background: "#fff",
          borderTop: "1px solid var(--nav-border)",
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-transparent border-none cursor-pointer transition-all duration-150 border-t-2"
              style={{
                color: isActive ? "var(--nav-accent)" : "var(--nav-fg-muted)",
                borderColor: isActive ? "var(--nav-accent)" : "transparent",
                fontFamily: "var(--nav-font-ui)",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-transparent border-none cursor-pointer transition-all duration-150 border-t-2"
          style={{
            color: "var(--nav-fg-muted)",
            borderColor: "transparent",
            fontFamily: "var(--nav-font-ui)",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </nav>
    );
  }

  return (
    <div
      className="sticky top-20 flex flex-col overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid var(--nav-border)",
        boxShadow: "0 2px 16px rgba(200,169,126,0.06)",
      }}
    >
      {/* Gold top bar */}
      <div className="h-0.5" style={{ background: "var(--nav-accent)" }} />

      <nav className="flex flex-col py-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex items-center gap-3 px-5 py-3 text-left w-full transition-all duration-150 border-r-2 border-transparent"
              style={{
                background: isActive ? "rgba(200,169,126,0.08)" : "transparent",
                color: isActive ? "var(--nav-fg)" : "var(--nav-fg-muted)",
                borderRightColor: isActive
                  ? "var(--nav-accent)"
                  : "transparent",
                fontFamily: "var(--nav-font-ui)",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.04em",
                cursor: "pointer",
                border: "none",
                borderRight: `2px solid ${isActive ? "var(--nav-accent)" : "transparent"}`,
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(200,169,126,0.05)";
                  e.currentTarget.style.color = "var(--nav-fg)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--nav-fg-muted)";
                }
              }}
            >
              <Icon
                size={14}
                style={{
                  color: isActive ? "var(--nav-accent)" : "var(--nav-fg-muted)",
                  flexShrink: 0,
                }}
              />
              {label}
            </button>
          );
        })}

        {/* Divider */}
        <div
          className="h-px mx-4 my-2"
          style={{ background: "var(--nav-border)" }}
        />

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-5 py-3 text-left w-full transition-all duration-150"
          style={{
            background: "transparent",
            color: "var(--nav-fg-muted)",
            fontFamily: "var(--nav-font-ui)",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.04em",
            cursor: "pointer",
            border: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(217,79,61,0.05)";
            e.currentTarget.style.color = "var(--nav-sale)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--nav-fg-muted)";
          }}
        >
          <LogOut size={14} style={{ flexShrink: 0 }} />
          Sign Out
        </button>
      </nav>
    </div>
  );
}
