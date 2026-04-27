"use client";

import { useEffect, useRef } from "react";

const CITIES = [
  {
    name: "TOKYO",
    subtitle: "VOLT",
    tagline: "Built for the hustle.",
    color: "#c8e600",
    href: "/products",
  },
  {
    name: "NEW YORK",
    subtitle: "PULSE",
    tagline: "Power through the pavement.",
    color: "#e8c4b8",
    href: "/products",
  },
  {
    name: "SYDNEY",
    subtitle: "GLIDE",
    tagline: "Smooth like the harbour.",
    color: "#b8d4e8",
    href: "/products",
  },
  {
    name: "PARIS",
    subtitle: "AURA",
    tagline: "Effortless and refined.",
    color: "#f0e8d8",
    href: "/products",
  },
  {
    name: "MIAMI",
    subtitle: "NOVA",
    tagline: "Sun, skin, and freedom.",
    color: "#e8b4b4",
    href: "/products",
  },
];

export default function ShopByCity() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("sbc-visible");
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
        .sbc-section { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .sbc-section.sbc-visible { opacity: 1; transform: translateY(0); }
        .sbc-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .sbc-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(0,0,0,0.15); }
        .sbc-card:hover .sbc-overlay { opacity: 0.6; }
        .sbc-overlay { transition: opacity 0.25s ease; opacity: 0.5; }
      `}</style>

      <section
        ref={sectionRef}
        className="sbc-section w-full py-10 md:py-14"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p
                className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-1"
                style={{ color: "var(--nav-accent)" }}
              >
                Collections
              </p>
              <h2
                className="text-2xl md:text-3xl font-bold uppercase tracking-widest"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
              >
                Shop by City
              </h2>
            </div>
            <a
              href="/products"
              className="text-xs font-bold tracking-[0.14em] uppercase transition-colors duration-150"
              style={{ color: "var(--nav-accent)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--nav-accent-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-accent)")
              }
            >
              View All
            </a>
          </div>

          {/* City Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CITIES.map((city) => (
              <a
                key={city.name}
                href={city.href}
                className="sbc-card relative overflow-hidden no-underline block"
                style={{ aspectRatio: "3/4", borderRadius: 0 }}
              >
                {/* Color Background */}
                <div
                  className="absolute inset-0"
                  style={{ background: city.color }}
                />

                {/* Overlay */}
                <div
                  className="sbc-overlay absolute inset-0"
                  style={{ background: "rgba(0,0,0,0.3)" }}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <p
                    className="text-[0.55rem] font-black tracking-[0.2em] uppercase"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    {city.name}
                  </p>
                  <p
                    className="text-lg md:text-xl font-black uppercase leading-tight"
                    style={{ color: "#fff", fontFamily: "var(--nav-font)" }}
                  >
                    {city.subtitle}
                  </p>
                  <p
                    className="text-[0.6rem] mt-1 leading-tight"
                    style={{ color: "rgba(255,255,255,0.8)" }}
                  >
                    {city.tagline}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
