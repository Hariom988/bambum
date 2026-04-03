"use client";

import {
  Truck,
  Package,
  MapPin,
  Bell,
  AlertCircle,
  Home,
  Clock,
} from "lucide-react";

const SHIPPING_TIMES = [
  { zone: "Metro Cities", time: "2-4" },
  { zone: "Other Locations", time: "3-7" },
];

const POLICY_CARDS = [
  {
    icon: Package,
    title: "Order Processing",
    body: "All orders are processed within 1-2 business days after confirmation. Orders placed on weekends or public holidays will be processed on the next working day.",
    tag: "1-2 business days",
  },
  {
    icon: Bell,
    title: "Order Tracking",
    body: "Once your order is shipped, you will receive a tracking link via email or SMS so you can follow your package every step of the way.",
    tag: "Email & SMS",
  },
  {
    icon: AlertCircle,
    title: "Delivery Issues",
    body: "If your order is delayed, lost, or marked as delivered but not received, please contact us within 48 hours and we'll resolve it promptly.",
    tag: "Report within 48h",
  },
  {
    icon: Home,
    title: "Incorrect Address",
    body: "Customers are responsible for providing accurate shipping details. Once an order is shipped, it cannot be cancelled or modified.",
    tag: "Verify before ordering",
  },
];

export default function ShippingPolicyPage() {
  return (
    <main
      className="min-h-screen"
      style={{
        background: "var(--nav-bg)",
        color: "var(--nav-fg)",
        fontFamily: "var(--nav-font-ui)",
      }}
    >
      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden border-b"
        style={{ borderColor: "var(--nav-border)" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.75"
          style={{ background: "var(--nav-accent)" }}
        />

        {/* Diagonal stripe texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -55deg,
              transparent,
              transparent 28px,
              rgba(200,169,126,0.045) 28px,
              rgba(200,169,126,0.045) 29px
            )`,
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            {/* Left: title block */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-semibold tracking-[0.14em] uppercase"
                style={{
                  background: "rgba(200,169,126,0.12)",
                  border: "1px solid var(--nav-border)",
                  color: "var(--nav-accent)",
                }}
              >
                <Truck size={12} strokeWidth={2.5} />
                Delivery Information
              </div>

              <h1
                className="text-5xl md:text-7xl font-bold uppercase leading-[0.95] tracking-tight mb-5"
                style={{ fontFamily: "var(--nav-font)" }}
              >
                Shipping
                <br />
                <span
                  style={{
                    WebkitTextStroke: "1.5px var(--nav-accent)",
                    color: "transparent",
                  }}
                >
                  Policy
                </span>
              </h1>

              <p
                className="text-sm md:text-base leading-relaxed max-w-md"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                At <strong style={{ color: "var(--nav-fg)" }}>Bambum,</strong>{" "}
                we aim to deliver your orders quickly, safely, and efficiently.
              </p>
            </div>

            {/* Right: delivery time visual */}
            <div className="flex gap-4 shrink-0">
              {SHIPPING_TIMES.map((z) => (
                <div
                  key={z.zone}
                  className="flex flex-col items-center justify-center text-center p-6 min-w-30"
                  style={{
                    background: "#fff",
                    border: "1px solid var(--nav-border)",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
                  }}
                >
                  <p
                    className="text-3xl font-bold leading-none mb-1"
                    style={{
                      fontFamily: "var(--nav-font)",
                      color: "var(--nav-accent)",
                    }}
                  >
                    {z.time}
                  </p>
                  <p
                    className="text-[0.6rem] tracking-widest uppercase mt-1"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    days
                  </p>
                  <div
                    className="h-px w-8 my-2"
                    style={{ background: "var(--nav-border)" }}
                  />
                  <p
                    className="text-[0.7rem] tracking-wide font-medium"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    {z.zone}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SHIPPING CHARGES BANNER ── */}
      <div
        className="border-b"
        style={{
          borderColor: "var(--nav-border)",
          background: "rgba(200,169,126,0.08)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock size={16} style={{ color: "var(--nav-accent)" }} />
            <p className="text-sm" style={{ color: "var(--nav-fg)" }}>
              <strong>Shipping Charges:</strong>{" "}
              <span style={{ color: "var(--nav-fg-muted)" }}>
                Charges, if applicable, are displayed at checkout. Free shipping
                may be available on selected orders or promotions.
              </span>
            </p>
          </div>
          <span
            className="text-[0.7rem] font-bold tracking-[0.12em] uppercase px-3 py-1"
            style={{
              background: "rgba(200,169,126,0.15)",
              border: "1px solid var(--nav-border)",
              color: "var(--nav-accent)",
            }}
          >
            Free Shipping on Offers
          </span>
        </div>
      </div>

      {/* ── POLICY CARDS ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <p
          className="text-xs font-bold tracking-[0.18em] uppercase mb-10"
          style={{ color: "var(--nav-accent)" }}
        >
          Policy Details
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {POLICY_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="relative flex flex-col gap-4 p-7"
                style={{
                  background: "#fff",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 1px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Tag */}
                <span
                  className="absolute top-5 right-5 text-[0.6rem] font-bold tracking-widest uppercase px-2 py-1"
                  style={{
                    background: "rgba(200,169,126,0.1)",
                    color: "var(--nav-accent)",
                    border: "1px solid rgba(200,169,126,0.2)",
                  }}
                >
                  {card.tag}
                </span>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(200,169,126,0.1)",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    <Icon
                      size={17}
                      style={{ color: "var(--nav-accent)" }}
                      strokeWidth={1.75}
                    />
                  </div>
                  <h2
                    className="text-sm font-bold uppercase tracking-widest"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    {card.title}
                  </h2>
                </div>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  {card.body}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── BOTTOM STRIP ── */}
      <section
        className="border-t"
        style={{
          borderColor: "var(--nav-border)",
          background: "rgba(200,169,126,0.06)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-[0.12em] mb-1"
              style={{ color: "var(--nav-fg)" }}
            >
              Didn&apos;t receive your order?
            </h3>
            <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
              Contact us within 48 hours and we&apos;ll make it right.
            </p>
          </div>
          <a
            href="mailto:support@bambum.in"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors duration-200 shrink-0"
            style={{ background: "var(--nav-accent)", color: "#fff" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--nav-accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--nav-accent)")
            }
          >
            Contact Us
          </a>
        </div>
      </section>
    </main>
  );
}
