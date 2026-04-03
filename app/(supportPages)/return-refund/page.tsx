"use client";

import {
  PackageX,
  ImagePlus,
  RotateCcw,
  Clock,
  Ban,
  CheckCircle2,
} from "lucide-react";

const ELIGIBLE = [
  "Product received is damaged",
  "Product received is defective",
  "Wrong item delivered",
];

const NOT_ELIGIBLE = [
  "Change of mind",
  "Size issues",
  "Slight color variation due to lighting or screen differences",
  "Used or washed products",
];

const STEPS = [
  {
    icon: ImagePlus,
    step: "01",
    title: "Document the Issue",
    body: "Capture clear images or videos of the damaged, defective, or incorrect item received.",
  },
  {
    icon: Clock,
    step: "02",
    title: "Contact Within 48 Hours",
    body: "Reach out to us within 48 hours of delivery with your order details and proof.",
  },
  {
    icon: RotateCcw,
    step: "03",
    title: "We Verify & Resolve",
    body: "Once verified, we'll offer a replacement or process a refund to your original payment method within 5–7 working days.",
  },
];

export default function RefundPolicyPage() {
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
        className="relative overflow-hidden"
        style={{ background: "var(--ft-bg)", color: "var(--ft-fg)" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-0.75"
          style={{ background: "var(--nav-accent)" }}
        />

        {/* Big decorative icon */}
        <div
          className="absolute -right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none"
          aria-hidden="true"
        >
          <PackageX
            size={320}
            strokeWidth={0.35}
            style={{ color: "var(--nav-accent)", opacity: 0.06 }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-xs font-semibold tracking-[0.14em] uppercase"
              style={{
                background: "rgba(200,169,126,0.1)",
                border: "1px solid rgba(200,169,126,0.2)",
                color: "var(--nav-accent)",
              }}
            >
              <PackageX size={12} strokeWidth={2.5} />
              Returns &amp; Refunds
            </div>

            <h1
              className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-5 leading-[1.1]"
              style={{ fontFamily: "var(--nav-font)", color: "var(--ft-fg)" }}
            >
              Return &amp;
              <br />
              Refund Policy
            </h1>

            <div
              className="w-12 h-0.75 mb-6"
              style={{ background: "var(--nav-accent)" }}
            />

            <p
              className="text-base leading-relaxed max-w-md"
              style={{ color: "var(--ft-fg-muted)" }}
            >
              At <strong style={{ color: "var(--ft-fg)" }}>Bambum,</strong> we
              prioritize hygiene, quality, and customer satisfaction. Due to the
              intimate nature of our products, all innerwear and undergarments
              are strictly non-returnable and non-exchangeable once delivered.
            </p>
          </div>

          {/* Stat card */}
          <div className="flex md:justify-end">
            <div
              className="w-full max-w-xs p-8 flex flex-col gap-6"
              style={{
                background: "rgba(200,169,126,0.07)",
                border: "1px solid rgba(200,169,126,0.18)",
              }}
            >
              <div>
                <p
                  className="text-[2.8rem] font-bold leading-none"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-accent)",
                  }}
                >
                  48h
                </p>
                <p
                  className="text-xs tracking-widest uppercase mt-1"
                  style={{ color: "var(--ft-fg-muted)" }}
                >
                  Report window after delivery
                </p>
              </div>
              <div
                className="h-px"
                style={{ background: "rgba(200,169,126,0.18)" }}
              />
              <div>
                <p
                  className="text-[2.8rem] font-bold leading-none"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-accent)",
                  }}
                >
                  5-7
                </p>
                <p
                  className="text-xs tracking-widest uppercase mt-1"
                  style={{ color: "var(--ft-fg-muted)" }}
                >
                  Working days for refund
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS STEPS ── */}
      <section
        className="border-y"
        style={{
          borderColor: "var(--nav-border)",
          background: "rgba(200,169,126,0.04)",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-14">
          <p
            className="text-xs font-bold tracking-[0.18em] uppercase mb-10 text-center"
            style={{ color: "var(--nav-accent)" }}
          >
            How the Process Works
          </p>
          <div className="grid md:grid-cols-3 gap-0 relative">
            {/* Connector line (desktop only) */}
            <div
              className="hidden md:block absolute top-7 left-[16.66%] right-[16.66%] h-px"
              style={{ background: "var(--nav-border)" }}
              aria-hidden="true"
            />

            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="flex flex-col items-center text-center px-6 relative"
                >
                  <div
                    className="w-14 h-14 flex items-center justify-center mb-5 z-10"
                    style={{
                      background: "var(--nav-bg)",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    <Icon
                      size={22}
                      style={{ color: "var(--nav-accent)" }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <p
                    className="text-[0.65rem] font-bold tracking-[0.18em] uppercase mb-1"
                    style={{ color: "var(--nav-accent)" }}
                  >
                    Step {s.step}
                  </p>
                  <h3
                    className="text-sm font-bold uppercase tracking-[0.08em] mb-2"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    {s.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {s.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ELIGIBLE / NOT ELIGIBLE ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-20">
        <p
          className="text-xs font-bold tracking-[0.18em] uppercase mb-10 text-center"
          style={{ color: "var(--nav-accent)" }}
        >
          Eligibility at a Glance
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Eligible */}
          <div
            className="p-8"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid var(--nav-border)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{
                  background: "rgba(200,169,126,0.12)",
                  border: "1px solid var(--nav-border)",
                }}
              >
                <CheckCircle2
                  size={16}
                  style={{ color: "var(--nav-accent)" }}
                  strokeWidth={2}
                />
              </div>
              <h2
                className="text-xs font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--nav-fg)" }}
              >
                Eligible for Replacement / Refund
              </h2>
            </div>

            <ul className="flex flex-col gap-3">
              {ELIGIBLE.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-0.75 w-4 h-4 shrink-0 flex items-center justify-center rounded-full"
                    style={{ background: "rgba(200,169,126,0.15)" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--nav-accent)" }}
                    />
                  </span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Eligible */}
          <div
            className="p-8"
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid var(--nav-border)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-9 h-9 flex items-center justify-center"
                style={{
                  background: "rgba(217,79,61,0.08)",
                  border: "1px solid rgba(217,79,61,0.18)",
                }}
              >
                <Ban
                  size={16}
                  style={{ color: "var(--nav-sale)" }}
                  strokeWidth={2}
                />
              </div>
              <h2
                className="text-xs font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--nav-fg)" }}
              >
                Non-Eligible Cases
              </h2>
            </div>

            <ul className="flex flex-col gap-3">
              {NOT_ELIGIBLE.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-0.75 w-4 h-4 shrink-0 flex items-center justify-center rounded-full"
                    style={{ background: "rgba(217,79,61,0.08)" }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--nav-sale)" }}
                    />
                  </span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── AGREEMENT STRIP ── */}
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
              Need help with an order?
            </h3>
            <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
              By placing an order, you agree to this policy. Reach out within 48
              hours.
            </p>
          </div>
          <a
            href="mailto:hello@bambum.in"
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
