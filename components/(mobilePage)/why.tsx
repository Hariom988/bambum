"use client";

import { useEffect, useRef } from "react";
import { Leaf, Sparkles, ShieldCheck, Zap, Recycle, Heart } from "lucide-react";

const FEATURES = [
  {
    icon: Leaf,
    title: "100% Bamboo Fabric",
    description:
      "Our fabrics are sourced from responsibly grown bamboo — no pesticides, no chemicals, just pure nature engineered for your skin.",
    stat: "3x",
    statLabel: "softer than cotton",
  },
  {
    icon: Zap,
    title: "Thermo-Regulating",
    description:
      "Bamboo fibres actively regulate body temperature, keeping you cool in summer and warm in winter — naturally.",
    stat: "40%",
    statLabel: "more breathable",
  },
  {
    icon: ShieldCheck,
    title: "Hypoallergenic",
    description:
      "Ideal for sensitive skin. Our bamboo blend is free from harsh dyes and synthetic irritants — gentle by design.",
    stat: "0",
    statLabel: "synthetic additives",
  },
  {
    icon: Recycle,
    title: "Eco-Responsible",
    description:
      "Bamboo regenerates in months, not decades. Every purchase supports a planet-positive supply chain.",
    stat: "80%",
    statLabel: "less water used",
  },
  {
    icon: Sparkles,
    title: "Long-Lasting Comfort",
    description:
      "Our construction ensures the fabric stays soft wash after wash — no pilling, no shrinkage, no compromise.",
    stat: "50+",
    statLabel: "washes & still soft",
  },
  {
    icon: Heart,
    title: "Made for Everyday",
    description:
      "Designed for the skin you live in — whether it's a long workday or a lazy weekend, Bambumm moves with you.",
    stat: "24/7",
    statLabel: "all-day wear",
  },
];

export default function WhyUs() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("wu-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(section);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const cards = cardsRef.current;
    if (!cards) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.classList.add("wu-cards-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(cards);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .wu-section {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1);
        }
        .wu-section.wu-visible { opacity: 1; transform: translateY(0); }

        .wu-cards > * {
          opacity: 0;
          transform: translateY(28px);
        }
        .wu-cards.wu-cards-visible > *:nth-child(1) { animation: wuFadeUp 0.6s 0.05s cubic-bezier(0.22,1,0.36,1) forwards; }
        .wu-cards.wu-cards-visible > *:nth-child(2) { animation: wuFadeUp 0.6s 0.15s cubic-bezier(0.22,1,0.36,1) forwards; }
        .wu-cards.wu-cards-visible > *:nth-child(3) { animation: wuFadeUp 0.6s 0.25s cubic-bezier(0.22,1,0.36,1) forwards; }
        .wu-cards.wu-cards-visible > *:nth-child(4) { animation: wuFadeUp 0.6s 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        .wu-cards.wu-cards-visible > *:nth-child(5) { animation: wuFadeUp 0.6s 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
        .wu-cards.wu-cards-visible > *:nth-child(6) { animation: wuFadeUp 0.6s 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }

        @keyframes wuFadeUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .wu-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .wu-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(200,169,126,0.16);
          border-color: #c8a97e !important;
        }
        .wu-card:hover .wu-icon-wrap {
          background: rgba(200,169,126,0.2) !important;
        }
        .wu-icon-wrap {
          transition: background 0.25s ease;
        }
      `}</style>

      <section
        className="w-full py-10"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        {/* Header */}
        <div ref={sectionRef} className="wu-section max-w-6xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 text-xs font-semibold tracking-[0.14em] uppercase"
              style={{
                background: "rgba(200,169,126,0.12)",
                border: "1px solid #e0d8cc",
                color: "#c8a97e",
              }}
            >
              <Leaf size={11} strokeWidth={2.5} />
              The Bambumm Difference
            </div>

            <h2
              className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-5 leading-tight"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
            >
              Why Choose <span style={{ color: "#c8a97e" }}>Bambumm?</span>
            </h2>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-10" style={{ background: "#e0d8cc" }} />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#c8a97e" }}
              />
              <div className="h-px w-10" style={{ background: "#e0d8cc" }} />
            </div>

            <p
              className="text-base md:text-lg leading-relaxed max-w-2xl"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              We didn't just make underwear. We rethought what everyday fabric
              should feel like — starting from the ground up, with bamboo.
            </p>
          </div>

          {/* Cards grid */}
          <div
            ref={cardsRef}
            className="wu-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="wu-card relative flex flex-col gap-5 p-7"
                  style={{
                    background: "#fff",
                    border: "1px solid #e0d8cc",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                  }}
                >
                  {/* Stat badge */}
                  <div className="absolute top-5 right-5 text-right">
                    <p
                      className="text-xl font-bold leading-none"
                      style={{
                        fontFamily: "var(--nav-font)",
                        color: "#c8a97e",
                      }}
                    >
                      {feature.stat}
                    </p>
                    <p
                      className="text-[0.6rem] tracking-widest uppercase"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      {feature.statLabel}
                    </p>
                  </div>

                  {/* Icon */}
                  <div
                    className="wu-icon-wrap w-12 h-12 flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(200,169,126,0.1)",
                      border: "1px solid #e0d8cc",
                    }}
                  >
                    <Icon
                      size={20}
                      style={{ color: "#c8a97e" }}
                      strokeWidth={1.75}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col gap-2 pr-10">
                    <h3
                      className="text-sm font-bold uppercase tracking-widest"
                      style={{ color: "var(--nav-fg)" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div
          className="mt-16 border-t border-b"
          style={{
            borderColor: "#e0d8cc",
            background: "rgba(200,169,126,0.05)",
          }}
        >
          <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p
                className="text-xl md:text-2xl font-bold uppercase tracking-wide"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
              >
                Feel the difference from day one.
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Your skin deserves better than synthetic fabric.
              </p>
            </div>
            <a
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 text-xs font-bold tracking-[0.14em] uppercase shrink-0 transition-colors duration-200"
              style={{ background: "#c8a97e", color: "#fff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#a8845a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#c8a97e")
              }
            >
              Shop Now
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
