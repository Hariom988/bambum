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

function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
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
  const visionRef = useFadeIn();
  const pillarsRef = useFadeIn(0.1);
  const closingRef = useFadeIn();

  // Hero entrance on mount
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const t = setTimeout(() => el.classList.add("is-visible"), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        /* ── Fade-up base ── */
        .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1),
                      transform 0.75s cubic-bezier(0.22,1,0.36,1);
        }
        .fade-up.is-visible { opacity: 1; transform: translateY(0); }

        /* Stagger children */
        .stagger-children > * { opacity: 0; transform: translateY(24px); }
        .stagger-children.is-visible > *:nth-child(1) { animation: fadeUp 0.65s 0.05s cubic-bezier(0.22,1,0.36,1) forwards; }
        .stagger-children.is-visible > *:nth-child(2) { animation: fadeUp 0.65s 0.18s cubic-bezier(0.22,1,0.36,1) forwards; }
        .stagger-children.is-visible > *:nth-child(3) { animation: fadeUp 0.65s 0.31s cubic-bezier(0.22,1,0.36,1) forwards; }
        .stagger-children.is-visible > *:nth-child(4) { animation: fadeUp 0.65s 0.44s cubic-bezier(0.22,1,0.36,1) forwards; }

        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Hero lines stagger */
        .hero-line {
          display: block;
          overflow: hidden;
        }
        .hero-line span {
          display: block;
          transform: translateY(105%);
          transition: transform 0.8s cubic-bezier(0.22,1,0.36,1);
        }
        .hero-block.is-visible .hero-line:nth-child(1) span { transform: translateY(0); transition-delay: 0.05s; }
        .hero-block.is-visible .hero-line:nth-child(2) span { transform: translateY(0); transition-delay: 0.2s; }
        .hero-block.is-visible .hero-line:nth-child(3) span { transform: translateY(0); transition-delay: 0.35s; }
        .hero-block.is-visible .hero-meta { opacity: 1; transform: translateY(0); }

        .hero-meta {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.7s 0.55s ease, transform 0.7s 0.55s ease;
        }

        /* Pillar card hover */
        .pillar-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .pillar-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(200,169,126,0.14);
          border-color: var(--nav-accent) !important;
        }

        /* Accent line grow */
        .line-grow {
          width: 0;
          transition: width 1.1s 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .fade-up.is-visible .line-grow,
        .stagger-children.is-visible .line-grow { width: 64px; }

        /* Marquee */
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 18s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>

      <main
        className="min-h-screen overflow-hidden"
        style={{
          background: "var(--nav-bg)",
          color: "var(--nav-fg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        {/* ── HERO ── */}
        <section
          className="relative border-b overflow-hidden"
          style={{ borderColor: "var(--nav-border)" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.75"
            style={{ background: "var(--nav-accent)" }}
          />

          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 60% 50%, rgba(200,169,126,0.1) 0%, transparent 70%)",
            }}
          />

          {/* Soft grid lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(var(--nav-border) 1px, transparent 1px),
                linear-gradient(90deg, var(--nav-border) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }}
          />

          <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-36 grid md:grid-cols-[1fr_auto] gap-12 items-end">
            {/* Title */}
            <div ref={heroRef} className="hero-block">
              <div className="hero-meta mb-6">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase"
                  style={{
                    background: "rgba(200,169,126,0.12)",
                    border: "1px solid var(--nav-border)",
                    color: "var(--nav-accent)",
                  }}
                >
                  <Leaf size={11} strokeWidth={2.5} />
                  Our Story
                </div>
              </div>

              <h1
                className="text-6xl md:text-[7rem] font-bold uppercase leading-[0.9] tracking-tight mb-8"
                style={{ fontFamily: "var(--nav-font)" }}
              >
                <span className="hero-line">
                  <span>About</span>
                </span>
                <span
                  className="hero-line"
                  style={
                    {
                      color: "transparent",
                      WebkitTextStroke: "1.5px var(--nav-accent)",
                    } as React.CSSProperties
                  }
                >
                  <span>Bambum</span>
                </span>
                <span className="hero-line">
                  <span
                    style={{
                      fontSize: "0.42em",
                      letterSpacing: "0.25em",
                      color: "var(--nav-fg-muted)",
                      fontWeight: 400,
                    }}
                  >
                    EST. IN INDIA
                  </span>
                </span>
              </h1>
            </div>

            {/* Side rotated label */}
            <div
              className="hidden md:flex items-center justify-center self-center"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                color: "var(--nav-fg-muted)",
                textTransform: "uppercase",
                fontWeight: 600,
                opacity: 0.5,
              }}
            >
              Comfort · Sustainability · Innovation
            </div>
          </div>
        </section>

        {/* ── MARQUEE BAND ── */}
        <div
          className="overflow-hidden border-b py-3"
          style={{
            borderColor: "var(--nav-border)",
            background: "rgba(200,169,126,0.06)",
          }}
        >
          <div className="marquee-track">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-0">
                {[
                  "Wear the Comfort",
                  "·",
                  "Wear Bambum",
                  "·",
                  "Bamboo Fabric",
                  "·",
                  "Eco-Friendly",
                  "·",
                  "Premium Quality",
                  "·",
                ].map((t, j) => (
                  <span
                    key={j}
                    className="px-8 text-xs font-semibold tracking-[0.18em] uppercase whitespace-nowrap"
                    style={{
                      color:
                        t === "·" ? "var(--nav-accent)" : "var(--nav-fg-muted)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── VISION ── */}
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div
            ref={visionRef}
            className="fade-up grid md:grid-cols-2 gap-12 md:gap-20 items-center"
          >
            {/* Text */}
            <div>
              <p
                className="text-xs font-bold tracking-[0.18em] uppercase mb-4"
                style={{ color: "var(--nav-accent)" }}
              >
                Our Vision
              </p>
              <div
                className="line-grow h-0.5 mb-8"
                style={{ background: "var(--nav-accent)" }}
              />
              <p
                className="text-2xl md:text-3xl font-light leading-relaxed mb-6"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                  letterSpacing: "0.01em",
                }}
              >
                Created to redefine everyday comfort through{" "}
                <em style={{ color: "var(--nav-accent)", fontStyle: "italic" }}>
                  innovation
                </em>{" "}
                and{" "}
                <em style={{ color: "var(--nav-accent)", fontStyle: "italic" }}>
                  sustainability.
                </em>
              </p>
              <p
                className="text-sm md:text-base leading-relaxed"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                We specialize in premium products made from bamboo fabric —
                known for its softness, breathability, and eco-friendly
                properties. Our goal is to deliver comfort that feels good on
                your skin and is better for the planet.
              </p>
            </div>

            {/* Visual block */}
            <div className="relative">
              <div
                className="w-full aspect-square max-w-sm mx-auto flex flex-col items-center justify-center gap-3 p-10 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, #fff 0%, rgba(200,169,126,0.08) 100%)",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 4px 40px rgba(200,169,126,0.1)",
                }}
              >
                {/* Corner accents */}
                {[
                  "top-0 left-0",
                  "top-0 right-0",
                  "bottom-0 left-0",
                  "bottom-0 right-0",
                ].map((pos, i) => (
                  <div
                    key={i}
                    className={`absolute ${pos} w-6 h-6 pointer-events-none`}
                    style={{
                      borderTop: i < 2 ? "2px solid var(--nav-accent)" : "none",
                      borderBottom:
                        i >= 2 ? "2px solid var(--nav-accent)" : "none",
                      borderLeft:
                        i % 2 === 0 ? "2px solid var(--nav-accent)" : "none",
                      borderRight:
                        i % 2 === 1 ? "2px solid var(--nav-accent)" : "none",
                    }}
                  />
                ))}

                <Leaf
                  size={40}
                  strokeWidth={1}
                  style={{ color: "var(--nav-accent)", opacity: 0.7 }}
                />
                <p
                  className="text-4xl font-bold uppercase tracking-widest"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  Bamboo
                </p>
                <p
                  className="text-xs tracking-[0.2em] uppercase"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  fabric by nature
                </p>
                <div
                  className="w-8 h-px my-2"
                  style={{ background: "var(--nav-accent)" }}
                />
                <p
                  className="text-xs leading-relaxed max-w-[18ch]"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Soft · Breathable · Sustainable
                </p>
              </div>

              {/* Floating label */}
              <div
                className="absolute -bottom-4 -right-4 px-4 py-2 text-xs font-bold tracking-widest uppercase"
                style={{
                  background: "var(--nav-accent)",
                  color: "#fff",
                }}
              >
                Eco-First
              </div>
            </div>
          </div>
        </section>

        {/* ── PILLARS ── */}
        <section
          className="border-y"
          style={{
            borderColor: "var(--nav-border)",
            background: "rgba(200,169,126,0.04)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
            <p
              className="text-xs font-bold tracking-[0.18em] uppercase mb-10 text-center"
              style={{ color: "var(--nav-accent)" }}
            >
              What We Stand For
            </p>

            <div
              ref={pillarsRef}
              className="stagger-children grid grid-cols-2 md:grid-cols-4 gap-5"
            >
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.title}
                    className="pillar-card flex flex-col gap-4 p-6"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center"
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
                    <div>
                      <h3
                        className="text-xs font-bold uppercase tracking-[0.12em] mb-2"
                        style={{ color: "var(--nav-fg)" }}
                      >
                        {p.title}
                      </h3>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "var(--nav-fg-muted)" }}
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

        {/* ── CLOSING STATEMENT ── */}
        <section
          ref={closingRef}
          className="fade-up max-w-4xl mx-auto px-6 py-24 md:py-32 text-center"
        >
          <p
            className="text-xs font-bold tracking-[0.18em] uppercase mb-8"
            style={{ color: "var(--nav-accent)" }}
          >
            Our Promise
          </p>
          <blockquote
            className="text-4xl md:text-6xl font-bold uppercase leading-[1.05] tracking-wide mb-10"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            Wear the Comfort.
            <br />
            <span style={{ color: "var(--nav-accent)" }}>Wear Bambum.</span>
          </blockquote>

          <div className="flex items-center justify-center gap-4 mb-10">
            <div
              className="h-px w-12"
              style={{ background: "var(--nav-border)" }}
            />
            <Leaf size={14} style={{ color: "var(--nav-accent)" }} />
            <div
              className="h-px w-12"
              style={{ background: "var(--nav-border)" }}
            />
          </div>

          <a
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 text-xs font-bold tracking-[0.14em] uppercase transition-colors duration-200"
            style={{ background: "var(--nav-accent)", color: "#fff" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--nav-accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--nav-accent)")
            }
          >
            Shop the Collection
          </a>
        </section>
        <FAQ />
      </main>
    </>
  );
}
