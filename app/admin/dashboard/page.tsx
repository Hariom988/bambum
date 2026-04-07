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
  ArrowRight,
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
      <main className="max-w-5xl mx-auto px-6 py-8">
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

        <div className="bg-[#c8a97e]/10 border rounded-xl border-white/20 overflow-hidden">
          <div className="p-10 ">
            <div className="flex flex-col  md:flex-row items-center gap-8">
              {/* Left: text */}
              <div className="flex-1 text-center md:text-left">
                <h2
                  className="text-xl font-bold text-black mb-2"
                  style={{ fontFamily: "var(--nav-font)" }}
                >
                  Inventory Management
                </h2>
                <p className="text-sm text-[#6b6460] tracking-wide leading-relaxed">
                  Add, edit, and manage your product catalogue.
                </p>
              </div>

              <div className="shrink-0">
                <button
                  onClick={() => router.push("/admin/inventory")}
                  className="group cursor-pointer flex items-center gap-3 px-8 py-4 bg-[#c8a97e] text-white text-xs font-bold tracking-[0.18em] uppercase hover:bg-[#a8845a] transition-colors duration-200"
                >
                  Open Inventory
                  <ArrowRight
                    size={14}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
