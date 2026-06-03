"use client";

import Leaf from "@/public/homePage/leaf.svg";
import Cloud from "@/public/homePage/cloud.svg";
import Secured from "@/public/homePage/secured.svg";
import Wind from "@/public/homePage/wind.svg";
import Image from "next/image";
import Link from "next/link";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const features: FeatureCardProps[] = [
  {
    icon: Leaf.src,
    title: "Sustainable",
    description: "Eco- friendly bamboo\nfor a better planet",
  },
  {
    icon: Cloud.src,
    title: "Ultra Soft",
    description: "Silky smooth feel\nagainst your skin",
  },
  {
    icon: Wind.src,
    title: "Breathable",
    description: "Keeps you fresh\nall day long",
  },
  {
    icon: Secured.src,
    title: "Durable",
    description: "Quality that stays\nwith you",
  },
];

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-1.5 sm:gap-4">
      <div
        className="shrink-0 mt-0 sm:mt-0.5 w-7 sm:w-10 flex items-center justify-center"
        style={{ color: "var(--hero-feature-icon)" }}
        aria-hidden="true"
      >
        <Image
          src={icon}
          alt=""
          width={40}
          height={40}
          className="w-full h-auto"
        />
      </div>

      <div>
        <p
          className="text-[0.65rem] sm:text-[0.78rem] font-bold tracking-[0.08em] sm:tracking-[0.12em] uppercase mb-0.5 sm:mb-1"
          style={{
            color: "var(--hero-feature-title)",
            fontFamily: "var(--nav-font-ui)",
          }}
        >
          {title}
        </p>
        <p
          className="text-[0.55rem] sm:text-[0.75rem] leading-[1.35] sm:leading-[1.45] whitespace-pre-line"
          style={{
            color: "var(--hero-feature-body)",
            fontFamily: "var(--nav-font-ui)",
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      className="w-full pt-10 relative pb-28 md:pb-0"
      aria-label="Hero — Next-level comfort"
    >
      <div
        className="
          relative mx-auto overflow-hidden
          w-full
          h-[75vw] max-h-[500px] min-h-[400px]
          md:h-[52vw] md:max-h-[640px] md:min-h-[480px]
          bg-cover md:bg-contain bg-no-repeat

          /* Mobile image */
          [background-image:var(--hero-bg-mobile)]
          [background-position:center_right_60%]

          /* Desktop image */
          md:[background-image:var(--hero-bg-desktop)]
          md:[background-position:center_center]
        "
        role="img"
        aria-label="Man and woman wearing BAMBUMM bamboo essentials"
      >
        <div
          className="absolute inset-0 pointer-events-none md:hidden"
          style={{
            background:
              "linear-gradient(to bottom, transparent 50%, rgba(15,10,5,0.68) 100%)",
          }}
          aria-hidden="true"
        />

        <div
          className="
            hidden md:flex flex-col
            absolute
            top-[18%]
            left-[3.5%] lg:left-[4%] xl:left-[5%]
            max-w-[42%] lg:max-w-[40%]
          "
        >
          <p
            className="
              text-[0.62rem] lg:text-md 
              font-bold
              tracking-[0.2em] uppercase  mb-3 lg:mb-4
            "
            style={{
              color: "var(--hero-eyebrow)",
              fontFamily: "var(--nav-font-ui)",
            }}
          >
            Next - Level Comfort
          </p>
          <h1
            className="leading-[0.92] mb-4 lg:mb-5"
            style={{ fontFamily: "var(--nav-font)" }}
          >
            <span
              className="
                block text-medium font-bold tracking-[-0.01em]
                text-[clamp(2.6rem,5.2vw,5rem)]
              "
              style={{ color: "var(--hero-headline-dark)" }}
            >
              Feels Like
            </span>

            <span
              className="
                block font-bold tracking-[-0.01em]
                text-[clamp(2.6rem,5.2vw,5rem)]
              "
              style={{ color: "var(--hero-headline-warm)" }}
            >
              Clouds.
            </span>

            <span
              className="
                block font-bold tracking-[-0.01em]
                text-[clamp(2rem,4vw,3.8rem)]
              "
              style={{ color: "var(--hero-headline-warm)" }}
            >
              Performs Like You
            </span>
          </h1>

          <p
            className="
              text-[0.78rem] lg:text-[0.82rem]
              leading-[1.6] mb-6 lg:mb-7
              max-w-[240px] lg:max-w-[260px]
            "
            style={{
              color: "var(--hero-body)",
              fontFamily: "var(--nav-font-ui)",
            }}
          >
            Ultra-soft bamboo essentials designed for all-day comfort and modern
            living.
          </p>

          {/* CTA row */}
          <div className="flex flex-row items-center gap-5">
            <Link
              href="/products"
              className="
                rounded-lg inline-flex items-center justify-center
                px-6 py-3 lg:px-7 lg:py-3.5
                text-[0.65rem] font-bold tracking-[0.18em] uppercase
                transition-opacity duration-150 hover:opacity-85
              "
              style={{
                background: "var(--hero-cta-primary-bg)",
                color: "var(--hero-cta-primary-fg)",
                fontFamily: "var(--nav-font-ui)",
              }}
            >
              Shop Now
            </Link>
            <Link
              href="/products"
              className="
                inline-flex items-center gap-1
                text-[0.65rem] font-semibold tracking-[0.14em] uppercase
                transition-opacity duration-150 hover:opacity-60
              "
              style={{
                color: "var(--hero-cta-secondary-fg)",
                fontFamily: "var(--nav-font-ui)",
              }}
            >
              Explore Collections
              <span aria-hidden="true"> →</span>
            </Link>
          </div>
        </div>

        <div className="md:hidden absolute bottom-[5%] left-0 right-0 p-15 md:p-5 flex flex-col gap-3">
          <Link
            href="/products"
            className="
              w-full flex items-center justify-center
              py-3.5
              text-[0.72rem] font-bold tracking-[0.2em] uppercase
              transition-opacity duration-150 hover:opacity-90 rounded-sm
            "
            style={{
              background: "var(--hero-cta-primary-bg)",
              color: "var(--hero-cta-primary-fg)",
              fontFamily: "var(--nav-font-ui)",
            }}
          >
            Shop Now
          </Link>
          <Link
            href="/products"
            className="
              w-full flex items-center justify-center gap-1.5
              py-3
              text-[0.72rem] font-semibold tracking-[0.16em] uppercase
              border transition-opacity duration-150 hover:opacity-80 rounded-sm
            "
            style={{
              color: "var(--hero-cta-ghost-fg)",
              borderColor: "var(--hero-cta-ghost-border)",
              fontFamily: "var(--nav-font-ui)",
              background: "rgba(0,0,0,0.3)", // subtle backdrop for readability on mobile
            }}
          >
            Explore Collections →
          </Link>
        </div>
      </div>

      <div
        className="absolute -bottom-17 md:-bottom-0 left-1/2 -translate-x-1/2 w-[92%] md:w-full max-w-5xl z-[50] rounded-2xl shadow-sm border border-neutral-200/60"
        style={{ background: "var(--hero-feature-bg)" }}
      >
        <div
          className="
            max-w-full mx-auto
            px-4 sm:px-10 lg:px-8 xl:px-5
            py-5 sm:py-7 lg:py-5
            grid grid-cols-2 lg:grid-cols-4
            gap-x-3 gap-y-6 sm:gap-x-8 lg:gap-x-10
          "
        >
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
