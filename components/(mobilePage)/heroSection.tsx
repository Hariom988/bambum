"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "@/public/banner_image.png";
import banner2 from "@/public/banner_image2.png";
import banner3 from "@/public/banner_image3.png";
import banner4 from "@/public/banner_image4.png";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const SLIDES = [
  {
    id: 1,
    image: banner1,
    cta: { label: "SHOP BOXERS", href: "/" },
  },
  {
    id: 2,
    image: banner2,
    cta: { label: "UPCOMING", href: "/" },
  },
  {
    id: 3,
    image: banner3,
    cta: { label: "UPCOMING", href: "/" },
  },
  {
    id: 4,
    image: banner4,
    cta: { label: "UPCOMING", href: "/" },
  },
];

const AUTO_PLAY_MS = 3000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const count = SLIDES.length;
  const isReducedMotion = useReducedMotion();
  const touchStartX = useRef<number | null>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goTo = (index: number) => {
    setCurrent(index);
  };

  useEffect(() => {
    if (count < 2 || isReducedMotion || isHovered) return;

    const interval = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(interval);
  }, [count, next, isReducedMotion, isHovered]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <section
      className="relative w-full h-[70vh] min-h-100 overflow-hidden bg-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
    >
      {SLIDES.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              isActive
                ? "opacity-100 translate-x-0 z-10"
                : "opacity-0 pointer-events-none z-0"
            }`}
          >
            <div
              className={`relative w-full h-full transition-transform duration-5000 ease-out`}
            >
              <Image
                alt=""
                src={slide.image}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center select-none"
                draggable={false}
              />
            </div>

            {slide.cta && (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity duration-1000 delay-300 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              ></div>
            )}
          </div>
        );
      })}

      <div className="absolute inset-0 bg-liner-to-t from-black/30 via-transparent to-transparent pointer-events-none z-20" />

      {count > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 transition-all hover:bg-white hover:text-black shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 transition-all hover:bg-white hover:text-black shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-selected={i === current}
            className={`group relative h-3 transition-all duration-300 ${
              i === current ? "w-8" : "w-3"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          >
            <span
              className={`absolute inset-0 rounded-full transition-all ${
                i === current
                  ? "bg-(--nav-accent,white)"
                  : "bg-white/50 group-hover:bg-white/80"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
