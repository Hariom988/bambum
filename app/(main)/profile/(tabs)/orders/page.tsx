"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
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
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  address: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
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
    color: "var(--nav-accent)",
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
    color: "var(--nav-sale)",
    bg: "rgba(217,79,61,0.06)",
    border: "rgba(217,79,61,0.2)",
    icon: XCircle,
  },
};

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.status];
  const StatusIcon = status.icon;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="overflow-hidden transition-all duration-200"
      style={{
        background: "#fff",
        border: "1px solid var(--nav-border)",
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* Status bar */}
      <div className="h-0.5" style={{ background: status.color }} />

      {/* Order summary row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* First product image */}
        <div
          className="w-14 h-16 shrink-0 overflow-hidden"
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
                size={16}
                style={{ color: "var(--nav-accent)", opacity: 0.4 }}
              />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <p
              className="text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              #{order.orderId}
            </p>
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
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            {date}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <p
            className="text-sm font-bold"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            ₹{order.total.toLocaleString("en-IN")}
          </p>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase transition-colors duration-150"
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

      {/* Expanded details */}
      {expanded && (
        <div className="border-t" style={{ borderColor: "var(--nav-border)" }}>
          {/* All items */}
          <div className="px-5 py-4 flex flex-col gap-3">
            <p
              className="text-[10px] font-bold tracking-[0.14em] uppercase"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              Order Items
            </p>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div
                  className="w-10 h-12 shrink-0 overflow-hidden"
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
                  <div className="flex items-center gap-2 mt-0.5">
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
          </div>

          {/* Delivery address + total */}
          <div
            className="px-5 py-4 border-t flex flex-col sm:flex-row sm:items-start gap-4"
            style={{
              borderColor: "var(--nav-border)",
              background: "rgba(200,169,126,0.03)",
            }}
          >
            <div className="flex-1">
              <p
                className="text-[10px] font-bold tracking-[0.14em] uppercase mb-1"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Delivery Address
              </p>
              <p
                className="text-xs font-bold"
                style={{ color: "var(--nav-fg)" }}
              >
                {order.address.fullName}
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                {order.address.line1}, {order.address.city},{" "}
                {order.address.state} – {order.address.pincode}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className="text-[10px] font-bold tracking-[0.14em] uppercase mb-1"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Order Total
              </p>
              <p
                className="text-base font-bold"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-accent)",
                }}
              >
                ₹{order.total.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");

  useEffect(() => {
    fetch("/api/user/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const FILTERS: Array<"all" | Order["status"]> = [
    "all",
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4 overflow-hidden"
        style={{
          background: "#fff",
          border: "1px solid var(--nav-border)",
          boxShadow: "0 2px 16px rgba(200,169,126,0.06)",
        }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{
            background: "rgba(200,169,126,0.12)",
            border: "1px solid var(--nav-border)",
          }}
        >
          <ShoppingBag size={14} style={{ color: "var(--nav-accent)" }} />
        </div>
        <div className="flex-1">
          <p
            className="text-[10px] font-bold tracking-[0.16em] uppercase"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            Purchase History
          </p>
          <p
            className="text-sm font-bold"
            style={{ color: "var(--nav-fg)", fontFamily: "var(--nav-font)" }}
          >
            My Orders
          </p>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-1"
          style={{
            background: "rgba(200,169,126,0.12)",
            border: "1px solid rgba(200,169,126,0.3)",
            color: "var(--nav-accent)",
          }}
        >
          {orders.length} Total
        </span>
      </div>

      {/* Filter pills */}
      {orders.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const count =
              f === "all"
                ? orders.length
                : orders.filter((o) => o.status === f).length;
            if (f !== "all" && count === 0) return null;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-150"
                style={{
                  background: filter === f ? "var(--nav-accent)" : "#fff",
                  color: filter === f ? "#fff" : "var(--nav-fg-muted)",
                  border: `1px solid ${filter === f ? "var(--nav-accent)" : "var(--nav-border)"}`,
                  cursor: "pointer",
                }}
              >
                {f === "all" ? "All" : f} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      )}

      {/* Orders list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: "var(--nav-accent)" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center"
          style={{ background: "#fff", border: "1px solid var(--nav-border)" }}
        >
          <div
            className="w-14 h-14 flex items-center justify-center mb-4"
            style={{
              background: "rgba(200,169,126,0.1)",
              border: "1px solid var(--nav-border)",
            }}
          >
            <ShoppingBag
              size={22}
              style={{ color: "var(--nav-accent)", opacity: 0.6 }}
            />
          </div>
          <p
            className="text-base font-bold uppercase tracking-widest mb-2"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </p>
          <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
            {filter === "all"
              ? "Your order history will appear here."
              : "Try a different filter."}
          </p>
          {filter === "all" && (
            <a
              href="/products"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 text-[11px] font-bold tracking-[0.14em] uppercase"
              style={{
                background: "var(--nav-accent)",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              Shop Now
            </a>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
