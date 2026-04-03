"use client";

import { XCircle, Headphones, CreditCard, ShieldAlert } from "lucide-react";

const STEPS = [
  {
    icon: XCircle,
    number: "01",
    title: "Before Shipment Only",
    body: "Orders can only be cancelled before they are shipped. Once dispatched, cancellation is not possible.",
  },
  {
    icon: Headphones,
    number: "02",
    title: "Request a Cancellation",
    body: "To request a cancellation, please contact our support team with your order details.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Refund Timeline",
    body: "If approved, refunds will be processed within 5-7 working days to your original payment method.",
  },
  {
    icon: ShieldAlert,
    number: "04",
    title: "Our Right to Cancel",
    body: "Bambum reserves the right to cancel any order due to stock issues, payment failures, or operational constraints.",
  },
];

export default function CancellationPolicyPage() {
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

        {/* Large centered number backdrop */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span
            className="font-bold leading-none"
            style={{
              fontFamily: "var(--nav-font)",
              fontSize: "clamp(12rem, 38vw, 32rem)",
              color: "transparent",
              WebkitTextStroke: "1px rgba(200,169,126,0.08)",
              letterSpacing: "-0.04em",
            }}
          >
            ×
          </span>
        </div>

        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-32 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 text-xs font-semibold tracking-[0.14em] uppercase"
            style={{
              background: "rgba(200,169,126,0.12)",
              border: "1px solid var(--nav-border)",
              color: "var(--nav-accent)",
            }}
          >
            <XCircle size={12} strokeWidth={2.5} />
            Order Cancellations
          </div>

          <h1
            className="text-3xl md:text-7xl font-bold uppercase tracking-widest leading-[1.05] mb-6"
            style={{ fontFamily: "var(--nav-font)" }}
          >
            Cancellation
            <br />
            <span
              className="text-2xl md:text-5xl font-normal tracking-[0.3em]"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              POLICY
            </span>
          </h1>

          <div className="flex items-center justify-center gap-4 mb-8">
            <div
              className="h-px w-16"
              style={{ background: "var(--nav-border)" }}
            />
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--nav-accent)" }}
            />
            <div
              className="h-px w-16"
              style={{ background: "var(--nav-border)" }}
            />
          </div>

          {/* Key rule callout */}
          <div
            className="inline-block px-6 py-4 text-sm md:text-base font-medium leading-relaxed"
            style={{
              background: "#fff",
              border: "1px solid var(--nav-border)",
              boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
              color: "var(--nav-fg-muted)",
              maxWidth: "36rem",
            }}
          >
            Orders can only be cancelled{" "}
            <strong style={{ color: "var(--nav-fg)" }}>
              before they are shipped.
            </strong>{" "}
            Once dispatched, cancellation is not possible.
          </div>
        </div>
      </section>

      {/* ── VERTICAL TIMELINE ── */}
      <section className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        <p
          className="text-xs font-bold tracking-[0.18em] uppercase mb-12 text-center"
          style={{ color: "var(--nav-accent)" }}
        >
          What You Need to Know
        </p>

        <div className="relative flex flex-col gap-0">
          {/* Vertical line */}
          <div
            className="absolute left-[1.35rem] top-4 bottom-4 w-px"
            style={{ background: "var(--nav-border)" }}
            aria-hidden="true"
          />

          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === STEPS.length - 1;
            return (
              <div
                key={step.number}
                className={`relative flex gap-6 ${isLast ? "" : "pb-10"}`}
              >
                {/* Node */}
                <div
                  className="relative z-10 shrink-0 w-11 h-11 flex items-center justify-center"
                  style={{
                    background: "var(--nav-bg)",
                    border: "1px solid var(--nav-border)",
                  }}
                >
                  <Icon
                    size={17}
                    style={{ color: "var(--nav-accent)" }}
                    strokeWidth={1.75}
                  />
                </div>

                {/* Content */}
                <div
                  className="flex-1 p-6 mb-1"
                  style={{
                    background: "#fff",
                    border: "1px solid var(--nav-border)",
                    boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h2
                      className="text-sm font-bold uppercase tracking-widest"
                      style={{ color: "var(--nav-fg)" }}
                    >
                      {step.title}
                    </h2>
                    <span
                      className="text-[0.65rem] font-bold tracking-widest uppercase px-2 py-0.5 shrink-0"
                      style={{
                        background: "rgba(200,169,126,0.1)",
                        color: "var(--nav-accent)",
                        border: "1px solid rgba(200,169,126,0.2)",
                      }}
                    >
                      {step.number}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {step.body}
                  </p>
                </div>
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
        <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3
              className="text-sm font-bold uppercase tracking-[0.12em] mb-1"
              style={{ color: "var(--nav-fg)" }}
            >
              Want to cancel an order?
            </h3>
            <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
              Act quickly — reach out to our support team before your order
              ships.
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
            Contact Support
          </a>
        </div>
      </section>
    </main>
  );
}
