"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import banner1 from "@/public/banner_image.png";
import banner2 from "@/public/banner_image2.png";
import banner3 from "@/public/banner_image3.png";
import banner4 from "@/public/banner_image5.jpeg";
import banner6 from "@/public/banner_image6.png";

const SLIDES = [
  { id: 5, image: banner6 },
  { id: 1, image: banner2 },
  { id: 3, image: banner3 },
  { id: 4, image: banner4 },
  { id: 2, image: banner1 },
];

const AUTO_PLAY_MS = 4000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const count = SLIDES.length;
  const isReducedMotion = useReducedMotion();
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => setCurrent((p) => (p + 1) % count), [count]);
  const prev = useCallback(
    () => setCurrent((p) => (p - 1 + count) % count),
    [count],
  );

  useEffect(() => {
    if (count < 2 || isReducedMotion || isHovered) return;
    const id = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, [count, next, isReducedMotion, isHovered]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "100svh", minHeight: 500, maxHeight: 800 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
          }}
        >
          <Image
            src={slide.image}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-top select-none"
            draggable={false}
          />
        </div>
      ))}

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.1) 100%)",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <p
          className="text-sm md:text-base font-semibold tracking-[0.2em] uppercase mb-3"
          style={{ color: "var(--nav-accent)" }}
        >
          Innerwear that moves with you.
        </p>

        <h1
          className="font-black uppercase leading-none mb-6"
          style={{
            fontFamily: "var(--nav-font)",
            fontSize: "clamp(3.5rem, 12vw, 9rem)",
            color: "#fff",
            letterSpacing: "-0.02em",
            lineHeight: 0.88,
          }}
        >
          <span
            className="block"
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "0.45em",
              letterSpacing: "0.12em",
            }}
          >
            FEEL THE
          </span>
          CITY
        </h1>

        <div className="flex gap-3 mt-2">
          <a
            href="/products?category=Men"
            className="inline-flex items-center px-6 py-3 text-xs font-bold tracking-[0.18em] uppercase transition-all duration-200"
            style={{
              background: "var(--nav-accent)",
              color: "#fff",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--nav-accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--nav-accent)")
            }
          >
            SHOP MEN
          </a>
          <a
            href="/products?category=Women"
            className="inline-flex items-center px-6 py-3 text-xs font-bold tracking-[0.18em] uppercase transition-all duration-200"
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.7)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#fff";
            }}
          >
            SHOP WOMEN
          </a>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              background:
                i === current ? "var(--nav-accent)" : "rgba(255,255,255,0.5)",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
