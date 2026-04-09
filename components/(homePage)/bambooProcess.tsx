"use client";

import { useEffect, useRef } from "react";
import { Leaf, Droplets, Shirt, PackageCheck, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon: Leaf,
    number: "01",
    title: "Sustainably Harvested",
    description:
      "Our bamboo is grown without pesticides or artificial irrigation. It self-regenerates, needing no replanting — just rain and sunlight.",
    accent: "Grows 3 ft/day",
  },
  {
    icon: Droplets,
    number: "02",
    title: "Mechanically Processed",
    description:
      "We use a closed-loop mechanical process to extract bamboo fibres, preserving the natural properties without harsh chemical bleaching.",
    accent: "Chemical-free",
  },
  {
    icon: Shirt,
    number: "03",
    title: "Precision Knitted",
    description:
      "Fibres are spun into ultra-fine yarn and knitted with micro-ventilation channels that give Bambumm its signature breathability.",
    accent: "4-way stretch",
  },
  {
    icon: PackageCheck,
    number: "04",
    title: "Quality Certified & Shipped",
    description:
      "Every piece is inspected against our comfort standard before it leaves our facility — if it doesn't pass, it doesn't reach you.",
    accent: "100% inspected",
  },
];

export default function BambooProcess() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("bp-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("bp-steps-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .bp-header {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .bp-header.bp-visible { opacity: 1; transform: translateY(0); }

        .bp-steps > * { opacity: 0; transform: translateX(-20px); }
        .bp-steps.bp-steps-visible > *:nth-child(1) { animation: bpSlide 0.65s 0.05s cubic-bezier(0.22,1,0.36,1) forwards; }
        .bp-steps.bp-steps-visible > *:nth-child(2) { animation: bpSlide 0.65s 0.2s  cubic-bezier(0.22,1,0.36,1) forwards; }
        .bp-steps.bp-steps-visible > *:nth-child(3) { animation: bpSlide 0.65s 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        .bp-steps.bp-steps-visible > *:nth-child(4) { animation: bpSlide 0.65s 0.5s  cubic-bezier(0.22,1,0.36,1) forwards; }

        @keyframes bpSlide {
          to { opacity: 1; transform: translateX(0); }
        }

        .bp-step-card {
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .bp-step-card:hover {
          border-color: #c8a97e !important;
          box-shadow: 0 8px 32px rgba(200,169,126,0.12);
        }

        .bp-line-grow {
          width: 0;
          transition: width 1.2s 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .bp-header.bp-visible .bp-line-grow { width: 64px; }

        @keyframes bpPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
        .bp-dot { animation: bpPulse 2.4s ease-in-out infinite; }
      `}</style>

      <section
        className="w-full py-10"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div
            ref={sectionRef}
            className="bp-header grid md:grid-cols-2 gap-12 items-end mb-16"
          >
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 text-xs font-semibold tracking-[0.14em] uppercase"
                style={{
                  background: "rgba(200,169,126,0.12)",
                  border: "1px solid #e0d8cc",
                  color: "#c8a97e",
                }}
              >
                <span
                  className="bp-dot inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "#c8a97e" }}
                />
                From Bamboo to You
              </div>

              <h2
                className="text-4xl md:text-5xl font-bold uppercase tracking-wide leading-tight mb-5"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
              >
                How We Make
                <br />
                <span style={{ color: "#c8a97e" }}>Every Piece.</span>
              </h2>

              <div
                className="bp-line-grow h-0.5 mb-5"
                style={{ background: "#c8a97e" }}
              />

              <p
                className="text-base leading-relaxed max-w-md"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                From the bamboo forest to your drawer — our four-step process
                ensures every Bambumm product delivers on its promise of comfort
                and conscience.
              </p>
            </div>

            {/* Right side decorative block */}
            <div className="hidden md:flex justify-end">
              <div
                className="relative w-64 h-64 flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(200,169,126,0.08) 0%, rgba(200,169,126,0.02) 100%)",
                  border: "1px solid #e0d8cc",
                }}
              >
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
                    className={`absolute ${pos} w-6 h-6`}
                    style={{
                      borderTop: i < 2 ? "2px solid #c8a97e" : "none",
                      borderBottom: i >= 2 ? "2px solid #c8a97e" : "none",
                      borderLeft: i % 2 === 0 ? "2px solid #c8a97e" : "none",
                      borderRight: i % 2 === 1 ? "2px solid #c8a97e" : "none",
                    }}
                  />
                ))}

                <div className="text-center">
                  <Leaf
                    size={48}
                    strokeWidth={0.75}
                    style={{
                      color: "#c8a97e",
                      opacity: 0.6,
                      margin: "0 auto 12px",
                    }}
                  />
                  <p
                    className="text-xs font-bold tracking-[0.2em] uppercase"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Nature-first
                  </p>
                  <p
                    className="text-xs tracking-[0.15em] uppercase mt-1"
                    style={{ color: "#c8a97e" }}
                  >
                    manufacturing
                  </p>
                </div>

                {/* Floating label */}
                <div
                  className="absolute -bottom-4 -right-4 px-3 py-1.5 text-[0.65rem] font-bold tracking-widest uppercase"
                  style={{ background: "#c8a97e", color: "#fff" }}
                >
                  Est. India
                </div>
              </div>
            </div>
          </div>

          {/* Steps */}
          <div
            ref={stepsRef}
            className="bp-steps grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 relative"
          >
            {/* Connector line (desktop) */}
            <div
              className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px"
              style={{ background: "#e0d8cc" }}
              aria-hidden="true"
            />

            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === STEPS.length - 1;
              return (
                <div key={step.number} className="relative flex flex-col">
                  {/* Mobile connector arrow */}
                  {!isLast && (
                    <div className="lg:hidden flex justify-start pl-8 py-2">
                      <ArrowRight size={14} style={{ color: "#e0d8cc" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom callout */}
          <div
            className="mt-12 p-8 flex flex-col md:flex-row items-center justify-between gap-6"
            style={{
              background: "rgba(200,169,126,0.06)",
              border: "1px solid #e0d8cc",
            }}
          >
            <div className="flex items-center gap-5">
              <div
                className="w-12 h-12 flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(200,169,126,0.12)",
                  border: "1px solid #e0d8cc",
                }}
              >
                <Leaf
                  size={20}
                  style={{ color: "#c8a97e" }}
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p
                  className="text-sm font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: "var(--nav-fg)" }}
                >
                  Every purchase plants a seed.
                </p>
                <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
                  We donate a portion of every sale toward bamboo reforestation
                  programs in India.
                </p>
              </div>
            </div>
            <a
              href="/aboutus"
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold tracking-[0.12em] uppercase shrink-0 transition-colors duration-200"
              style={{ background: "#c8a97e", color: "#fff" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#a8845a")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#c8a97e")
              }
            >
              Our Story →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
