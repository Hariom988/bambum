"use client";

import { Shield, Eye, Share2, Lock, CheckCircle } from "lucide-react";

const SECTIONS = [
  {
    icon: Eye,
    title: "Information We Collect",
    body: "We collect essential details such as your name, contact number, email address, and shipping information to process orders, provide customer support, and improve your overall shopping experience. Additionally, we may collect non-personal data such as browser type, device information, and website usage patterns to enhance our services.",
  },
  {
    icon: Share2,
    title: "How We Use Your Data",
    body: "Your information is never sold or shared for marketing purposes. However, it may be shared with trusted third-party partners such as payment gateways and logistics providers strictly for order fulfillment and operational efficiency.",
  },
  {
    icon: Lock,
    title: "Data Security",
    body: "We implement industry-standard security measures to safeguard your data against unauthorized access, misuse, or disclosure.",
  },
  {
    icon: CheckCircle,
    title: "Your Consent",
    body: "By continuing to use our website, you consent to our data practices as outlined in this policy.",
  },
];

export default function PrivacyPolicyPage() {
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
            className="font-bold uppercase leading-none opacity-[0.035] whitespace-nowrap"
            style={{
              fontFamily: "var(--nav-font)",
              fontSize: "clamp(6rem, 20vw, 18rem)",
              letterSpacing: "0.1em",
              color: "var(--nav-accent)",
            }}
          >
            PRIVACY
          </span>
        </div>

        {/* Thin accent rule */}
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
            <Shield size={12} strokeWidth={2.5} />
            Your Privacy Matters
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-5 leading-tight"
            style={{ fontFamily: "var(--nav-font)" }}
          >
            Privacy Policy
          </h1>

          <div
            className="w-16 h-0.5 mx-auto mb-6"
            style={{ background: "var(--nav-accent)" }}
          />

          <p
            className="text-base md:text-lg leading-relaxed max-w-xl mx-auto"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            At <strong style={{ color: "var(--nav-fg)" }}>Bambumm</strong>, we
            value your privacy and are committed to protecting your personal
            information with complete transparency and responsibility.
          </p>
        </div>
      </section>

      {/* ── POLICY SECTIONS ── */}
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
              Questions about your privacy?
            </h3>
            <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
              We&apos;re happy to clarify anything in this policy.
            </p>
          </div>
          <a
            href="mailto:support@bambumm.com"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-[0.12em] uppercase transition-colors duration-200"
            style={{
              background: "var(--nav-accent)",
              color: "#fff",
            }}
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
