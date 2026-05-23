"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  Loader2,
  AlertCircle,
  Leaf,
  Copy,
  Check,
  User,
  Phone,
  Mail,
  Calendar,
  Hash,
  Truck,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  colorName: string;
  colorHex: string;
  size?: string;
  price: number;
  quantity: number;
}

interface OrderAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface GuestInfo {
  name: string;
  phone: string;
  email?: string;
}

interface OrderPayment {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  method: string;
}

interface Order {
  _id: string;
  orderId: string;
  userId: string | null;
  isGuest: boolean;
  guestInfo: GuestInfo | null;
  items: OrderItem[];
  total: number;
  address: OrderAddress;
  status: string;
  payment: OrderPayment;
  createdAt: string;
}

// ─── Helper: Copy to clipboard ────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 4px",
        color: "var(--nav-fg-muted)",
        display: "inline-flex",
        alignItems: "center",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--nav-accent)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.color = "var(--nav-fg-muted)")
      }
    >
      {copied ? (
        <Check size={12} style={{ color: "#27ae60" }} />
      ) : (
        <Copy size={12} />
      )}
    </button>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  badge,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="os-section overflow-hidden"
      style={
        {
          background: "#fff",
          border: "1px solid var(--nav-border)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          animationDelay: `${delay}ms`,
          "--delay": `${delay}ms`,
        } as React.CSSProperties
      }
    >
      {/* Section header */}
      <div
        className="flex rounded-t-lg items-center gap-3 px-5 py-4 border-b"
        style={{
          borderColor: "var(--nav-border)",
          background: "rgba(25,99,94,0.03)",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "rgba(25,99,94,0.1)",
            border: "1px solid var(--nav-border)",
          }}
        >
          {icon}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <p
            className="text-sm font-bold uppercase tracking-wider"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            {title}
          </p>
          {badge && (
            <span
              className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 shrink-0"
              style={{
                background: "rgba(25,99,94,0.1)",
                border: "1px solid var(--nav-border)",
                color: "var(--nav-accent)",
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  copyValue,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  copyValue?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-3 border-b last:border-0"
      style={{ borderColor: "var(--nav-border)" }}
    >
      <div
        className="flex items-center gap-2 shrink-0"
        style={{ color: "var(--nav-fg-muted)" }}
      >
        {icon && <span className="opacity-70">{icon}</span>}
        <span
          className="text-[10px] font-bold tracking-[0.14em] uppercase"
          style={{ color: "var(--nav-fg-muted)" }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1 text-right">
        <span
          className="text-sm font-semibold"
          style={{
            color: accent ? "var(--nav-accent)" : "var(--nav-fg)",
            fontFamily: accent ? "var(--nav-font)" : "var(--nav-font-ui)",
          }}
        >
          {value}
        </span>
        {copyValue && <CopyButton text={copyValue} />}
      </div>
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    confirmed: {
      label: "Confirmed",
      bg: "rgba(39,174,96,0.1)",
      color: "#1a8c4e",
    },
    processing: {
      label: "Processing",
      bg: "rgba(200,169,126,0.15)",
      color: "#8a6a2a",
    },
    shipped: {
      label: "Shipped",
      bg: "rgba(41,177,168,0.12)",
      color: "#1a7a74",
    },
    delivered: {
      label: "Delivered",
      bg: "rgba(39,174,96,0.1)",
      color: "#1a8c4e",
    },
    cancelled: {
      label: "Cancelled",
      bg: "rgba(217,79,61,0.1)",
      color: "#b03a2e",
    },
  };
  const s = map[status] ?? {
    label: status,
    bg: "rgba(0,0,0,0.05)",
    color: "#666",
  };
  return (
    <span
      className="text-[10px] font-bold tracking-[0.14em] uppercase px-3 py-1"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}22`,
      }}
    >
      {s.label}
    </span>
  );
}

// ─── Main content ─────────────────────────────────────────────────────────────

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [headerVisible, setHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Fetch order details
  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided.");
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          const d = await res.json();
          setError(d.error || "Failed to load order details.");
          return;
        }
        const { order } = await res.json();
        setOrder(order);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Animate header in
  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // ── Format date ──
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ── Estimated delivery ──
  const estimatedDelivery = (iso: string) => {
    const d = new Date(iso);
    d.setDate(d.getDate() + 7);
    const max = new Date(iso);
    max.setDate(max.getDate() + 10);
    return `${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${max.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
  };

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <Loader2
          size={28}
          className="animate-spin"
          style={{ color: "var(--nav-accent)" }}
        />
        <p
          className="text-xs font-bold tracking-[0.2em] uppercase"
          style={{ color: "var(--nav-fg-muted)" }}
        >
          Loading your order…
        </p>
      </div>
    );
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error || !order) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-4"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div
          className="w-16 h-16 flex items-center justify-center"
          style={{
            border: "1px solid rgba(217,79,61,0.3)",
            background: "rgba(217,79,61,0.06)",
          }}
        >
          <AlertCircle size={28} style={{ color: "var(--nav-sale)" }} />
        </div>
        <div className="text-center">
          <p
            className="text-lg font-bold uppercase tracking-widest mb-2"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            Order Not Found
          </p>
          <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
            {error || "We couldn't find this order."}
          </p>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-[0.16em] uppercase"
          style={{
            background: "var(--nav-accent)",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          <ShoppingBag size={13} /> Continue Shopping
        </Link>
      </div>
    );
  }

  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
  const displayName = order.isGuest ? order.guestInfo?.name : null; // logged-in users: shown from their profile

  return (
    <>
      <style>{`
        /* Page-level fade */
        @keyframes osFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .os-section {
          opacity: 0;
          animation: osFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          animation-delay: var(--delay, 0ms);
        }

        /* Success ring pulse */
        @keyframes ringPulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }
       

        /* Check pop */
        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-20deg); }
          70%  { transform: scale(1.18) rotate(4deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        .check-icon { animation: checkPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }

        /* Header slide */
        @keyframes headerSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .os-header {
          opacity: 0;
          animation: headerSlide 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }
        .os-header.visible { opacity: 1; }

        /* Confetti dots (decorative) */
        @keyframes confettiFall {
          0%   { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(60px) rotate(180deg); opacity: 0; }
        }
        .confetti-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: confettiFall 1.2s ease-out forwards;
        }

        /* Sticky summary */
        @media (min-width: 768px) {
          .os-sticky { position: sticky; top: 80px; }
        }

        /* Action buttons */
        .os-btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: var(--nav-accent);
          color: #fff;
          border: none;
          font-family: var(--nav-font-ui);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.18s ease, transform 0.12s ease;
          flex: 1;
        }
        .os-btn-primary:hover {
          background: var(--nav-accent-hover);
          transform: translateY(-1px);
        }

        .os-btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 24px;
          background: transparent;
          color: var(--nav-fg);
          border: 1px solid var(--nav-border);
          font-family: var(--nav-font-ui);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.18s ease, color 0.18s ease, transform 0.12s ease;
          flex: 1;
        }
        .os-btn-secondary:hover {
          border-color: var(--nav-accent);
          color: var(--nav-accent);
          transform: translateY(-1px);
        }

        /* Product row hover */
        .product-row:hover {
          background: rgba(25,99,94,0.02);
        }
      `}</style>

      <main
        style={{
          background: "var(--nav-bg)",
          minHeight: "100vh",
          fontFamily: "var(--nav-font-ui)",
          color: "var(--nav-fg)",
          paddingTop: "80px",
        }}
      >
        {/* Top accent bar */}

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* ── HERO: Success header ─────────────────────────────────────── */}
          <div
            ref={headerRef}
            className={`os-header text-center mb-10 md:mb-14 ${headerVisible ? "visible" : ""}`}
          >
            {/* Label */}
            <p
              className="text-[10px] font-bold tracking-[0.25em] uppercase mb-2"
              style={{ color: "var(--nav-accent)" }}
            >
              Payment Successful
            </p>

            {/* Heading */}
            <h1
              className="text-2xl md:text-4xl font-bold uppercase tracking-widest mb-3"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
            >
              {displayName
                ? `Thank you, ${displayName.split(" ")[0]}!`
                : "Order Confirmed!"}
            </h1>

            <p
              className="text-sm md:text-base max-w-md mx-auto leading-relaxed"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              Your order has been placed and is being prepared. You&apos;ll
              receive updates as it ships.
            </p>

            {/* Order ID chip */}
            <div
              className="inline-flex rounded-lg items-center gap-2 mt-5 px-4 py-2"
              style={{
                background: "rgba(25,99,94,0.07)",
                border: "1px solid var(--nav-border)",
              }}
            >
              <Hash size={12} style={{ color: "var(--nav-accent)" }} />
              <span
                className="text-xs font-bold tracking-[0.14em] uppercase"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Order ID:
              </span>
              <span
                className="text-sm font-bold"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
              >
                {order.orderId}
              </span>
              <CopyButton text={order.orderId} />
            </div>
          </div>

          {/* ── GRID LAYOUT ──────────────────────────────────────────────── */}
          <div className="grid md:grid-cols-[1fr_300px] gap-6">
            {/* ── LEFT: Detail sections ─────────────────────────────────── */}
            <div className="flex flex-col gap-5">
              {/* 1. Order Confirmation */}
              <Section
                icon={
                  <Package size={14} style={{ color: "var(--nav-accent)" }} />
                }
                title="Order Details"
                badge={order.status}
                delay={150}
              >
                <div className="px-5 ">
                  <InfoRow
                    icon={<Hash size={11} />}
                    label="Order ID"
                    value={order.orderId}
                    copyValue={order.orderId}
                    accent
                  />
                  <InfoRow
                    icon={<Calendar size={11} />}
                    label="Placed On"
                    value={formatDate(order.createdAt)}
                  />
                  <InfoRow
                    icon={<Package size={11} />}
                    label="Status"
                    value={<StatusPill status={order.status} />}
                  />
                  <InfoRow
                    icon={<Truck size={11} />}
                    label="Est. Delivery"
                    value={estimatedDelivery(order.createdAt)}
                    accent
                  />
                </div>
              </Section>

              {/* 2. Ordered Products */}
              <Section
                icon={
                  <ShoppingBag
                    size={14}
                    style={{ color: "var(--nav-accent)" }}
                  />
                }
                title="Items Ordered"
                badge={`${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                delay={250}
              >
                <div
                  className="divide-y"
                  style={{ borderColor: "var(--nav-border)" }}
                >
                  {order.items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${item.colorName}-${idx}`}
                      className="product-row flex gap-4 px-5 py-4 transition-colors duration-150"
                    >
                      {/* Image */}
                      <div
                        className="shrink-0 overflow-hidden"
                        style={{
                          width: 64,
                          height: 80,
                          border: "1px solid var(--nav-border)",
                          background: "var(--nav-bg)",
                          position: "relative",
                        }}
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="64px"
                            className="object-cover object-top"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ background: "var(--nav-border)" }}
                          >
                            <Package
                              size={20}
                              style={{
                                color: "var(--nav-fg-muted)",
                                opacity: 0.4,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="block text-sm font-bold uppercase tracking-wide leading-snug hover:underline"
                          style={{
                            fontFamily: "var(--nav-font)",
                            color: "var(--nav-fg)",
                            textDecoration: "none",
                          }}
                        >
                          {item.name}
                        </Link>

                        {/* Variant chips */}
                        <div className="flex items-center flex-wrap gap-2 mt-2">
                          {/* Color */}
                          <div
                            className="flex items-center gap-1.5 px-2 py-0.5"
                            style={{
                              border: "1px solid var(--nav-border)",
                              background: "var(--nav-bg)",
                            }}
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full border"
                              style={{
                                background: item.colorHex,
                                borderColor: "rgba(0,0,0,0.15)",
                              }}
                            />
                            <span
                              className="text-[10px] font-semibold"
                              style={{ color: "var(--nav-fg-muted)" }}
                            >
                              {item.colorName}
                            </span>
                          </div>

                          {/* Size */}
                          {item.size && (
                            <div
                              className="px-2 py-0.5"
                              style={{
                                border: "1px solid var(--nav-border)",
                                background: "var(--nav-bg)",
                              }}
                            >
                              <span
                                className="text-[10px] font-semibold"
                                style={{ color: "var(--nav-fg-muted)" }}
                              >
                                Size: {item.size}
                              </span>
                            </div>
                          )}

                          {/* Qty */}
                          <div
                            className="px-2 py-0.5"
                            style={{
                              border: "1px solid var(--nav-border)",
                              background: "var(--nav-bg)",
                            }}
                          >
                            <span
                              className="text-[10px] font-semibold"
                              style={{ color: "var(--nav-fg-muted)" }}
                            >
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="shrink-0 text-right flex flex-col justify-between">
                        <p
                          className="text-sm font-bold"
                          style={{
                            fontFamily: "var(--nav-font)",
                            color: "var(--nav-fg)",
                          }}
                        >
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: "var(--nav-fg-muted)" }}
                        >
                          ₹{item.price.toLocaleString("en-IN")} ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing footer */}
                <div
                  className="px-5 py-4"
                  style={{
                    background: "rgba(25,99,94,0.03)",
                    borderTop: "1px solid var(--nav-border)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Subtotal
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--nav-fg)" }}
                    >
                      ₹{order.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Delivery Charges
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#1a8c4e" }}
                    >
                      Free
                    </span>
                  </div>
                  <div
                    className="h-px mb-3"
                    style={{ background: "var(--nav-border)" }}
                  />
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-bold uppercase tracking-wide"
                      style={{ fontFamily: "var(--nav-font)" }}
                    >
                      Total Paid
                    </span>
                    <span
                      className="text-xl font-bold"
                      style={{
                        fontFamily: "var(--nav-font)",
                        color: "var(--nav-accent)",
                      }}
                    >
                      ₹{order.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </Section>

              {/* 3. Payment Details */}
              <Section
                icon={
                  <CreditCard
                    size={14}
                    style={{ color: "var(--nav-accent)" }}
                  />
                }
                title="Payment Details"
                delay={350}
              >
                <div className="px-5">
                  <InfoRow
                    icon={<CreditCard size={11} />}
                    label="Method"
                    value="Razorpay"
                  />
                  <InfoRow
                    icon={<Check size={11} />}
                    label="Payment Status"
                    value={
                      <span
                        className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5"
                        style={{
                          background: "rgba(39,174,96,0.1)",
                          color: "#1a8c4e",
                          border: "1px solid rgba(39,174,96,0.2)",
                        }}
                      >
                        ✓ Paid
                      </span>
                    }
                  />
                  <InfoRow
                    icon={<Hash size={11} />}
                    label="Payment ID"
                    value={
                      <span className="font-mono text-xs">
                        {order.payment.razorpay_payment_id}
                      </span>
                    }
                    copyValue={order.payment.razorpay_payment_id}
                  />
                  <InfoRow
                    icon={<Hash size={11} />}
                    label="Transaction Ref"
                    value={
                      <span className="font-mono text-xs">
                        {order.payment.razorpay_order_id}
                      </span>
                    }
                    copyValue={order.payment.razorpay_order_id}
                  />
                  <InfoRow
                    icon={<CreditCard size={11} />}
                    label="Amount Paid"
                    value={`₹${order.total.toLocaleString("en-IN")}`}
                    accent
                  />
                </div>
              </Section>

              {/* 4. Delivery Details */}
              <Section
                icon={
                  <MapPin size={14} style={{ color: "var(--nav-accent)" }} />
                }
                title="Delivery Details"
                delay={450}
              >
                <div className="px-5 py-4 flex flex-col gap-5">
                  {/* Address block */}
                  <div>
                    <p
                      className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Shipping Address
                    </p>
                    <div
                      className="flex gap-3 p-4"
                      style={{
                        background: "rgba(25,99,94,0.04)",
                        border: "1px solid var(--nav-border)",
                      }}
                    >
                      <MapPin
                        size={16}
                        className="shrink-0 mt-0.5"
                        style={{ color: "var(--nav-accent)" }}
                      />
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "var(--nav-fg)" }}
                        >
                          {order.address.line1}
                        </p>
                        {order.address.line2 && (
                          <p
                            className="text-sm"
                            style={{ color: "var(--nav-fg-muted)" }}
                          >
                            {order.address.line2}
                          </p>
                        )}
                        <p
                          className="text-sm"
                          style={{ color: "var(--nav-fg-muted)" }}
                        >
                          {order.address.city}, {order.address.state} –{" "}
                          {order.address.pincode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contact info (for guests: from guestInfo; for users: not available server-side here) */}
                  {order.isGuest && order.guestInfo && (
                    <div>
                      <p
                        className="text-[10px] font-bold tracking-[0.14em] uppercase mb-3"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        Contact Information
                      </p>
                      <div className="flex flex-col gap-0">
                        {order.guestInfo.name && (
                          <InfoRow
                            icon={<User size={11} />}
                            label="Name"
                            value={order.guestInfo.name}
                          />
                        )}
                        {order.guestInfo.phone && (
                          <InfoRow
                            icon={<Phone size={11} />}
                            label="Phone"
                            value={order.guestInfo.phone}
                          />
                        )}
                        {order.guestInfo.email && (
                          <InfoRow
                            icon={<Mail size={11} />}
                            label="Email"
                            value={order.guestInfo.email}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            </div>

            {/* ── RIGHT: Sticky summary + actions ───────────────────────── */}
            <div className="flex flex-col gap-5">
              <div
                className="os-sticky flex flex-col gap-5"
                style={{ "--delay": "200ms" } as React.CSSProperties}
              >
                {/* Quick Summary card */}
                <div
                  className="os-section overflow-hidden"
                  style={
                    {
                      background: "#fff",
                      border: "1px solid var(--nav-border)",
                      boxShadow: "0 4px 20px rgba(25,99,94,0.08)",
                      "--delay": "200ms",
                    } as React.CSSProperties
                  }
                >
                  <div className="p-5">
                    <p
                      className="text-xs font-bold uppercase tracking-widest mb-4"
                      style={{ color: "var(--nav-fg)" }}
                    >
                      Order Summary
                    </p>

                    {/* Mini item list */}
                    <div className="flex flex-col gap-3 mb-4">
                      {order.items.map((item, idx) => (
                        <div
                          key={`sum-${item.productId}-${idx}`}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="shrink-0 overflow-hidden"
                            style={{
                              width: 36,
                              height: 46,
                              border: "1px solid var(--nav-border)",
                              position: "relative",
                              background: "var(--nav-bg)",
                            }}
                          >
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="36px"
                                className="object-cover object-top"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-xs font-semibold uppercase leading-snug line-clamp-1"
                              style={{ color: "var(--nav-fg)" }}
                            >
                              {item.name}
                            </p>
                            <p
                              className="text-[10px] mt-0.5"
                              style={{ color: "var(--nav-fg-muted)" }}
                            >
                              {item.colorName}
                              {item.size ? ` · ${item.size}` : ""} · ×
                              {item.quantity}
                            </p>
                          </div>
                          <span
                            className="text-xs font-bold shrink-0"
                            style={{ color: "var(--nav-fg)" }}
                          >
                            ₹
                            {(item.price * item.quantity).toLocaleString(
                              "en-IN",
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      className="h-px mb-3"
                      style={{ background: "var(--nav-border)" }}
                    />

                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-xs"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        Delivery
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: "#1a8c4e" }}
                      >
                        Free
                      </span>
                    </div>

                    <div
                      className="h-px my-3"
                      style={{ background: "var(--nav-border)" }}
                    />

                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm font-bold uppercase tracking-wide"
                        style={{ fontFamily: "var(--nav-font)" }}
                      >
                        Total
                      </span>
                      <span
                        className="text-lg font-bold"
                        style={{
                          fontFamily: "var(--nav-font)",
                          color: "var(--nav-accent)",
                        }}
                      >
                        ₹{order.total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div
                    className="px-5 pb-4 flex items-center justify-center gap-4"
                    style={{ borderTop: "1px solid var(--nav-border)" }}
                  >
                    <div className="flex items-center gap-1.5 pt-4">
                      <Leaf size={11} style={{ color: "var(--nav-accent)" }} />
                      <span
                        className="text-[9px] font-semibold uppercase tracking-wide"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        Eco-Friendly
                      </span>
                    </div>
                    <div
                      className="w-px h-3 pt-4"
                      style={{ background: "var(--nav-border)" }}
                    />
                    <div className="flex items-center gap-1.5 pt-4">
                      <CheckCircle2
                        size={11}
                        style={{ color: "var(--nav-accent)" }}
                      />
                      <span
                        className="text-[9px] font-semibold uppercase tracking-wide"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        Quality Assured
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className="os-section flex flex-col gap-3 p-4"
                  style={
                    {
                      background: "#fff",
                      border: "1px solid var(--nav-border)",
                      "--delay": "300ms",
                    } as React.CSSProperties
                  }
                >
                  <p
                    className="text-[10px] font-bold tracking-[0.16em] uppercase mb-1"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    What&apos;s Next?
                  </p>

                  {/* View Orders */}
                  <Link href="/profile/orders" className="os-btn-primary">
                    <Package size={13} />
                    View My Orders
                    <ArrowRight size={12} />
                  </Link>

                  {/* Continue Shopping */}
                  <Link href="/products" className="os-btn-secondary">
                    <ShoppingBag size={13} />
                    Continue Shopping
                  </Link>
                </div>

                {/* Guest account prompt */}
                {order.isGuest && (
                  <div
                    className="os-section p-4"
                    style={
                      {
                        background: "rgba(25,99,94,0.04)",
                        border: "1px solid var(--nav-border)",
                        "--delay": "400ms",
                      } as React.CSSProperties
                    }
                  >
                    <div className="flex items-start gap-3">
                      <User
                        size={16}
                        className="shrink-0 mt-0.5"
                        style={{ color: "var(--nav-accent)" }}
                      />
                      <div>
                        <p
                          className="text-xs font-bold uppercase tracking-wide mb-1"
                          style={{ color: "var(--nav-fg)" }}
                        >
                          Save your details
                        </p>
                        <p
                          className="text-xs leading-relaxed mb-3"
                          style={{ color: "var(--nav-fg-muted)" }}
                        >
                          Create an account to track this order and save time on
                          future purchases.
                        </p>
                        <Link
                          href="/auth?tab=register"
                          className="text-[11px] font-bold tracking-wider uppercase underline underline-offset-2"
                          style={{ color: "var(--nav-accent)" }}
                        >
                          Create Account →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom CTA band ───────────────────────────────────────────── */}
          <div
            className="mt-10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{
              background: "rgba(25,99,94,0.06)",
              border: "1px solid var(--nav-border)",
            }}
          >
            <div className="flex items-center gap-3">
              <Leaf size={20} style={{ color: "var(--nav-accent)" }} />
              <div>
                <p
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  Thank you for choosing Bambumm
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Your purchase supports sustainable, eco-friendly fashion.
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="os-btn-secondary shrink-0"
              style={{ flex: "none", paddingLeft: 20, paddingRight: 20 }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

// ─── Page export (wrapped in Suspense for useSearchParams) ────────────────────

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--nav-bg)" }}
        >
          <Loader2
            size={28}
            className="animate-spin"
            style={{ color: "var(--nav-accent)" }}
          />
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
