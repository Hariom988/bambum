"use client";

import {
  FileText,
  Copyright,
  RefreshCw,
  UserCheck,
  ThumbsUp,
} from "lucide-react";

const SECTIONS = [
  {
    icon: Copyright,
    title: "Intellectual Property",
    body: "All content on this website, including images, designs, text, and branding elements, is the intellectual property of Bambum and may not be reproduced, distributed, or used in any form without prior written permission.",
  },
  {
    icon: RefreshCw,
    title: "Pricing & Availability",
    body: "We reserve the right to modify product pricing, availability, and website content at any time without prior notice. While we strive for accuracy, errors may occasionally occur, and we reserve the right to correct them.",
  },
  {
    icon: UserCheck,
    title: "User Responsibilities",
    body: "Users are responsible for providing accurate and complete information while placing orders. Any misuse of the website, including fraudulent transactions or unauthorized activities, may result in legal action.",
  },
  {
    icon: ThumbsUp,
    title: "Acceptance of Terms",
    body: "Your continued use of the website indicates your acceptance of these terms and conditions. If you do not agree with any part of these terms, we kindly ask that you discontinue use of our website.",
  },
];

export default function TermsConditionsPage() {
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
        {/* Decorative background wordmark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span
            className="font-bold uppercase leading-none whitespace-nowrap"
            style={{
              fontFamily: "var(--nav-font)",
              fontSize: "clamp(5rem, 17vw, 16rem)",
              letterSpacing: "0.1em",
              color: "var(--nav-accent)",
              opacity: 0.035,
            }}
          >
            TERMS
          </span>
        </div>

        {/* Top accent rule */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: "var(--nav-accent)" }}
        />

        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-[0.14em] uppercase"
            style={{
              background: "rgba(200,169,126,0.12)",
              border: "1px solid var(--nav-border)",
              color: "var(--nav-accent)",
            }}
          >
            <FileText size={12} strokeWidth={2.5} />
            Legal Agreement
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-5 leading-tight"
            style={{ fontFamily: "var(--nav-font)" }}
          >
            Terms &amp; Conditions
          </h1>

          <div
            className="w-16 h-0.5 mx-auto mb-6"
            style={{ background: "var(--nav-accent)" }}
          />

          <p
            className="text-base md:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            Welcome to{" "}
            <strong style={{ color: "var(--nav-fg)" }}>Bambum.</strong> By
            accessing and using this website, you agree to comply with the
            following terms and conditions.
          </p>
        </div>
      </section>

      {/* ── TERMS SECTIONS ── */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-20">
        <div className="flex flex-col gap-6">
          {SECTIONS.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <article
                key={sec.title}
                className="group relative flex gap-6 p-6 md:p-8 rounded-sm transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.55)",
                  border: "1px solid var(--nav-border)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {/* Step number */}
                <span
                  className="absolute top-5 right-6 text-[2.5rem] font-bold leading-none pointer-events-none select-none"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-accent)",
                    opacity: 0.1,
                  }}
                  aria-hidden="true"
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Icon */}
                <div
                  className="shrink-0 w-11 h-11 flex items-center justify-center rounded-sm"
                  style={{
                    background: "rgba(200,169,126,0.12)",
                    border: "1px solid var(--nav-border)",
                  }}
                >
                  <Icon
                    size={18}
                    style={{ color: "var(--nav-accent)" }}
                    strokeWidth={1.75}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2
                    className="text-sm font-bold uppercase tracking-[0.12em] mb-3"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    {sec.title}
                  </h2>
                  <p
                    className="text-sm md:text-[0.9375rem] leading-relaxed"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {sec.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── CONTACT STRIP ── */}
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
              Have questions about our terms?
            </h3>
            <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
              Our team is available to help clarify any of the above.
            </p>
          </div>
          <a
            href="mailto:support@bambum.in"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-[0.12em] uppercase transition-colors duration-200"
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
