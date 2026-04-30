"use client";

import { useEffect, useRef } from "react";
import { Leaf, Wind, Globe, Sparkles } from "lucide-react";

/*
  New CSS variables to add to :root in globals.css:
  --about-hero-bg: #f5f5f0;
  --about-teal: #19635e;         (can reuse var(--nav-accent) if same value)
  --about-teal-light: #3d9c93;
  --about-card-bg: #1c1f1c;
  --about-card-border: rgba(42,122,114,0.18);
  --about-body-muted: #7a7a6e;
  --about-dark-section: #111311;
  --about-promise-bg: #f0eeea;
*/

const PILLARS = [
  {
    icon: Sparkles,
    title: "Innovation",
    body: "Reimagining the basics — engineered for the way you actually live.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    body: "Bamboo fabric grows fast, needs no pesticides, and leaves the earth better.",
  },
  {
    icon: Wind,
    title: "Breathability",
    body: "Thermo-regulating fibres that move air and moisture away from your skin.",
  },
  {
    icon: Globe,
    title: "Responsibility",
    body: "Every product we make is a commitment — to you and to the planet.",
  },
];

const MARQUEE_ITEMS = [
  "Wear the Comfort",
  "·",
  "Wear Bambumm",
  "·",
  "Bamboo Fabric",
  "·",
  "Eco – Friendly",
  "·",
  "Premium Quality",
  "·",
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in-view");
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return ref;
}

