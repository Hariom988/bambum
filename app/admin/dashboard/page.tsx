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

  useEffect(() => {
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
  }, []);

  const handleLogout = async () => {
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

  return (
    <div
      className={`min-h-screen bg-[#0a0a0b] text-[#e8e0d0] transition-opacity duration-500 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 h-15 bg-[#0a0a0b]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-7">
        <div className="flex items-center gap-4">
          <span
            className="text-lg font-bold uppercase tracking-widest text-[#e8e0d0]"
            style={{ fontFamily: "var(--nav-font)" }}
          >
            Bambumm
          </span>
          <div className="w-px h-5 bg-white/5" />
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#c8a97e]/10 border border-[#c8a97e]/25 text-[#c8a97e] text-[0.6rem] tracking-[0.18em] uppercase font-semibold">
            <ShieldCheck size={10} />
            Admin
          </div>
        </div>

        <div className="flex items-center gap-4">
          {time && (
            <div className="hidden sm:flex items-center gap-1.5 text-[0.7rem] text-[#6b6460] tracking-wide">
              <Clock size={12} />
              {time}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-white/5 text-[#6b6460] text-[0.65rem] tracking-[0.16em] uppercase hover:border-red-500/40 hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <section className="mb-12">
          <p className="flex items-center gap-2 text-[0.65rem] tracking-[0.22em] uppercase text-[#c8a97e] mb-3">
            <Activity size={10} />
            Control Center
          </p>
          <h1
            className="text-4xl md:text-5xl font-bold text-[#e8e0d0] leading-tight mb-2"
            style={{ fontFamily: "var(--nav-font)" }}
          >
            Welcome back, <span className="italic text-[#c8a97e]">Admin.</span>
          </h1>
          <p className="text-[0.75rem] text-[#6b6460] tracking-wide">{today}</p>
        </section>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-[#c8a97e]/20 via-white/5 to-transparent mb-10" />

        {/* Status cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statusCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-[#111114] border border-white/5 hover:border-[#c8a97e]/25 transition-colors duration-200 p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#c8a97e] opacity-30" />
                <div className="w-9 h-9 flex items-center justify-center bg-[#c8a97e]/10 border border-[#c8a97e]/20 mb-4">
                  <Icon
                    size={16}
                    className="text-[#c8a97e]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-[0.6rem] tracking-[0.18em] uppercase text-[#6b6460] mb-1">
                  {card.label}
                </p>
                <p
                  className="text-2xl font-bold text-[#e8e0d0]"
                  style={{ fontFamily: "var(--nav-font)" }}
                >
                  {card.value}
                </p>
                <p className="text-[0.6rem] text-[#6b6460] mt-1 tracking-wide">
                  {card.sub}
                </p>
              </div>
            );
          })}
        </div>

        {/* Coming soon box */}
        <div className="bg-[#111114] border border-white/5 p-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 flex items-center justify-center bg-[#c8a97e]/10 border border-[#c8a97e]/20">
              <Settings
                size={20}
                className="text-[#c8a97e]"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <h2
            className="text-xl font-bold text-[#e8e0d0] mb-2"
            style={{ fontFamily: "var(--nav-font)" }}
          >
            Inventory Management Coming Soon
          </h2>
          <p className="text-sm text-[#6b6460] tracking-wide leading-relaxed">
            Modules for product management, order tracking,
            <br className="hidden sm:block" />
            and analytics are being built. Stay tuned.
          </p>

          {/* Nav chips */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {navChips.map((chip) => {
              const Icon = chip.icon;
              return (
                <div
                  key={chip.label}
                  className={`flex items-center gap-2 px-4 py-2 border text-[0.65rem] tracking-[0.14em] uppercase transition-colors duration-150 ${
                    chip.active
                      ? "border-[#c8a97e]/30 text-[#c8a97e] bg-[#c8a97e]/10 cursor-pointer"
                      : "border-white/5 text-[#6b6460] bg-[#17171b] cursor-not-allowed"
                  }`}
                >
                  <Icon size={11} />
                  {chip.label}
                  <span
                    className={`text-[0.55rem] px-1.5 py-0.5 tracking-wide ${
                      chip.active
                        ? "bg-[#c8a97e]/15 text-[#c8a97e]"
                        : "bg-white/5 text-[#6b6460]"
                    }`}
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
