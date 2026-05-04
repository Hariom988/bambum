"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import breathableFabric from "@/public/vectors/breathableFabric.svg";
import ecoFriendly from "@/public/vectors/ecoFriendly.svg";
import longLastingComfort from "@/public/vectors/longLastingComfort.svg";
import thermoRegulating from "@/public/vectors/thermoRegulating.svg";
import Image from "next/image";
const CITIES = [
  {
    name: "TOKYO",
    subtitle: "VOLT",
    tagline: "BOLD.\nELECTRIC.",
    nameColor: "#c8e600",
    backgroundColorFrom: "#000000",
    backgroundColorTo: "#000000",
    image: "/shopByComponentImages/tokyo.png",
    href: "/products",
  },
  {
    name: "NEW YORK",
    subtitle: "PULSE",
    tagline: "BUILT\nFOR THE\nHUSTLE.",
    nameColor: "#ffffff",
    backgroundColorFrom: "#19635E",
    backgroundColorTo: "#2DAFA7",
    image: "/shopByComponentImages/newyork.png",
    href: "/products",
  },
  {
    name: "MIAMI",
    subtitle: "NOVA",
    tagline: "TURN THE\nVIBE ON.",
    nameColor: "#ffffff",
    backgroundColorFrom: "#AF886D",
    backgroundColorTo: "#524033",
    image: "/shopByComponentImages/miami.png",
    href: "/products",
  },
  {
    name: "SYDNEY",
    subtitle: "GLIDE",
    tagline: "SMOOTH.\nLIGHT.\nEFFORTLESS.",
    nameColor: "#ffffff",
    backgroundColorFrom: "#000000",
    backgroundColorTo: "#000000",
    image: "/shopByComponentImages/sydney.png",
    href: "/products",
  },
  {
    name: "PARIS",
    subtitle: "AURA",
    tagline: "SOFTNESS\nYOU FEEL.",
    nameColor: "#ffffff",
    backgroundColorFrom: "#AF886D",
    backgroundColorTo: "#524033",
    image: "/shopByComponentImages/paris.png",
    href: "/products",
  },
];
const FEATURES = [
  {
    label: "Eco-Friendly",
    icon: breathableFabric.src,
  },
  {
    label: "Breathable Fabric",
    icon: ecoFriendly.src,
  },
  {
    label: "Thermo-Regulating",
    icon: longLastingComfort.src,
  },
  {
    label: "Long-lasting Comfort",
    icon: thermoRegulating.src,
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
      style={{ background: "var(--nav-bg)" }}
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

        {/* Cards */}
        <div className="flex gap-3">
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
                className="absolute right-0 z-2 inset-0 w-full h-full object-contain object-right transition-transform duration-500 ease-out group-hover:scale-105"
              />

              {/* Dark gradient overlay */}
              <div
                className={`absolute inset-0`}
                style={{
                  background: `linear-gradient(to bottom, ${city.backgroundColorFrom}, ${city.backgroundColorFrom}, ${city.backgroundColorTo})`,
                }}
              />

              {/* Text content */}
              <div className="absolute inset-0 flex flex-col justify-start p-4 md:p-5">
                {/* City name */}
                <span
                  className="font-black uppercase tracking-wide leading-none text-sm md:text-base"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: city.nameColor,
                  }}
                >
                  {city.name}
                </span>

                {/* Product subtitle */}
                <span
                  className="font-black uppercase leading-none text-white mt-1 text-2xl md:text-3xl lg:text-3xl"
                  style={{ fontFamily: "var(--nav-font)" }}
                >
                  {city.subtitle}
                </span>

                {/* Tagline */}
                <span className="font-bold uppercase tracking-widest text-white/85 mt-2 text-[0.6rem] md:text-[0.65rem] leading-relaxed whitespace-pre-line">
                  {city.tagline}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* New Features Section */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 bg-[#F8F9FA] rounded-xl p-4 md:p-5"
            >
              {/* Icon Container */}
              <div className="bg-[#EEF2F1] text-[#134D41] p-3.5 rounded-2xl flex-shrink-0">
                <Image
                  src={feature.icon}
                  alt={feature.label}
                  width={24}
                  height={24}
                />
              </div>
              {/* Feature Text */}
              <span className="text-[#111111] text-[0.95rem] font-serif tracking-wide leading-tight">
                {feature.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