export default function AboutUsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const visionRef = useInView(0.1);
  const pillarsRef = useInView(0.05);
  const closingRef = useInView(0.1);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const t = setTimeout(() => el.classList.add("hero-ready"), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        /* ═══ HERO ANIMATIONS ═══ */
        .hero-badge {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.6s 0.1s ease, transform 0.6s 0.1s ease;
        }
        .hero-line-wrap { display: block; }
        .hero-line-inner {
          display: block;
          transform: translateY(110%);
          transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-line-wrap:nth-child(1) .hero-line-inner { transition-delay: 0.2s; }
        .hero-line-wrap:nth-child(2) .hero-line-inner { transition-delay: 0.38s; }
        .hero-line-wrap:nth-child(3) .hero-line-inner { transition-delay: 0.54s; }
        .hero-sub {
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.7s 0.72s ease, transform 0.7s 0.72s ease;
        }
        .hero-cta {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.6s 0.88s ease, transform 0.6s 0.88s ease;
        }
        .hero-img {
          opacity: 0;
          transform: scale(0.96) translateY(20px);
          transition: opacity 0.9s 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.9s 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hero-ready .hero-badge  { opacity: 1; transform: translateY(0); }
        .hero-ready .hero-line-inner { transform: translateY(0); }
        .hero-ready .hero-sub    { opacity: 1; transform: translateY(0); }
        .hero-ready .hero-cta    { opacity: 1; transform: translateY(0); }
        .hero-ready .hero-img    { opacity: 1; transform: scale(1) translateY(0); }

        /* ═══ MARQUEE ═══ */
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track-ltr {
          display: flex;
          width: max-content;
          animation: marquee-ltr 22s linear infinite;
        }
        .marquee-track-ltr:hover { animation-play-state: paused; }

        /* ═══ SCROLL REVEALS ═══ */
        .fade-up {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fade-up.in-view { opacity: 1; transform: translateY(0); }

        .stagger > * {
          opacity: 0;
          transform: translateY(28px);
        }
        .stagger.in-view > *:nth-child(1) { animation: revealUp 0.7s 0.05s cubic-bezier(0.16,1,0.3,1) forwards; }
        .stagger.in-view > *:nth-child(2) { animation: revealUp 0.7s 0.18s cubic-bezier(0.16,1,0.3,1) forwards; }
        .stagger.in-view > *:nth-child(3) { animation: revealUp 0.7s 0.31s cubic-bezier(0.16,1,0.3,1) forwards; }
        .stagger.in-view > *:nth-child(4) { animation: revealUp 0.7s 0.44s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes revealUp { to { opacity: 1; transform: translateY(0); } }

        /* ═══ PILLAR CARDS ═══ */
        .pillar-card {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
        }
        .pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.3);
          border-color: var(--about-teal) !important;
        }
        .pillar-icon {
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .pillar-card:hover .pillar-icon {
          background: rgba(42,122,114,0.22) !important;
          transform: scale(1.08);
        }

        /* ═══ VISION IMAGE ═══ */
        .vision-img-wrap {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vision-img-wrap:hover { transform: scale(1.02); }

        /* ═══ CTA BUTTON — rounded rectangle ═══ */
        .about-cta-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 48px;
          font-family: var(--nav-font-ui);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          background-color: var(--about-teal);
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
        }
        .about-cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.1);
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .about-cta-btn:hover {
          background: var(--about-teal-light);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(42,122,114,0.35);
        }
        .about-cta-btn:hover::before { transform: translateX(100%); }

        /* ═══ DECORATIVE RULE ═══ */
        .promise-rule {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 2rem auto 2.5rem;
        }
        .promise-rule-line {
          height: 1px;
          width: 80px;
          background: var(--about-teal);
          opacity: 0.35;
        }
      `}</style>

      <main
        style={{
          background: "var(--about-hero-bg)",
          color: "var(--nav-fg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        {/* ══════════════ HERO ══════════════ */}
        <section
          style={{
            background: "var(--about-hero-bg)",
          }}
        >
          <div
            ref={heroRef}
            className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 md:gap-16 items-center"
          >
            {/* Left: text */}
            <div>
              {/* Badge */}
              <div
                className="hero-badge inline-flex items-center gap-2 px-4 py-2 mb-6"
                style={{
                  border: "1px solid rgba(42,122,114,0.35)",
                  borderRadius: "999px",
                  background: "transparent",
                }}
              >
                <Leaf
                  size={12}
                  strokeWidth={2.5}
                  style={{ color: "var(--about-teal)" }}
                />
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--about-teal)",
                  }}
                >
                  Our Story
                </span>
              </div>

              {/* Headline */}
              <h1
                style={{
                  fontFamily: "var(--nav-font)",
                  lineHeight: 1,
                  marginBottom: "1.5rem",
                  overflow: "hidden",
                }}
              >
                <span
                  className="hero-line-wrap"
                  style={{ overflow: "hidden", display: "block" }}
                >
                  <span
                    className="hero-line-inner"
                    style={{
                      fontSize: "clamp(52px, 8vw, 86px)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--about-teal)",
                      display: "block",
                    }}
                  >
                    About
                  </span>
                </span>
                <span
                  className="hero-line-wrap"
                  style={{ overflow: "hidden", display: "block" }}
                >
                  <span
                    className="hero-line-inner"
                    style={{
                      fontSize: "clamp(52px, 8vw, 86px)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--about-teal)",
                      display: "block",
                    }}
                  >
                    Bambumm
                  </span>
                </span>
                <span
                  className="hero-line-wrap"
                  style={{ overflow: "hidden", display: "block" }}
                >
                  <span
                    className="hero-line-inner"
                    style={{
                      fontSize: "clamp(0.9rem, 2vw, 1.25rem)",
                      fontWeight: 600,
                      letterSpacing: "0.24em",
                      color: "var(--about-teal-light)",
                      display: "block",
                      marginTop: "0.4rem",
                    }}
                  >
                    EST. IN INDIA
                  </span>
                </span>
              </h1>

              <p
                className="hero-sub max-w-md"
                style={{
                  fontSize: "0.9375rem",
                  lineHeight: 1.75,
                  color: "var(--nav-fg-muted)",
                  marginBottom: "0",
                }}
              >
                Premium bambumm essentials for everyday wear. Experience the
                perfect blend of luxury, comfort, and sustainability.
              </p>
            </div>

            {/* Right: image — square with corner accents */}
            <div className="hero-img flex justify-center md:justify-end">
              <div
                className="vision-img-wrap relative"
                style={{
                  width: "100%",
                  maxWidth: 380,
                  aspectRatio: "1/1",
                }}
              >
                <img
                  src="/about_banner_image.png"
                  alt="Bambumm about"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                  }}
                />
                {/* Corner accent brackets */}
                {(
                  [
                    "top-0 left-0",
                    "top-0 right-0",
                    "bottom-0 left-0",
                    "bottom-0 right-0",
                  ] as const
                ).map((pos, i) => (
                  <div
                    key={i}
                    className={`absolute ${pos} w-6 h-6 pointer-events-none`}
                    style={{
                      borderTop: i < 2 ? `2px solid var(--about-teal)` : "none",
                      borderBottom:
                        i >= 2 ? `2px solid var(--about-teal)` : "none",
                      borderLeft:
                        i % 2 === 0 ? `2px solid var(--about-teal)` : "none",
                      borderRight:
                        i % 2 === 1 ? `2px solid var(--about-teal)` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ MARQUEE BAND (LTR) — dark bar ══════════════ */}
        <div
          style={{
            background: "#0d0f0d",
            overflow: "hidden",
            padding: "14px 0",
          }}
        >
          <div className="marquee-track-ltr">
            {[0, 1].map((_, rep) => (
              <div key={rep} className="flex items-center">
                {MARQUEE_ITEMS.map((item, j) => (
                  <span
                    key={j}
                    style={{
                      padding: "0 28px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      color:
                        item === "·"
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(255,255,255,0.9)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ OUR VISION ══════════════ */}
        <section
          style={{
            background: "var(--about-hero-bg)",
            padding: "80px 0 96px",
          }}
        >
          <div className="max-w-3xl mx-auto px-6">
            <div
              ref={visionRef}
              className="fade-up"
              style={{ textAlign: "center" }}
            >
              {/* "Our Vision" — serif, large, centered */}
              <h2
                style={{
                  fontFamily: "var(--nav-font)",
                  fontSize: "clamp(2.5rem, 6vw, 4rem)",
                  fontWeight: 400,
                  color: "var(--about-teal)",
                  marginBottom: "1.25rem",
                  lineHeight: 1.1,
                }}
              >
                Our Vision
              </h2>

              {/* Subheading */}
              <p
                style={{
                  fontFamily: "var(--nav-font)",
                  fontSize: "clamp(1rem, 2.5vw, 1.35rem)",
                  lineHeight: 1.5,
                  color: "var(--about-teal-light)",
                  marginBottom: "1.5rem",
                  fontWeight: 400,
                }}
              >
                Created to redefine everyday comfort through{" "}
                <em style={{ color: "var(--about-teal)", fontStyle: "italic" }}>
                  innovation
                </em>{" "}
                and{" "}
                <em style={{ color: "var(--about-teal)", fontStyle: "italic" }}>
                  sustainability.
                </em>
              </p>

              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.8,
                  color: "var(--nav-fg-muted)",
                }}
              >
                We specialize in premium products made from bamboo fabric —
                known for its softness, breathability, and eco-friendly
                properties. Our goal is to deliver comfort that feels good on
                your skin and is better for the planet.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════ WHAT WE STAND FOR (dark) ══════════════ */}
        <section
          style={{
            background: "var(--about-dark-section, #111311)",
            padding: "80px 0",
          }}
        >
          <div className="max-w-2xl mx-auto px-6">
            {/* Section heading */}
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <h2
                style={{
                  fontFamily: "var(--nav-font)",
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.15,
                }}
              >
                What We Stand For
              </h2>
            </div>

            {/* Pillar cards — single column, rounded */}
            <div
              ref={pillarsRef}
              className="stagger"
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="pillar-card flex items-start gap-5 p-6"
                    style={{
                      background: "var(--about-card-bg, #1c1f1c)",
                      border:
                        "1px solid var(--about-card-border, rgba(42,122,114,0.18))",
                      borderRadius: 12,
                    }}
                  >
                    {/* Icon */}
                    <div
                      className="pillar-icon flex items-center justify-center shrink-0"
                      style={{
                        width: 44,
                        height: 44,
                        background: "rgba(42,122,114,0.12)",
                        border: "1px solid rgba(42,122,114,0.25)",
                        borderRadius: 8,
                      }}
                    >
                      <Icon
                        size={18}
                        style={{ color: "var(--about-teal-light, #3d9c93)" }}
                        strokeWidth={1.75}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3
                        style={{
                          fontFamily: "var(--nav-font)",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "var(--about-teal-light, #3d9c93)",
                          marginBottom: "0.4rem",
                        }}
                      >
                        {p.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          lineHeight: 1.7,
                          color: "var(--about-body-muted, #7a7a6e)",
                        }}
                      >
                        {p.body}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════ OUR PROMISE ══════════════ */}
        <section
          ref={closingRef}
          className="fade-up"
          style={{
            background: "var(--about-promise-bg, #f0eeea)",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          {/* Label */}
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--about-teal)",
              marginBottom: "1.5rem",
            }}
          >
            Our Promise
          </p>

          {/* Big uppercase headline */}
          <h2
            style={{
              fontFamily: "var(--nav-font)",
              fontSize: "clamp(2.25rem, 7vw, 4.5rem)",
              fontWeight: 700,
              textTransform: "uppercase",
              lineHeight: 1.05,
              letterSpacing: "0.02em",
              maxWidth: "860px",
              margin: "0 auto",
              color: "var(--about-teal)",
            }}
          >
            Wear the Comfort.
            <br />
            <span style={{ color: "var(--about-teal)" }}>Wear Bambumm.</span>
          </h2>

          {/* Decorative horizontal rule with leaf */}
          <div className="promise-rule">
            <div className="promise-rule-line" />
            <Leaf
              size={16}
              style={{ color: "var(--about-teal)", opacity: 0.7 }}
              strokeWidth={1.75}
            />
            <div className="promise-rule-line" />
          </div>

          {/* CTA — rounded rectangle */}
          <a href="/products" className="about-cta-btn">
            Shop the Collection
          </a>
        </section>
      </main>
    </>
  );
}
