"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Users,
  ShoppingCart,
  Clock3,
  MessageSquare,
  Star,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Stats {
  totalProducts: number;
  menProducts: number;
  womenProducts: number;
  totalOrders: number;
}

interface StatConfig {
  key: keyof Stats;
  label: string;
  sub: string;
  icon: LucideIcon;
  iconBgVar: string;
  iconColorVar: string;
  trendVar: string;
  trendUp: boolean;
}

const STAT_CONFIG: StatConfig[] = [
  {
    key: "totalProducts",
    label: "Total Products",
    sub: "Active listings",
    icon: Package,
    iconBgVar: "var(--adm-bg-accent-lt)",
    iconColorVar: "var(--adm-accent)",
    trendVar: "var(--adm-accent)",
    trendUp: true,
  },
  {
    key: "menProducts",
    label: "Men's Products",
    sub: "Men's category",
    icon: Users,
    iconBgVar: "var(--adm-bg-accent-lt)",
    iconColorVar: "var(--adm-accent)",
    trendVar: "var(--adm-accent)",
    trendUp: true,
  },
  {
    key: "womenProducts",
    label: "Women's Products",
    sub: "Women's category",
    icon: ShoppingCart,
    iconBgVar: "var(--adm-bg-danger-lt)",
    iconColorVar: "var(--adm-danger)",
    trendVar: "var(--adm-danger)",
    trendUp: false,
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    sub: "All time orders",
    icon: Clock3,
    iconBgVar: "var(--adm-bg-accent-md)",
    iconColorVar: "var(--adm-accent)",
    trendVar: "var(--adm-accent)",
    trendUp: true,
  },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    menProducts: 0,
    womenProducts: 0,
    totalOrders: 0,
  });

  useEffect(() => {
    const isActive = sessionStorage.getItem("admin_session_active");
    if (!isActive) {
      fetch("/api/admin/logout", { method: "POST" }).finally(() =>
        router.replace("/admin/login"),
      );
      return;
    }
    setChecking(false);
    setMounted(true);

    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoadingStats(false);
      })
      .catch(() => setLoadingStats(false));
  }, [router]);

  if (checking) return null;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-fade { animation: fadeUp 0.42s cubic-bezier(0.22,1,0.36,1) both; }
        .dash-fade:nth-child(1) { animation-delay: 0.04s; }
        .dash-fade:nth-child(2) { animation-delay: 0.09s; }
        .dash-fade:nth-child(3) { animation-delay: 0.14s; }
        .dash-fade:nth-child(4) { animation-delay: 0.19s; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .stat-shimmer {
          background: linear-gradient(
            90deg,
            var(--adm-fg-faint) 25%,
            var(--adm-border) 50%,
            var(--adm-fg-faint) 75%
          );
          background-size: 200% auto;
          animation: shimmer 1.4s linear infinite;
          border-radius: 2px;
        }

        .stat-card:hover {
          border-color: var(--adm-accent-border) !important;
        }
        .quick-link-card:hover {
          border-color: var(--adm-accent-border) !important;
          background: var(--adm-bg-soft) !important;
          box-shadow: var(--adm-shadow-card) !important;
        }
        .quick-link-card:hover .ql-arrow {
          transform: translateX(4px);
        }
      `}</style>

      <div
        className={`transition-opacity duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}
        style={{ fontFamily: "var(--nav-font-ui)", color: "var(--adm-fg)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* ── PAGE HEADING ── */}
          <div className="mb-8">
            <h1
              className="text-[1.6rem] font-bold tracking-tight"
              style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
            >
              Dashboard
            </h1>
            <p
              className="text-[0.8125rem] mt-1"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {STAT_CONFIG.map((cfg) => {
              const Icon = cfg.icon;
              const value = stats[cfg.key];
              return (
                <div
                  key={cfg.key}
                  className="stat-card dash-fade rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{
                    background: "var(--adm-bg-white)",
                    border: "1px solid var(--adm-border-soft)",
                    boxShadow: "var(--adm-shadow-card)",
                  }}
                >
                  {/* Icon badge */}
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-3.5"
                    style={{ background: cfg.iconBgVar }}
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.7}
                      style={{ color: cfg.iconColorVar }}
                    />
                  </div>

                  {/* Label */}
                  <p
                    className="text-[0.625rem] font-bold tracking-[0.14em] uppercase mb-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    {cfg.label}
                  </p>

                  {/* Value or shimmer */}
                  {loadingStats ? (
                    <div className="stat-shimmer h-8 w-3/5 mb-2" />
                  ) : (
                    <p
                      className="text-[2rem] font-bold leading-none tracking-tight mb-2"
                      style={{
                        fontFamily: "var(--nav-font)",
                        color: "var(--adm-fg)",
                      }}
                    >
                      {value.toLocaleString("en-IN")}
                    </p>
                  )}

                  {/* Sub label */}
                  <p
                    className="text-[0.6rem] tracking-wide"
                    style={{ color: "var(--adm-fg-faint)" }}
                  >
                    {cfg.sub}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── QUICK ACTIONS ── */}
          <p
            className="text-[0.65rem] font-bold tracking-[0.16em] uppercase mb-4"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            Quick Actions
          </p>

          <div className="flex flex-col gap-3">
            {[
              {
                label: "Product Management",
                sub: "Add, edit, and manage your product catalogue.",
                href: "/admin/inventory",
                icon: Package,
              },
              {
                label: "Orders Management",
                sub: "View, filter, and manage all customer orders.",
                href: "/admin/orders",
                icon: ShoppingCart,
              },
              {
                label: "FAQs Management",
                sub: "View, filter, and manage all FAQs.",
                href: "/admin/faq",
                icon: MessageSquare,
              },
              {
                label: "Testimonial Management",
                sub: "View, filter, and manage all Testimonials.",
                href: "/admin/testimonials",
                icon: Star,
              },
            ].map(({ label, sub, href, icon: Icon }) => (
              <div
                key={label}
                className="quick-link-card flex items-center justify-between gap-4 rounded px-6 py-5 cursor-pointer transition-all duration-200"
                style={{
                  background: "var(--adm-bg-white)",
                  border: "1px solid var(--adm-border-soft)",
                }}
                onClick={() => router.push(href)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-[38px] h-[38px] rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--adm-bg-accent-lt)" }}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.7}
                      style={{ color: "var(--adm-accent)" }}
                    />
                  </div>
                  <div>
                    <p
                      className="text-[0.875rem] font-semibold mb-0.5"
                      style={{ color: "var(--adm-fg)" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[0.75rem]"
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      {sub}
                    </p>
                  </div>
                </div>
                <span
                  className="ql-arrow text-lg flex-shrink-0 transition-transform duration-200"
                  style={{ color: "var(--adm-accent)" }}
                >
                  →
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
