"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  ShoppingCart,
  Settings,
  LogOut,
  Clock,
  Tag,
  Navigation,
} from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import logo from "@/public/logo.png";

const NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin/dashboard",
    active: true,
  },
  { icon: Package, label: "Product", href: "/admin/inventory", active: true },
  { icon: TrendingUp, label: "Income", href: null, active: false },
  { icon: ShoppingCart, label: "Orders", href: "/admin/orders", active: true },
  { icon: Tag, label: "Categories", href: "/admin/categories", active: true },
  {
    icon: Navigation,
    label: "Nav Config",
    href: "/admin/navconfig",
    active: true,
  },
  { icon: Settings, label: "Settings", href: null, active: false },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    sessionStorage.removeItem("admin_session_active");
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const handleNav = (href: string | null) => {
    if (href) router.push(href);
  };

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--adm-bg)" }}>
      {/* ── SIDEBAR (desktop) ── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-50 z-40"
        style={{ background: "var(--brand-teal)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center px-5  shrink-0"
          style={{
            height: "var(--nav-height)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span
            className="md:flex hidden text-lg font-bold tracking-widest uppercase flex-1"
            style={{ fontFamily: "var(--nav-font)", color: "white" }}
          >
            BAMBUMM
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col pt-3 flex-1 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, href, active }) => {
            const isCurrent = href ? pathname.startsWith(href) : false;
            return (
              <div
                key={label}
                onClick={() => active && handleNav(href)}
                className={[
                  "flex items-center gap-3 px-5 py-3 text-[0.8125rem] font-medium tracking-wide my-px transition-colors duration-150",
                  isCurrent
                    ? "bg-white/12 text-white border-l-[3px] border-white/80"
                    : "border-l-[3px] border-transparent text-white/65 hover:bg-white/8 hover:text-white",
                  !active ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                ].join(" ")}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{label}</span>
                {!active && (
                  <span className="ml-auto text-[0.5rem] tracking-widest uppercase bg-white/12 text-white/50 px-1.5 py-0.5 rounded-sm">
                    Soon
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Admin user pill */}
        <div
          className="flex items-center gap-2.5 px-5 py-4 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold tracking-wide flex-shrink-0"
            style={{ background: "var(--brand-teal-dark)" }}
          >
            AU
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.75rem] font-semibold text-white leading-tight">
              Admin User
            </p>
            <p className="text-[0.6rem] text-white/50 tracking-wide mt-0.5 truncate">
              admin@bambumm.com
            </p>
          </div>
        </div>
      </aside>

      {/* ── TOP HEADER ── */}
      <header
        className="fixed top-0 right-0 z-30 flex items-center gap-4 px-7 md:left-[200px] left-0"
        style={{
          height: "var(--nav-height)",
          background: "var(--adm-bg-white)",
          borderBottom: "1px solid var(--adm-border)",
          boxShadow: "var(--adm-shadow-card)",
        }}
      >
        {/* Mobile logo */}
        <span
          className="md:hidden text-lg font-bold tracking-widest uppercase flex-1"
          style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
        >
          BAMBUMM
        </span>

        <div className="flex items-center gap-4 ml-auto">
          {mounted && (
            <div
              className="hidden sm:flex items-center gap-1.5 text-[0.7rem] tracking-wide"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              <Clock size={12} />
              {time}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[0.65rem] font-semibold tracking-[0.14em] uppercase cursor-pointer transition-all duration-200"
            style={{
              border: "1px solid var(--adm-border)",
              color: "var(--adm-fg-muted)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(217,79,61,0.4)";
              e.currentTarget.style.color = "var(--nav-sale)";
              e.currentTarget.style.background = "rgba(217,79,61,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-border)";
              e.currentTarget.style.color = "var(--adm-fg-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div
        className="flex-1 md:ml-[200px] min-h-screen pb-[60px] md:pb-0"
        style={{ paddingTop: "var(--nav-height)", background: "var(--adm-bg)" }}
      >
        {children}
      </div>

      {/* ── BOTTOM TAB BAR (mobile) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex z-50 overflow-x-auto"
        style={{
          height: 60,
          background: "var(--brand-teal)",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {NAV_ITEMS.filter((item) => item.active).map(
          ({ icon: Icon, label, href }) => {
            const isCurrent = href ? pathname.startsWith(href) : false;
            return (
              <button
                key={label}
                onClick={() => handleNav(href)}
                className={[
                  "flex-1 flex flex-col items-center justify-center gap-[3px] text-[0.5rem] font-semibold tracking-widest uppercase border-none transition-colors duration-150 min-w-[52px]",
                  isCurrent ? "text-white" : "text-white/55",
                ].join(" ")}
                style={{ background: "none", padding: 0 }}
              >
                <Icon size={16} strokeWidth={isCurrent ? 2.2 : 1.6} />
                {label}
              </button>
            );
          },
        )}
      </nav>
    </div>
  );
}
