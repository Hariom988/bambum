"use client";

import { useEffect, useRef } from "react";
import { Leaf, Wind, Globe, Sparkles } from "lucide-react";
import FAQ from "@/components/FAQ";

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
  "Eco-Friendly",
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
        .hero-line-wrap {
          display: block;
        }
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
          transition: opacity 0.9s 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-ready .hero-badge { opacity: 1; transform: translateY(0); }
        .hero-ready .hero-line-inner { transform: translateY(0); }
        .hero-ready .hero-sub { opacity: 1; transform: translateY(0); }
        .hero-ready .hero-cta { opacity: 1; transform: translateY(0); }
        .hero-ready .hero-img { opacity: 1; transform: scale(1) translateY(0); }

        /* ═══ MARQUEE ═══ */
        @keyframes marquee-ltr {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-rtl {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .marquee-track-ltr {
          display: flex;
          width: max-content;
          animation: marquee-ltr 22s linear infinite;
        }
        .marquee-track-rtl {
          display: flex;
          width: max-content;
          animation: marquee-rtl 26s linear infinite;
        }
        .marquee-track-ltr:hover,
        .marquee-track-rtl:hover {
          animation-play-state: paused;
        }

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
        @keyframes revealUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* ═══ PILLAR CARDS ═══ */
        .pillar-card {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.3s ease,
                      border-color 0.3s ease;
        }
        .pillar-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.25);
          border-color: var(--about-teal) !important;
        }
        .pillar-icon {
          transition: background 0.3s ease, transform 0.3s ease;
        }
        .pillar-card:hover .pillar-icon {
          background: rgba(42, 122, 114, 0.22) !important;
          transform: scale(1.08);
        }

        /* ═══ VISION IMAGE ═══ */
        .vision-img-wrap {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vision-img-wrap:hover {
          transform: scale(1.02);
        }

        /* ═══ CTA BUTTON ═══ */
        .about-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 16px 40px;
          font-family: var(--nav-font-ui);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          text-decoration: none;
          background-color: var(--about-teal-light);
          color: #fff;
          border: none;
          cursor: pointer;
          position: relative;
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
          background: var(--about-teal-light, #3d9c93);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(42, 122, 114, 0.35);
        }
        .about-cta-btn:hover::before {
          transform: translateX(100%);
        }

        /* ═══ DECORATIVE LINE ═══ */
        .accent-line {
          height: 2px;
          background: var(--about-teal);
          width: 0;
          transition: width 1.2s 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .in-view .accent-line { width: 64px; }

        /* ═══ STAT COUNTERS ═══ */
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-item.in-view {
          animation: countUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .stat-item:nth-child(2).in-view { animation-delay: 0.12s; }
        .stat-item:nth-child(3).in-view { animation-delay: 0.24s; }
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
            borderBottom: "1px solid var(--nav-border)",
          }}
        >
          <div
            ref={heroRef}
            className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 md:gap-16 items-center"
          >
            {/* Left: text */}
            <div>
              <div
                className="hero-badge inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full"
                style={{
                  backgroundColor: "rgba(42,122,114,0.1)",
                  border: "1px solid rgba(42,122,114,0.25)",
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

              <h1
                style={{
                  fontFamily: "var(--nav-font)",
                  lineHeight: 1,
                  marginBottom: "2rem",
                }}
              >
                <span className="hero-line-wrap">
                  <span
                    className="hero-line-inner"
                    style={{
                      fontSize: "86px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--nav-fg)",
                      display: "block",
                    }}
                  >
                    About
                  </span>
                </span>
                <span className="hero-line-wrap">
                  <span
                    className="hero-line-inner"
                    style={{
                      fontSize: "86px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--about-teal)",
                      display: "block",
                    }}
                  >
                    Bambumm
                  </span>
                </span>
                <span className="hero-line-wrap">
                  <span
                    className="hero-line-inner"
                    style={{
                      fontSize: "clamp(1rem, 2vw, 1.25rem)",
                      fontWeight: 400,
                      letterSpacing: "0.28em",
                      color: "var(--nav-fg-muted)",
                      display: "block",
                      marginTop: "0.5rem",
                    }}
                  >
                    EST. IN INDIA
                  </span>
                </span>
              </h1>

              <p
                className="hero-sub max-w-md"
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  color: "var(--nav-fg-muted)",
                  marginBottom: "2.5rem",
                }}
              >
                Premium bamboo essentials for everyday wear. Experience the
                perfect blend of luxury, comfort, and sustainability.
              </p>

              <div className="hero-cta">
                <a href="/products" className="about-cta-btn">
                  Shop the Collection
                  <span style={{ fontSize: "1rem" }}>→</span>
                </a>
              </div>
            </div>

            {/* Right: image */}
            <div className="hero-img flex justify-center md:justify-end">
              <div
                className="vision-img-wrap relative "
                style={{
                  width: "100%",
                  maxWidth: 380,
                  aspectRatio: "5/5",
                }}
              >
                <img
                  src="/about_banner_image.png"
                  alt="Bambumm about"
                  style={{
                    width: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                />
                {/* Corner accents */}
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
                    className={`absolute ${pos} w-8 h-8 pointer-events-none`}
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
        {/* ══════════════ MARQUEE BAND (RTL) — bottom of dark section ══════════════ */}
        <div
          style={{
            background: "#0d0f0d",
            overflow: "hidden",
            padding: "14px 0",
            borderTop: "1px solid rgba(42,122,114,0.15)",
          }}
        >
          <div className="marquee-track-rtl">
            {[0, 1].map((_, rep) => (
              <div key={rep} className="flex items-center">
                {[
                  "Bamboo Fabric",
                  "·",
                  "100% Natural",
                  "·",
                  "Made in India",
                  "·",
                  "Premium Quality",
                  "·",
                  "Eco-Friendly",
                  "·",
                ].map((item, j) => (
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
                          ? "rgba(42,122,114,0.4)"
                          : "rgba(42,122,114,0.7)",
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* ══════════════ MARQUEE BAND (LTR) ══════════════ */}
        <div
          style={{
            background: "var(--about-teal)",
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
                          ? "rgba(255,255,255,0.45)"
                          : "rgba(255,255,255,0.95)",
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
          style={{ background: "var(--about-hero-bg)", padding: "80px 0 96px" }}
        >
          <div className="max-w-6xl mx-auto px-6">
            <div
              ref={visionRef}
              className="fade-up grid  gap-16 md:gap-24 items-center"
            >
              {/* Text */}
              <div className="text-centre">
                <p
                  style={{
                    fontSize: "4rem",
                    fontWeight: 600,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--about-teal)",
                    marginBottom: "1.25rem",
                    textAlign: "center",
                  }}
                >
                  Our Vision
                </p>
                <div className="accent-line" style={{ marginBottom: "2rem" }} />
                <h2
                  style={{
                    fontFamily: "var(--nav-font)",
                    fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                    lineHeight: 1.2,
                    color: "var(--nav-fg)",
                    marginBottom: "1.5rem",
                    textAlign: "center",
                  }}
                >
                  Created to redefine everyday comfort through{" "}
                  <em
                    style={{ color: "var(--about-teal)", fontStyle: "italic" }}
                  >
                    innovation
                  </em>{" "}
                  and{" "}
                  <em
                    style={{ color: "var(--about-teal)", fontStyle: "italic" }}
                  >
                    sustainability.
                  </em>
                </h2>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    lineHeight: 1.8,
                    color: "var(--nav-fg-muted)",
                    marginBottom: "2.5rem",
                  }}
                >
                  We specialize in premium products made from bamboo fabric —
                  known for its softness, breathability, and eco-friendly
                  properties. Our goal is to deliver comfort that feels good on
                  your skin and is better for the planet.
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { val: "100%", label: "Bamboo Fabric" },
                    { val: "3×", label: "Softer than Cotton" },
                    { val: "0", label: "Synthetic Additives" },
                  ].map((stat, i) => (
                    <div key={i} className="stat-item">
                      <p
                        style={{
                          fontFamily: "var(--nav-font)",
                          fontSize: "2rem",
                          fontWeight: 700,
                          color: "var(--about-teal)",
                          lineHeight: 1,
                        }}
                      >
                        {stat.val}
                      </p>
                      <p
                        style={{
                          fontSize: "0.7rem",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: "var(--nav-fg-muted)",
                          marginTop: "0.4rem",
                        }}
                      >
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════ WHAT WE STAND FOR (dark section) ══════════════ */}
        <section style={{ background: "#141614", padding: "96px 0" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div style={{ textAlign: "center", marginBottom: "64px" }}>
              <p
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--about-teal)",
                  marginBottom: "1rem",
                }}
              >
                Our Values
              </p>
              <h2
                style={{
                  fontFamily: "var(--nav-font)",
                  fontSize: "clamp(2rem, 5vw, 3rem)",
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1.15,
                }}
              >
                What We Stand For
              </h2>
            </div>

            <div
              ref={pillarsRef}
              className="stagger grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="pillar-card flex items-start gap-5 p-8"
                    style={{
                      background: "#1d201d",
                      border: "rgba(42, 122, 114, 0.22)",
                    }}
                  >
                    <div
                      className="pillar-icon flex items-center justify-center shrink-0"
                      style={{
                        width: 52,
                        height: 52,
                        background: "rgba(42,122,114,0.12)",
                        border: "1px solid rgba(42,122,114,0.25)",
                      }}
                    >
                      <Icon
                        size={20}
                        style={{ color: "var(--about-teal-light, #3d9c93)" }}
                        strokeWidth={1.75}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        style={{
                          fontFamily: "var(--nav-font)",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "#3d9c93",
                          marginBottom: "0.6rem",
                        }}
                      >
                        {p.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          lineHeight: 1.75,
                          color: "#7a7a6e",
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

        {/* ══════════════ OUR PROMISE (closing) ══════════════ */}
        <section
          ref={closingRef}
          className="fade-up"
          style={{
            background: "var(--about-hero-bg)",
            padding: "96px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--about-teal)",
              marginBottom: "2rem",
            }}
          >
            Our Promise
          </p>
          <h2
            className="var(--nav-fg)"
            style={{
              fontFamily: "var(--nav-font)",
              fontSize: "64px",
              fontWeight: 700,
              textTransform: "uppercase",
              lineHeight: 1.05,
              letterSpacing: "0.02em",
              maxWidth: "900px",
              margin: "0 auto 2.5rem",
            }}
          >
            Wear the Comfort.
            <br />
            <span className="var(--about-teal)">Wear Bambumm.</span>
          </h2>

          <div className="flex var(--nav-border) items-center justify-center gap-4 mb-10">
            <div style={{ height: 1, width: 64 }} />
            <Leaf size={16} className="var(--about-teal)" />
            <div
              className="var(--nav-border)"
              style={{ height: 1, width: 64 }}
            />
          </div>

          <a href="/products" className="about-cta-btn">
            Shop the Collection
            <span style={{ fontSize: "1rem" }}>→</span>
          </a>
        </section>

        {/* <FAQ /> */}
      </main>
    </>
  );
}
