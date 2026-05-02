"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  LogOut,
  Search,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  X,
  MapPin,
  CreditCard,
  User,
  Calendar,
} from "lucide-react";

interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  colorName: string;
  colorHex: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  address: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  isGuest?: boolean;
  guestInfo?: {
    name: string;
    phone: string;
    email?: string;
  };
  payment?: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    method: string;
  };
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  Order["status"],
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: typeof Package;
  }
> = {
  pending: {
    label: "Pending",
    color: "#e67e22",
    bg: "rgba(230,126,34,0.08)",
    border: "rgba(230,126,34,0.25)",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "#c8a97e",
    bg: "rgba(200,169,126,0.1)",
    border: "rgba(200,169,126,0.3)",
    icon: CheckCircle,
  },
  shipped: {
    label: "Shipped",
    color: "#2980b9",
    bg: "rgba(41,128,185,0.08)",
    border: "rgba(41,128,185,0.25)",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "#27ae60",
    bg: "rgba(39,174,96,0.08)",
    border: "rgba(39,174,96,0.25)",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "#d94f3d",
    bg: "rgba(217,79,61,0.06)",
    border: "rgba(217,79,61,0.2)",
    icon: XCircle,
  },
};

const ALL_STATUSES = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

function OrderCard({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: Order["status"]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const status = STATUS_CONFIG[order.status];
  const StatusIcon = status.icon;

  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = new Date(order.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleStatusChange = async (newStatus: Order["status"]) => {
    setUpdating(true);
    await onStatusChange(order._id, newStatus);
    setUpdating(false);
  };

  return (
    <div
      className="overflow-hidden transition-all duration-200"
      style={{
        background: "#fff",
        border: "1px solid var(--nav-border)",
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Status top bar */}
      <div className="h-0.5" style={{ background: status.color }} />

      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-4 flex-wrap">
        {/* Order ID + Status */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-12 h-14 shrink-0 overflow-hidden"
            style={{
              border: "1px solid var(--nav-border)",
              background: "var(--nav-bg)",
            }}
          >
            {order.items[0]?.image ? (
              <img
                src={order.items[0].image}
                alt={order.items[0].name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package
                  size={14}
                  style={{ color: "var(--nav-accent)", opacity: 0.4 }}
                />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span
                className="text-[10px] font-bold tracking-[0.12em] uppercase"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                #{order.orderId}
              </span>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase"
                style={{
                  background: status.bg,
                  border: `1px solid ${status.border}`,
                  color: status.color,
                }}
              >
                <StatusIcon size={9} strokeWidth={2.5} />
                {status.label}
              </span>
            </div>
            <p
              className="text-sm font-bold truncate"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
            >
              {order.items[0]?.name}
              {order.items.length > 1 ? ` +${order.items.length - 1} more` : ""}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Calendar size={10} style={{ color: "var(--nav-fg-muted)" }} />
              <p
                className="text-[10px]"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                {date} · {time}
              </p>
            </div>
          </div>
        </div>
        {order.isGuest && (
          <div
            className="flex items-center justify-between p-2.5"
            style={{
              background: "rgba(200,169,126,0.05)",
              border: "1px solid var(--nav-border)",
            }}
          >
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              Order Type
            </span>
            <span
              className="text-[10px] font-bold"
              style={{ color: "var(--nav-accent)" }}
            >
              Guest
            </span>
          </div>
        )}
        {order.isGuest && order.guestInfo?.email && (
          <div
            className="flex items-center justify-between p-2.5"
            style={{
              background: "rgba(200,169,126,0.05)",
              border: "1px solid var(--nav-border)",
            }}
          >
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              Guest Email
            </span>
            <span
              className="text-[10px] font-mono"
              style={{ color: "var(--nav-fg)" }}
            >
              {order.guestInfo.email}
            </span>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p
              className="text-sm font-bold"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
            >
              ₹{order.total.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px]" style={{ color: "var(--nav-fg-muted)" }}>
              {order.items.reduce((s, i) => s + i.quantity, 0)} items
            </p>
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <select
              value={order.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as Order["status"])
              }
              disabled={updating}
              className="appearance-none text-[10px] font-bold tracking-widest uppercase px-3 py-2 pr-10 outline-none cursor-pointer transition-all duration-150"
              style={{
                background: status.bg,
                border: `1px solid ${status.border}`,
                color: status.color,
                fontFamily: "var(--nav-font-ui)",
              }}
            >
              {(Object.keys(STATUS_CONFIG) as Order["status"][]).map((s) => (
                <option
                  key={s}
                  value={s}
                  style={{ background: "#fff", color: "#1a1a1a" }}
                >
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              {updating ? (
                <Loader2
                  size={10}
                  className="animate-spin"
                  style={{ color: status.color }}
                />
              ) : (
                <ChevronDown size={10} style={{ color: status.color }} />
              )}
            </div>
          </div>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase transition-all"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--nav-accent)",
            }}
          >
            {expanded ? "Less" : "Details"}
            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t" style={{ borderColor: "var(--nav-border)" }}>
          <div
            className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x"
            style={{ borderColor: "var(--nav-border)" }}
          >
            {/* Order Items */}
            <div className="px-5 py-4">
              <p
                className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3 flex items-center gap-1.5"
                style={{ color: "var(--nav-accent)" }}
              >
                <Package size={10} /> Order Items
              </p>
              <div className="flex flex-col gap-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-11 shrink-0 overflow-hidden"
                      style={{
                        border: "1px solid var(--nav-border)",
                        background: "var(--nav-bg)",
                      }}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-bold truncate"
                        style={{ color: "var(--nav-fg)" }}
                      >
                        {item.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full border shrink-0"
                          style={{
                            background: item.colorHex,
                            borderColor: "var(--nav-border)",
                          }}
                        />
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--nav-fg-muted)" }}
                        >
                          {item.colorName} · Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <p
                      className="text-xs font-bold shrink-0"
                      style={{ color: "var(--nav-fg)" }}
                    >
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
                <div
                  className="flex items-center justify-between pt-2 mt-1 border-t"
                  style={{ borderColor: "var(--nav-border)" }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{
                      fontFamily: "var(--nav-font)",
                      color: "var(--nav-accent)",
                    }}
                  >
                    ₹{order.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="px-5 py-4">
              <p
                className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3 flex items-center gap-1.5"
                style={{ color: "var(--nav-accent)" }}
              >
                <MapPin size={10} /> Delivery Address
              </p>
              <div
                className="p-3"
                style={{
                  background: "rgba(200,169,126,0.05)",
                  border: "1px solid var(--nav-border)",
                }}
              >
                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--nav-fg)" }}
                >
                  {order.address.fullName}
                </p>
                {order.address.phone && (
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {order.address.phone}
                  </p>
                )}
                <p
                  className="text-[10px] mt-1 leading-relaxed"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  {order.address.line1}
                  {order.address.line2 ? `, ${order.address.line2}` : ""}
                  <br />
                  {order.address.city}, {order.address.state} –{" "}
                  {order.address.pincode}
                </p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="px-5 py-4">
              <p
                className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3 flex items-center gap-1.5"
                style={{ color: "var(--nav-accent)" }}
              >
                <CreditCard size={10} /> Payment Info
              </p>
              <div className="flex flex-col gap-2">
                {order.payment?.razorpay_order_id && (
                  <div
                    className="p-2.5"
                    style={{
                      background: "rgba(200,169,126,0.05)",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    <p
                      className="text-[9px] font-bold tracking-widest uppercase mb-1"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Razorpay Order ID
                    </p>
                    <p
                      className="text-[10px] font-mono break-all"
                      style={{ color: "var(--nav-fg)" }}
                    >
                      {order.payment.razorpay_order_id}
                    </p>
                  </div>
                )}
                {order.payment?.razorpay_payment_id && (
                  <div
                    className="p-2.5"
                    style={{
                      background: "rgba(200,169,126,0.05)",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    <p
                      className="text-[9px] font-bold tracking-widest uppercase mb-1"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Payment ID
                    </p>
                    <p
                      className="text-[10px] font-mono break-all"
                      style={{ color: "var(--nav-fg)" }}
                    >
                      {order.payment.razorpay_payment_id}
                    </p>
                  </div>
                )}
                <div
                  className="flex items-center justify-between p-2.5"
                  style={{
                    background: "rgba(39,174,96,0.06)",
                    border: "1px solid rgba(39,174,96,0.2)",
                  }}
                >
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: "#27ae60" }}
                  >
                    Payment Status
                  </span>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: "#27ae60" }}
                  >
                    ✓ Paid
                  </span>
                </div>
                {order.payment?.method && (
                  <div
                    className="flex items-center justify-between p-2.5"
                    style={{
                      background: "rgba(200,169,126,0.05)",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    <span
                      className="text-[10px] font-bold tracking-widest uppercase"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Method
                    </span>
                    <span
                      className="text-[10px] font-bold capitalize"
                      style={{ color: "var(--nav-fg)" }}
                    >
                      {order.payment.method}
                    </span>
                  </div>
                )}
                <div
                  className="flex items-center justify-between p-2.5"
                  style={{
                    background: "rgba(200,169,126,0.05)",
                    border: "1px solid var(--nav-border)",
                  }}
                >
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    User ID
                  </span>
                  <span
                    className="text-[10px] font-mono"
                    style={{
                      color: "var(--nav-fg)",
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {order.userId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clock
  useEffect(() => {
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
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [searchQuery]);

  const fetchOrders = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (debouncedSearch) params.set("search", debouncedSearch);
        const res = await fetch(`/api/admin/orders?${params}`);
        if (res.ok) {
          const d = await res.json();
          setOrders(d.orders || []);
        }
      } catch {}
      setLoading(false);
      setRefreshing(false);
    },
    [statusFilter, debouncedSearch],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id: string, newStatus: Order["status"]) => {
    try {
      await fetch(`/api/admin/orders?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o)),
      );
    } catch {}
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const statusCounts = ALL_STATUSES.reduce(
    (acc, s) => {
      if (s === "all") acc[s] = orders.length;
      else acc[s] = orders.filter((o) => o.status === s).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <>
      <style>{`
        @keyframes admOrderIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .order-row {
          animation: admOrderIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }
        .order-row:nth-child(1) { animation-delay: 0.03s; }
        .order-row:nth-child(2) { animation-delay: 0.07s; }
        .order-row:nth-child(3) { animation-delay: 0.11s; }
        .order-row:nth-child(n+4) { animation-delay: 0.15s; }

        .status-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 5px 12px;
          border: 1px solid var(--nav-border);
          background: #fff;
          color: var(--nav-fg-muted);
          font-family: var(--nav-font-ui);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .status-pill:hover { border-color: var(--nav-accent); color: var(--nav-accent); }
        .status-pill[data-active="true"] {
          background: var(--nav-accent);
          border-color: var(--nav-accent);
          color: #fff;
        }

        .search-bar-adm {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid var(--nav-border);
          padding: 8px 12px;
          transition: border-color 0.15s;
        }
        .search-bar-adm:focus-within { border-color: var(--nav-accent); }
        .search-bar-adm input {
          background: transparent;
          border: none;
          outline: none;
          font-size: 13px;
          color: var(--nav-fg);
          font-family: var(--nav-font-ui);
          width: 200px;
        }
        .search-bar-adm input::placeholder { color: var(--nav-fg-muted); opacity: 0.7; }
      `}</style>

      <div
        className="min-h-screen font-serif"
        style={{ background: "var(--adm-bg)", color: "var(--adm-fg)" }}
      >
        {/* Header */}
        <header
          className="sticky top-0 z-50 flex items-center justify-between px-5"
          style={{
            height: 60,
            background: "var(--adm-bg-white)",
            borderBottom: "1px solid var(--adm-border)",
            boxShadow: "var(--adm-shadow-nav)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-1.5 px-2.5 py-1.5 font-sans text-[11px] font-bold tracking-widest uppercase transition-all"
              style={{
                border: "1px solid var(--adm-border)",
                background: "transparent",
                color: "var(--adm-fg-muted)",
                cursor: "pointer",
              }}
              onClick={() => router.push("/admin/dashboard")}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--adm-accent)";
                e.currentTarget.style.color = "var(--adm-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--adm-border)";
                e.currentTarget.style.color = "var(--adm-fg-muted)";
              }}
            >
              <ChevronLeft size={13} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div
              className="w-px h-5"
              style={{ background: "var(--adm-border)" }}
            />
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 font-sans text-[10px] font-bold tracking-[0.14em] uppercase"
              style={{
                background: "var(--adm-bg-active)",
                border: "1px solid var(--adm-accent-border)",
                color: "var(--adm-accent)",
              }}
            >
              Orders
            </div>
          </div>
          <div className="flex items-center gap-4">
            {time && (
              <span
                className="hidden sm:block font-sans text-[11px] tracking-[0.04em]"
                style={{ color: "var(--adm-fg-muted)" }}
              >
                {time}
              </span>
            )}
            <button
              className="font-sans text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 px-3 py-1.5"
              style={{
                border: "1px solid var(--adm-border)",
                background: "transparent",
                color: "var(--adm-fg-muted)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--adm-danger-border)";
                e.currentTarget.style.color = "var(--adm-danger)";
                e.currentTarget.style.background = "var(--adm-bg-danger-lt)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--adm-border)";
                e.currentTarget.style.color = "var(--adm-fg-muted)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogOut size={11} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Body */}
        <main className=" mx-auto px-4 md:px-6 py-6">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p
                className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
                style={{ color: "var(--adm-accent)" }}
              >
                Bambumm Admin
              </p>
              <h1
                className="text-[22px] font-bold"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--adm-fg)",
                }}
              >
                Orders Management
              </h1>
              <p
                className="font-sans text-[12px] mt-0.5"
                style={{ color: "var(--adm-fg-muted)" }}
              >
                {orders.length} order{orders.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="search-bar-adm">
                <Search
                  size={13}
                  style={{ color: "var(--adm-fg-muted)", flexShrink: 0 }}
                />
                <input
                  type="text"
                  placeholder="Search by order ID or name…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--adm-fg-muted)",
                    }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Refresh */}
              <button
                onClick={() => fetchOrders(true)}
                disabled={refreshing}
                className="flex items-center justify-center p-2 transition-all"
                style={{
                  border: "1px solid var(--adm-border)",
                  background: "#fff",
                  cursor: "pointer",
                  color: "var(--adm-fg-muted)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--adm-accent)";
                  e.currentTarget.style.color = "var(--adm-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--adm-border)";
                  e.currentTarget.style.color = "var(--adm-fg-muted)";
                }}
              >
                <RefreshCw
                  size={14}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <SlidersHorizontal
              size={13}
              style={{ color: "var(--adm-fg-muted)" }}
            />
            {ALL_STATUSES.map((s) => {
              const count = statusCounts[s] || 0;
              const cfg =
                s !== "all" ? STATUS_CONFIG[s as Order["status"]] : null;
              return (
                <button
                  key={s}
                  className="status-pill"
                  data-active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                >
                  {cfg && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: statusFilter === s ? "#fff" : cfg.color,
                      }}
                    />
                  )}
                  {s === "all" ? "All" : cfg?.label}
                  <span
                    className="ml-0.5 font-sans text-[9px] font-black"
                    style={{ opacity: 0.8 }}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Orders list */}
          {loading ? (
            <div
              className="flex items-center justify-center gap-2.5 py-20 font-sans text-[13px]"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              <Loader2 size={18} className="animate-spin" /> Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 px-5 text-center"
              style={{
                background: "#fff",
                border: "1px solid var(--adm-border)",
              }}
            >
              <div
                className="w-14 h-14 flex items-center justify-center mb-4"
                style={{
                  background: "var(--adm-bg-accent-lt)",
                  border: "1px solid var(--adm-accent-border)",
                }}
              >
                <Package size={22} style={{ color: "var(--adm-accent)" }} />
              </div>
              <p
                className="text-[16px] font-bold mb-2"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--adm-fg)",
                }}
              >
                No orders found
              </p>
              <p
                className="font-sans text-[13px]"
                style={{ color: "var(--adm-fg-muted)" }}
              >
                {searchQuery
                  ? `No orders matching "${searchQuery}"`
                  : statusFilter !== "all"
                    ? `No ${statusFilter} orders`
                    : "Orders will appear here once customers start purchasing."}
              </p>
              {(searchQuery || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 font-sans text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 transition-colors"
                  style={{
                    background: "var(--adm-accent)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <div key={order._id} className="order-row">
                  <OrderCard
                    order={order}
                    onStatusChange={handleStatusChange}
                  />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
