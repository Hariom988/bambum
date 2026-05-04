"use client";

import { useEffect, useRef } from "react";

const COLLECTIONS = [
  {
    id: "roots",
    eyebrow: "ROOTS",
    title: "Everyday Comfort",
    desc: "Grounded in nature. The everyday brief engineered from bamboo for all-day wear.",
    cta: "SHOP ROOTS",
    href: "/products?category=Men",
    accent: "#4a6741",
    bg: "rgba(74,103,65,0.08)",
    border: "rgba(74,103,65,0.2)",
  },
  {
    id: "lunara",
    eyebrow: "LUNARA",
    title: "Soft Power",
    desc: "Strength in softness. Designed for women who live without compromise.",
    cta: "EXPLORE LUNARA",
    href: "/products?category=Women",
    accent: "#c8a97e",
    bg: "rgba(200,169,126,0.08)",
    border: "rgba(200,169,126,0.25)",
  },
];

export default function CollectionsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("col-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .col-section { opacity: 0; transform: translateY(24px); transition: opacity 0.75s ease, transform 0.75s ease; }
        .col-section.col-visible { opacity: 1; transform: translateY(0); }
        .col-card { transition: border-color 0.25s ease, box-shadow 0.25s ease; }
        .col-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
      `}</style>

      <section
        ref={sectionRef}
        className="col-section w-full py-10 md:py-14"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-4">
            {COLLECTIONS.map((col) => (
              <div
                key={col.id}
                className="col-card relative overflow-hidden"
                style={{
                  background: col.bg,
                  border: `1px solid ${col.border}`,
                  minHeight: 200,
                }}
              >
                <div
                  className="p-8 md:p-10 flex flex-col justify-between h-full"
                  style={{ minHeight: 200 }}
                >
                  {/* Text */}
                  <div>
                    <p
                      className="text-[0.65rem] font-black tracking-[0.24em] uppercase mb-2"
                      style={{ color: col.accent }}
                    >
                      {col.eyebrow}
                    </p>
                    <h3
                      className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-3"
                      style={{
                        fontFamily: "var(--nav-font)",
                        color: "var(--nav-fg)",
                      }}
                    >
                      {col.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed max-w-xs mb-6"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      {col.desc}
                    </p>
                  </div>

                  {/* CTA */}
                  <a
                    href={col.href}
                    className="self-start inline-flex items-center px-6 py-3 text-xs font-bold tracking-[0.16em] uppercase transition-all duration-200"
                    style={{
                      background: col.accent,
                      color: "#fff",
                      border: "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.85")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    {col.cta}
                  </a>
                </div>

                {/* Decorative large text */}
                <div
                  className="absolute -bottom-4 -right-2 select-none pointer-events-none"
                  aria-hidden="true"
                  style={{
                    fontFamily: "var(--nav-font)",
                    fontSize: "clamp(4rem, 12vw, 8rem)",
                    fontWeight: 900,
                    color: "transparent",
                    WebkitTextStroke: `1px ${col.border}`,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {col.eyebrow}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
