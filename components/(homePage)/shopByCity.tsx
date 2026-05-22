"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import breathableFabric from "@/public/vectors/breathableFabric.svg";
import ecoFriendly from "@/public/vectors/ecoFriendly.svg";
import longLastingComfort from "@/public/vectors/longLastingComfort.svg";
import thermoRegulating from "@/public/vectors/thermoRegulating.svg";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CITIES = [
  {
    name: "TOKYO",
    subtitle: "VOLT",
    tagline: "BOLD.\nELECTRIC.",
    nameColor: "#c8e600",
    backgroundColorFrom: "#000000",
    backgroundColorTo: "#000000",
    image: "/shopByComponentImages/tokyo.png",
    href: "/products?category=Women",
  },
  {
    name: "NEW YORK",
    subtitle: "PULSE",
    tagline: "BUILT\nFOR THE\nHUSTLE.",
    nameColor: "#ffffff",
    backgroundColorFrom: "#19635E",
    backgroundColorTo: "#2DAFA7",
    image: "/shopByComponentImages/newyork.png",
    href: "/products?category=Men",
  },
  {
    name: "MIAMI",
    subtitle: "NOVA",
    tagline: "TURN THE\nVIBE ON.",
    nameColor: "#ffffff",
    backgroundColorFrom: "#AF886D",
    backgroundColorTo: "#524033",
    image: "/shopByComponentImages/miami.png",
    href: "/products?category=Women",
  },
  {
    name: "SYDNEY",
    subtitle: "GLIDE",
    tagline: "SMOOTH.\nLIGHT.\nEFFORTLESS.",
    nameColor: "#ffffff",
    backgroundColorFrom: "#000000",
    backgroundColorTo: "#000000",
    image: "/shopByComponentImages/sydney.png",
    href: "/products?category=Men",
  },
  {
    name: "PARIS",
    subtitle: "AURA",
    tagline: "SOFTNESS\nYOU FEEL.",
    nameColor: "#ffffff",
    backgroundColorFrom: "#AF886D",
    backgroundColorTo: "#524033",
    image: "/shopByComponentImages/paris.png",
    href: "/products?category=Women",
  },
];

const FEATURES = [
  { label: "Eco-Friendly", icon: breathableFabric.src },
  { label: "Breathable Fabric", icon: ecoFriendly.src },
  { label: "Thermo-Regulating", icon: longLastingComfort.src },
  { label: "Long-lasting Comfort", icon: thermoRegulating.src },
];

// 2 fully visible + ~0.3 peek of 3rd
const CARD_WIDTH_PERCENT = 44; // each card = 44% of container → 2 cards = 88% + 12% gap/peek
const GAP_PX = 12;
const MAX_INDEX = CITIES.length - 2; // can advance up to index 3

