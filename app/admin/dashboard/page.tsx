"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingBag,
  Clock,
  LogOut,
  ArrowRight,
  Users,
  ShoppingCart,
} from "lucide-react";

interface Stats {
  totalProducts: number;
  menProducts: number;
  womenProducts: number;
  totalOrders: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    menProducts: 0,
    womenProducts: 0,
    totalOrders: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const isActive = sessionStorage.getItem("admin_session_active");
    if (!isActive) {
      fetch("/api/admin/logout", { method: "POST" }).finally(() => {
        router.replace("/admin/login");
      });
      return;
    }

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

    // Fetch real-time stats
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoadingStats(false);
      })
      .catch(() => setLoadingStats(false));

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
      value: loadingStats ? "—" : String(stats.totalProducts),
      sub: "Active listings",
      accent: false,
    },
    {
      icon: Users,
      label: "Men's Products",
      value: loadingStats ? "—" : String(stats.menProducts),
      sub: "Men's category",
      accent: false,
    },
    {
      icon: ShoppingBag,
      label: "Women's Products",
      value: loadingStats ? "—" : String(stats.womenProducts),
      sub: "Women's category",
      accent: false,
    },
    {
      icon: ShoppingCart,
      label: "Total Orders",
      value: loadingStats ? "—" : String(stats.totalOrders),
      sub: "All time orders",
      accent: true,
    },
  ];
  if (checking) return null;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dash-card {
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .dash-card:nth-child(1) { animation-delay: 0.05s; }
        .dash-card:nth-child(2) { animation-delay: 0.10s; }
        .dash-card:nth-child(3) { animation-delay: 0.15s; }
        .dash-card:nth-child(4) { animation-delay: 0.20s; }

        .stat-val {
          font-family: var(--nav-font);
          font-size: 2rem;
          font-weight: 700;
          color: var(--nav-fg);
          line-height: 1;
        }

        .action-card {
          animation: fadeUp 0.45s 0.25s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .loading-val { animation: pulse 1.2s ease-in-out infinite; }
      `}</style>

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
            <img className="w-22" src="/logo.png" alt="Bambumm" />
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
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {statusCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="dash-card relative overflow-hidden p-6 transition-all duration-200"
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
                    className={`stat-val mb-1 ${loadingStats ? "loading-val" : ""}`}
                  >
                    {card.value}
                  </p>
                  <p
                    className="text-[0.6rem] tracking-wide"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {card.sub}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Inventory */}
            <div
              className="action-card p-8 overflow-hidden"
              style={{
                background: "rgba(200,169,126,0.08)",
                border: "1px solid rgba(200,169,126,0.2)",
              }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      style={{
                        background: "rgba(200,169,126,0.15)",
                        border: "1px solid rgba(200,169,126,0.3)",
                      }}
                    >
                      <Package
                        size={14}
                        style={{ color: "var(--nav-accent)" }}
                      />
                    </div>
                    <h2
                      className="text-base font-bold"
                      style={{
                        fontFamily: "var(--nav-font)",
                        color: "var(--nav-fg)",
                      }}
                    >
                      Inventory Management
                    </h2>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Add, edit, and manage your product catalogue.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/admin/inventory")}
                  className="group flex items-center gap-2.5 px-6 py-3 text-[0.65rem] font-bold tracking-[0.18em] uppercase transition-colors duration-200 shrink-0"
                  style={{
                    background: "var(--nav-accent)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--nav-accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--nav-accent)")
                  }
                >
                  Open Inventory
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>

            {/* Orders */}
            <div
              className="action-card p-8 overflow-hidden"
              style={{
                background: "rgba(200,169,126,0.04)",
                border: "1px solid var(--nav-border)",
              }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      style={{
                        background: "rgba(200,169,126,0.1)",
                        border: "1px solid var(--nav-border)",
                      }}
                    >
                      <ShoppingCart
                        size={14}
                        style={{ color: "var(--nav-accent)" }}
                      />
                    </div>
                    <h2
                      className="text-base font-bold"
                      style={{
                        fontFamily: "var(--nav-font)",
                        color: "var(--nav-fg)",
                      }}
                    >
                      Orders Management
                    </h2>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    View, filter, and manage all customer orders.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/admin/orders")}
                  className="group flex items-center gap-2.5 px-6 py-3 text-[0.65rem] font-bold tracking-[0.18em] uppercase transition-colors duration-200 shrink-0"
                  style={{
                    background: "var(--nav-accent)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--nav-accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--nav-accent)")
                  }
                >
                  Open Orders
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
