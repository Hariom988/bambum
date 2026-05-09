"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, Heart, Settings, LogOut } from "lucide-react";
import { useAuth, AuthUser } from "@/context/authContext";

export default function ProfileSidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const navItems = [
    { name: "OVERVIEW", icon: User, href: "/profile" },
    { name: "MY ORDERS", icon: Package, href: "/profile/orders" },
    { name: "WISHLIST", icon: Heart, href: "/profile/" },
    { name: "SETTINGS", icon: Settings, href: "/profile/settings" },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Split name for display
  const nameParts = user.name?.trim().split(" ") ?? [];
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : (user.name?.[0] ?? "U").toUpperCase();

  return (
    <aside
      className="w-full md:w-[280px] flex-shrink-0 overflow-hidden h-fit rounded-xl"
      style={{ background: "#fff", border: "1px solid var(--nav-border)" }}
    >
      {/* Green Header Block */}
      <div
        className="p-6 flex flex-col items-center justify-center"
        style={{ background: "var(--brand-teal)" }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-3 text-xl font-bold"
          style={{
            background: "rgba(255,255,255,0.2)",
            color: "#fff",
            fontFamily: "var(--nav-font)",
          }}
        >
          {initials}
        </div>
        <h2 className="font-medium text-lg text-center leading-tight text-white">
          {user.name}
        </h2>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>
          {user.email}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/profile"
              ? pathname === "/profile"
              : pathname.startsWith(item.href);

          return (
            <Link href={item.href} key={item.name}>
              <div
                className="flex items-center w-full gap-3 px-4 py-3 text-sm font-bold uppercase rounded-lg transition-colors"
                style={{
                  background: isActive ? "rgba(25,99,94,0.08)" : "transparent",
                  color: isActive ? "var(--brand-teal)" : "#6b7280",
                }}
              >
                <Icon size={18} />
                {item.name}
              </div>
            </Link>
          );
        })}

        {/* Logout */}
        <div
          className="pt-3 mt-2"
          style={{ borderTop: "1px solid var(--nav-border)" }}
        >
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-3 text-sm font-bold rounded-lg uppercase transition-colors"
            style={{ color: "var(--nav-sale)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(217,79,61,0.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