export default function ShopByCity() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((i) => Math.max(i - 1, 0));
  const next = () => setActiveIndex((i) => Math.min(i + 1, MAX_INDEX));

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-6");
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-10 md:py-10 opacity-0 translate-y-6 transition-all duration-700 ease-out"
      style={{ background: "var(--brand-background-page)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-5">
          <h2
            className="text-2xl md:text-3xl font-black uppercase tracking-widest"
            style={{ fontFamily: "var(--nav-font)", color: "black" }}
          >
            Shop by BAMBUMM
          </h2>
          <Link
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
          </Link>
        </div>

        {/* ── DESKTOP: unchanged flex row ── */}
        <div className="hidden md:flex gap-3">
          {CITIES.map((city) => (
            <Link
              key={city.name}
              href={city.href}
              className="relative flex-1 overflow-hidden rounded-xl cursor-pointer group no-underline"
              style={{ aspectRatio: "3/5" }}
            >
              <img
                src={city.image}
                alt={`${city.name} - ${city.subtitle}`}
                className="absolute right-0 z-[2] inset-0 w-full h-full object-contain object-right transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, ${city.backgroundColorFrom}, ${city.backgroundColorFrom}, ${city.backgroundColorTo})`,
                }}
              />
              <div className="absolute inset-0 flex flex-col justify-start p-4 md:p-5">
                <span
                  className="font-black uppercase tracking-wide leading-none text-sm md:text-base"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: city.nameColor,
                  }}
                >
                  {city.name}
                </span>
                <span
                  className="font-black uppercase leading-none text-white mt-1 text-2xl md:text-3xl lg:text-3xl"
                  style={{ fontFamily: "var(--nav-font)" }}
                >
                  {city.subtitle}
                </span>
                <span className="font-bold uppercase tracking-widest text-white/85 mt-2 text-[0.6rem] md:text-[0.65rem] leading-relaxed whitespace-pre-line">
                  {city.tagline}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ── MOBILE: 2 cards + ~0.3 peek, JS-controlled ── */}
        <div className="md:hidden">
          {/* Overflow hidden on wrapper, NOT on inner track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                gap: `${GAP_PX}px`,
                // shift by (card width + gap) per step
                transform: `translateX(calc(-${activeIndex} * (${CARD_WIDTH_PERCENT}% + ${GAP_PX}px)))`,
              }}
            >
              {CITIES.map((city) => (
                <Link
                  key={city.name}
                  href={city.href}
                  className="relative flex-shrink-0 overflow-hidden rounded-xl cursor-pointer group no-underline"
                  style={{
                    width: `${CARD_WIDTH_PERCENT}%`,
                    aspectRatio: "3/5",
                  }}
                >
                  <img
                    src={city.image}
                    alt={`${city.name} - ${city.subtitle}`}
                    className="absolute inset-0 w-full h-full object-contain object-right transition-transform duration-500 ease-out group-hover:scale-105 z-10"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to bottom, ${city.backgroundColorFrom}, ${city.backgroundColorFrom}, ${city.backgroundColorTo})`,
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col justify-start p-3 z-20">
                    <span
                      className="font-black uppercase tracking-wide leading-none text-[0.6rem] min-[375px]:text-[0.65rem]"
                      style={{
                        fontFamily: "var(--nav-font)",
                        color: city.nameColor,
                      }}
                    >
                      {city.name}
                    </span>
                    <span
                      className="font-black uppercase leading-none text-white mt-1 text-lg min-[375px]:text-xl"
                      style={{ fontFamily: "var(--nav-font)" }}
                    >
                      {city.subtitle}
                    </span>
                    <span className="font-bold uppercase tracking-widest text-white/85 mt-1 text-[0.5rem] min-[375px]:text-[0.55rem] leading-relaxed whitespace-pre-line">
                      {city.tagline}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Arrows — right-aligned below cards */}
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              onClick={prev}
              disabled={activeIndex === 0}
              className="p-2 rounded-full border transition-opacity duration-200 disabled:opacity-30 active:scale-95"
              style={{
                borderColor: "var(--nav-accent)",
                color: "var(--nav-accent)",
              }}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              disabled={activeIndex === MAX_INDEX}
              className="p-2 rounded-full border transition-opacity duration-200 disabled:opacity-30 active:scale-95"
              style={{
                borderColor: "var(--nav-accent)",
                color: "var(--nav-accent)",
              }}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* ── Features: 2-col grid, responsive down to 320px ── */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 min-[375px]:gap-3 bg-[#F8F9FA] rounded-xl p-3 min-[375px]:p-4 md:p-5"
            >
              {/* Icon — shrinks icon padding on very small screens */}
              <div className="bg-[#EEF2F1] text-[#134D41] p-2.5 min-[375px]:p-3 min-[400px]:p-3.5 rounded-2xl flex-shrink-0">
                <Image
                  src={feature.icon}
                  alt={feature.label}
                  width={20}
                  height={20}
                  className="min-[375px]:w-6 min-[375px]:h-6"
                />
              </div>
              <span className="text-[#111111] text-[0.7rem] min-[360px]:text-[0.75rem] min-[400px]:text-[0.85rem] md:text-[0.95rem] font-serif tracking-wide leading-tight">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
