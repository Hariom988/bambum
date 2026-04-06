"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  Clock,
  Activity,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Tab-close session check: sessionStorage is wiped on tab close
    const isActive = sessionStorage.getItem("admin_session_active");
    if (!isActive) {
      // New tab opened — kill the cookie and go back to login
      fetch("/api/admin/logout", { method: "POST" }).finally(() => {
        router.replace("/admin/login");
      });
      return; // don't render the page
    }

    // Session is valid — render the page
    setChecking(false);
    setMounted(true);

    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = async () => {
    sessionStorage.removeItem("admin_session_active");
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusCards = [
    {
      icon: Package,
      label: "Total Products",
      value: "1",
      sub: "Active listings",
    },
    { icon: Users, label: "Admin Users", value: "1", sub: "Connected" },
    {
      icon: Activity,
      label: "Session",
      value: "Active",
      sub: "Clears on tab close",
    },
    {
      icon: LayoutDashboard,
      label: "System",
      value: "Online",
      sub: "All services running",
    },
  ];

  const navChips = [
    { icon: LayoutDashboard, label: "Dashboard", badge: "Live", active: true },
    { icon: Package, label: "Products", badge: "Soon", active: false },
    { icon: Users, label: "Users", badge: "Soon", active: false },
    { icon: Settings, label: "Settings", badge: "Soon", active: false },
  ];

  // Don't render anything while checking session or redirecting
  if (checking) return null;

  return (
    <div
      className={`min-h-screen transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
      style={{
        background: "var(--nav-bg)",
        color: "var(--nav-fg)",
        fontFamily: "var(--nav-font-ui)",
      }}
    >
      {/* TOP BAR */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-7"
        style={{
          height: "var(--nav-height)",
          background: "#fff",
          borderBottom: "1px solid var(--nav-border)",
          boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center gap-4">
          <span
            className="text-lg font-bold uppercase tracking-widest"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            <img className="w-22" src="/logo.png" alt="" />
          </span>
        </div>

        <div className="flex items-center gap-4">
          {time && (
            <div
              className="hidden sm:flex items-center gap-1.5 text-[0.7rem] tracking-wide"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              <Clock size={12} />
              {time}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 text-[0.65rem] tracking-[0.16em] uppercase transition-all duration-200"
            style={{
              border: "1px solid var(--nav-border)",
              color: "var(--nav-fg-muted)",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(217,79,61,0.4)";
              e.currentTarget.style.color = "var(--nav-sale)";
              e.currentTarget.style.background = "rgba(217,79,61,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--nav-border)";
              e.currentTarget.style.color = "var(--nav-fg-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <section className="mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-2"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            Welcome back, <em style={{ color: "var(--nav-accent)" }}>Admin.</em>
          </h1>
          <p
            className="text-[0.75rem] tracking-wide"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            {today}
          </p>
        </section>

        <div
          className="h-px mb-10"
          style={{
            background:
              "linear-gradient(90deg, var(--nav-accent) 0%, var(--nav-border) 60%, transparent 100%)",
            opacity: 0.5,
          }}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="relative overflow-hidden p-6 transition-all duration-200"
                style={{
                  background: "#fff",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = "var(--nav-accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = "var(--nav-border)")
                }
              >
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: "var(--nav-accent)", opacity: 0.4 }}
                />
                <div
                  className="w-9 h-9 flex items-center justify-center mb-4"
                  style={{
                    background: "rgba(200,169,126,0.1)",
                    border: "1px solid var(--nav-border)",
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: "var(--nav-accent)" }}
                    strokeWidth={1.5}
                  />
                </div>
                <p
                  className="text-[0.6rem] tracking-[0.18em] uppercase mb-1"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  {card.label}
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  {card.value}
                </p>
                <p
                  className="text-[0.6rem] tracking-wide mt-1"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  {card.sub}
                </p>
              </div>
            );
          })}
        </div>

        <div
          className="p-10 text-center"
          style={{
            background: "#fff",
            border: "1px solid var(--nav-border)",
            boxShadow: "0 2px 16px rgba(200,169,126,0.08)",
          }}
        >
          <div className="flex justify-center mb-5">
            <div
              className="w-12 h-12 flex items-center justify-center"
              style={{
                background: "rgba(200,169,126,0.1)",
                border: "1px solid var(--nav-border)",
              }}
            >
              <Settings
                size={20}
                style={{ color: "var(--nav-accent)" }}
                strokeWidth={1.5}
              />
            </div>
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            Inventory Management Coming Soon
          </h2>
          <p
            className="text-sm tracking-wide leading-relaxed"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            Modules for product management, order tracking,
            <br className="hidden sm:block" />
            and analytics are being built. Stay tuned.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {navChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <div
                  key={chip.label}
                  className={`flex items-center gap-2 px-4 py-2 text-[0.65rem] tracking-[0.14em] uppercase ${
                    chip.active ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                  style={{
                    border: chip.active
                      ? "1px solid var(--nav-accent)"
                      : "1px solid var(--nav-border)",
                    color: chip.active
                      ? "var(--nav-accent)"
                      : "var(--nav-fg-muted)",
                    background: chip.active
                      ? "rgba(200,169,126,0.08)"
                      : "transparent",
                  }}
                >
                  <Icon size={11} />
                  {chip.label}
                  <span
                    className="text-[0.55rem] px-1.5 py-0.5 tracking-wide"
                    style={{
                      background: chip.active
                        ? "rgba(200,169,126,0.15)"
                        : "rgba(0,0,0,0.05)",
                      color: chip.active
                        ? "var(--nav-accent)"
                        : "var(--nav-fg-muted)",
                    }}
                  >
                    {chip.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
