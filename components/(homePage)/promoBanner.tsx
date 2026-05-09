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
      style={{ background: bgColor, minHeight: 200 }}
    >
      {/* Text block — width capped so image always has room */}
      <div
        className="relative z-10 flex flex-col justify-center p-3 min-[375px]:p-4 min-[480px]:p-5 md:p-8 flex-1 items-start"
        style={{ maxWidth: "52%" }}
      >
        {/* Title */}
        <h3
          className="font-bold uppercase leading-tight mb-0.5
                     text-base min-[360px]:text-lg min-[480px]:text-xl md:text-4xl"
          style={{
            fontFamily: "var(--nav-font)",
            color: fgColor,
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </h3>

        {/* Subtitle */}
        <p
          className="uppercase leading-tight mb-0.5
                     text-[0.6rem] min-[360px]:text-[0.65rem] min-[480px]:text-sm md:text-lg"
          style={{ color: fgColor }}
        >
          {subtitle}
        </p>

        {/* Tagline */}
        <p
          className="mb-3 min-[375px]:mb-4
                     text-[0.55rem] min-[360px]:text-[0.6rem] min-[480px]:text-xs md:text-sm"
          style={{ color: mutedColor }}
        >
          {tagline}
        </p>

        {/* CTA */}
        <Link
          href={ctaHref}
          className="rounded-md inline-flex items-center gap-1.5
                     px-2.5 py-1.5 min-[375px]:px-3 min-[375px]:py-2 min-[480px]:px-4 min-[480px]:py-2.5 md:px-5 md:py-3
                     font-bold uppercase tracking-[0.12em] transition-all duration-200
                     text-[0.55rem] min-[360px]:text-[0.6rem] min-[480px]:text-[0.65rem] md:text-[11px]"
          style={{
            background: "#fff",
            color: "var(--bg-color)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          {ctaLabel}
        </Link>
      </div>

      {/* Model image — absolute on the correct side */}
      <div
        className="absolute inset-y-0 bottom-0"
        style={{
          [imagePosition === "right" ? "right" : "left"]: 0,
          width: "52%",
        }}
        aria-hidden="true"
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className="w-full h-full"
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
      `}</style>

      <section
        className="w-full"
        style={{
          background: "var(--brand-background-page)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-10 md:pb-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-[375px]:gap-4 md:gap-5">
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
