"use client";

import { Shield, Eye, Share2, Lock, CheckCircle } from "lucide-react";

/*
  New CSS variables to add to :root in globals.css:
  --pp-hero-bg: #f5f4f0;
  --pp-dark-bg: #141414;
  --pp-card-bg: #1e2020;
  --pp-card-border: rgba(41,177,168,0.15);
  --pp-teal: var(--ft-fg);               (reuses existing teal #29b1a8)
  --pp-card-title: var(--ft-fg);
  --pp-card-body: rgba(255,255,255,0.65);
  --pp-section-heading: #ffffff;
  --pp-section-sub: rgba(255,255,255,0.55);
  --pp-contact-bg: #ffffff;
  --pp-contact-heading: #0a0a0a;
  --pp-contact-sub: rgba(10,10,10,0.55);
*/

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
    <>
      <style>{`
        .pp-card {
          transition: border-color 0.25s ease, transform 0.25s ease;
        }
        .pp-card:hover {
          border-color: var(--pp-teal) !important;
          transform: translateY(-2px);
        }
        .pp-icon-wrap {
          transition: background 0.25s ease;
        }
        .pp-card:hover .pp-icon-wrap {
          background: rgba(41,177,168,0.18) !important;
        }

        .pp-contact-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 36px;
          font-family: var(--nav-font-ui);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          text-decoration: none;
          background: var(--pp-teal);
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .pp-contact-btn:hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
      `}</style>

      <main
        style={{
          background: "var(--pp-hero-bg)",
          color: "var(--nav-fg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        {/* ══════════════ HERO ══════════════ */}
        <section
          style={{
            background: "var(--pp-hero-bg)",
            padding: "48px 0 0",
          }}
        >
          <div
            className="max-w-6xl mx-auto px-6"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              alignItems: "center",
              paddingBottom: "48px",
            }}
          >
            {/* Left — text */}
            <div>
              {/* Badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 16px",
                  border: "1px solid rgba(41,177,168,0.35)",
                  borderRadius: "999px",
                  marginBottom: "24px",
                  background: "transparent",
                }}
              >
                <Shield
                  size={12}
                  strokeWidth={2.5}
                  style={{ color: "var(--pp-teal)" }}
                />
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--pp-teal)",
                  }}
                >
                  Your Privacy Matters
                </span>
              </div>

              {/* Two-line heading: "Privacy" dark, "Policy" teal */}
              <h1
                style={{
                  fontFamily: "var(--nav-font)",
                  lineHeight: 1.0,
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "clamp(3rem, 8vw, 5.5rem)",
                    fontWeight: 700,
                    color: "black",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Privacy
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "clamp(3rem, 8vw, 5.5rem)",
                    fontWeight: 700,
                    color: "var(--pp-teal)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Policy
                </span>
              </h1>

              {/* Body copy */}
              <p
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.75,
                  color: "var(--nav-fg-muted)",
                  maxWidth: 440,
                }}
              >
                At <strong style={{ color: "var(--pp-teal)" }}>Bambumm</strong>,
                we value your privacy and are committed to protecting your
                personal information with complete transparency and
                responsibility.
              </p>
            </div>

            {/* Right — illustration (user will supply image) */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src="/privacy_hero.png"
                alt="Privacy Policy illustration"
                style={{
                  width: "100%",
                  maxWidth: 400,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
          </div>
        </section>

        {/* ══════════════ DARK SECTIONS ══════════════ */}
        <section
          style={{
            background: "var(--pp-dark-bg)",
            padding: "72px 0 80px",
          }}
        >
          <div className="max-w-3xl mx-auto px-6">
            {/* "Before You Continue" heading */}
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <h2
                style={{
                  fontFamily: "var(--nav-font)",
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 700,
                  color: "var(--pp-section-heading)",
                  marginBottom: "14px",
                  lineHeight: 1.15,
                }}
              >
                Before You Continue
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: "var(--pp-section-sub)",
                  maxWidth: 480,
                  margin: "0 auto",
                }}
              >
                We believe transparency builds trust. Below you&apos;ll find a
                simple overview of how we collect, use, and protect your
                information while you shop with us.
              </p>
            </div>

            {/* Policy cards — single column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {SECTIONS.map((sec) => {
                const Icon = sec.icon;
                return (
                  <article
                    key={sec.title}
                    className="pp-card"
                    style={{
                      background: "var(--pp-card-bg)",
                      border: "1px solid var(--pp-card-border)",
                      borderRadius: 12,
                      padding: "24px 28px",
                    }}
                  >
                    {/* Icon + title row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 14,
                      }}
                    >
                      <div
                        className="pp-icon-wrap"
                        style={{
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(41,177,168,0.1)",
                          border: "1px solid rgba(41,177,168,0.2)",
                          borderRadius: 8,
                          flexShrink: 0,
                        }}
                      >
                        <Icon
                          size={17}
                          style={{ color: "var(--ft-fg)" }}
                          strokeWidth={1.75}
                        />
                      </div>
                      <h3
                        style={{
                          fontFamily: "var(--nav-font)",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "var(--ft-fg)",
                          margin: 0,
                          letterSpacing: "0.01em",
                        }}
                      >
                        {sec.title}
                      </h3>
                    </div>

                    {/* Body */}
                    <p
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: 1.75,
                        color: "var(--pp-card-body)",
                        margin: 0,
                      }}
                    >
                      {sec.body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════ CONTACT STRIP ══════════════ */}
        <section
          style={{
            background: "var(--pp-contact-bg)",
            padding: "48px 24px",
          }}
        >
          <div
            className="max-w-4xl mx-auto"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 32,
              flexWrap: "wrap",
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--pp-contact-heading)",
                  marginBottom: 6,
                }}
              >
                Questions About Your Privacy ?
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--pp-contact-sub)",
                  margin: 0,
                }}
              >
                We&apos;re happy to clarify anything in this policy.
              </p>
            </div>

            <a href="mailto:support@bambumm.com" className="pp-contact-btn">
              Contact Us
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
