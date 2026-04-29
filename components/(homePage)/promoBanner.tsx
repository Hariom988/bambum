"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

interface BannerProps {
  title: string;
  subtitle: string;
  tagline: string;
  ctaLabel: string;
  ctaHref: string;
  imageSrc: string;
  imageAlt?: string;
  theme?: "dark" | "warm";
  imagePosition?: "left" | "right";
}

export function PromoBanner({
  title,
  subtitle,
  tagline,
  ctaLabel,
  ctaHref,
  imageSrc,
  imageAlt = "",
  theme = "dark",
  imagePosition = "right",
}: BannerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("pb-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const bgColor =
    theme === "dark" ? "var(--promo-dark-bg)" : "var(--promo-warm-bg)";
  const fgColor =
    theme === "dark" ? "var(--promo-dark-fg)" : "var(--promo-warm-fg)";
  const mutedColor =
    theme === "dark" ? "var(--promo-dark-muted)" : "var(--promo-warm-muted)";

  return (
    <div
      ref={ref}
      className="rounded-md relative overflow-hidden flex flex-col"
      style={{ background: bgColor, minHeight: 280 }}
    >
      <div
        className={`pb-text-block relative z-10 flex flex-col justify-center p-6 md:p-8 flex-1 ${
          imagePosition === "right" ? "items-start" : "items-start"
        }`}
        style={{ maxWidth: imagePosition === "right" ? "55%" : "55%" }}
      >
        <h3
          className="pb-title text-2xl md:text-4xl font-bold uppercase leading-tight mb-1"
          style={{
            fontFamily: "var(--nav-font)",
            color: fgColor,
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </h3>
        <p
          className="pb-title text-md md:text-lg uppercase leading-tight mb-1"
          style={{
            color: fgColor,
          }}
        >
          {subtitle}
        </p>
        <p
          className="pb-tagline text-xs md:text-sm mb-5"
          style={{ color: mutedColor }}
        >
          {tagline}
        </p>
        <Link
          href={ctaHref}
          className="pb-cta rounded-md inline-flex items-center gap-2 px-5 py-3 text-[11px] font-bold tracking-[0.16em] uppercase transition-all duration-200"
          style={{
            background: "#fff",
            color: "var( --bg-color)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var( --bg-color)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#1a1a1a";
          }}
        >
          {ctaLabel}
        </Link>
      </div>

      {/* Model Image — absolute positioned on the correct side */}
      <div
        className="absolute inset-y-0 bottom-0"
        style={{
          [imagePosition === "right" ? "right" : "left"]: 0,
          width: "55%",
        }}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full object-cover object-top"
          style={{ objectFit: "cover", objectPosition: "top center" }}
        />
      </div>
    </div>
  );
}
export default function PromoBanners() {
  return (
    <>
      <style>{`
        @keyframes pbFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        img:hover {
          transform: scale(1.03);
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        img:hover {
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>

      <section
        className="w-full"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-10 md:pb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <PromoBanner
              theme="dark"
              title="BAMBUMM"
              subtitle="Everyday Comfort"
              tagline="Naturally soft. Made for everyone"
              ctaLabel="SHOP NOW"
              ctaHref="/products"
              imageSrc="/promoBanner/banner_image1.png"
              imageAlt="Bambumm everyday comfort model"
              imagePosition="right"
            />
            <PromoBanner
              theme="warm"
              title="LOUNGE BRA"
              subtitle="Soft Power"
              tagline="Naturally soft. Made for everyone"
              ctaLabel="EXPLORE NOW"
              ctaHref="/products?category=Women"
              imageSrc="/promoBanner/banner_image2.png"
              imageAlt="Lounge Bra Soft Power model"
              imagePosition="right"
            />
          </div>
        </div>
      </section>
    </>
  );
}
