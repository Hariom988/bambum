"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    title: "Genuinely the softest thing I've ever worn.",
    text: "I was skeptical about bamboo fabric but decided to try Bambumm after seeing the reviews. Absolutely blown away — these briefs feel like wearing nothing. I ordered three more sets within a week.",
    product: "Men's Brief – Black",
    initials: "PS",
  },
  {
    name: "Arjun Mehta",
    location: "Bangalore",
    rating: 5,
    title: "Finally, innerwear that doesn't scratch.",
    text: "My skin is super sensitive and regular cotton always causes irritation. These are a complete game-changer. Cool, soft, and no allergic reaction after two months of wearing them daily.",
    product: "Men's Brief – Grey",
    initials: "AM",
  },
  {
    name: "Sneha Kapoor",
    location: "Delhi",
    rating: 5,
    title: "Worth every rupee and more.",
    text: "The quality is exceptional. I've washed them over 30 times and they still feel brand new — no fading, no pilling, no stretching. This is how everyday wear should be.",
    product: "Men's Brief – Light Green",
    initials: "SK",
  },
  {
    name: "Rahul Verma",
    location: "Pune",
    rating: 5,
    title: "My go-to for workdays and gym days alike.",
    text: "Whether I'm in the office or working out, these stay comfortable all day. The breathability is real — I genuinely feel cooler compared to my old cotton underwear.",
    product: "Men's Brief – Orange",
    initials: "RV",
  },
  {
    name: "Anika Desai",
    location: "Hyderabad",
    rating: 5,
    title: "Eco-friendly and incredibly comfortable.",
    text: "I love that I'm making a sustainable choice without sacrificing quality. Bambumm has set a new standard for what I expect from everyday essentials. Already gifted pairs to my husband!",
    product: "Men's Brief – Black",
    initials: "AD",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < rating ? "#c8a97e" : "transparent"}
          strokeWidth={1.5}
          style={{ color: "#c8a97e" }}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const sectionRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (idx: number, dir: "left" | "right" = "right") => {
      if (isAnimating) return;
      setDirection(dir);
      setIsAnimating(true);
      setTimeout(() => {
        setActive(idx);
        setIsAnimating(false);
      }, 300);
    },
    [isAnimating],
  );

  const next = useCallback(() => {
    goTo((active + 1) % TESTIMONIALS.length, "right");
  }, [active, goTo]);

  const prev = useCallback(() => {
    goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length, "left");
  }, [active, goTo]);

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("tm-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const t = TESTIMONIALS[active];

  return (
    <>
      <style>{`
        .tm-section {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1);
        }
        .tm-section.tm-visible { opacity: 1; transform: translateY(0); }

        .tm-card-enter-right { animation: tmSlideRight 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        .tm-card-enter-left  { animation: tmSlideLeft  0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        .tm-card-exit        { animation: tmFadeOut    0.25s ease forwards; }

        @keyframes tmSlideRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes tmSlideLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes tmFadeOut {
          to { opacity: 0; }
        }

        .tm-dot {
          transition: width 0.3s ease, background 0.3s ease;
        }
        .tm-arrow {
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .tm-arrow:hover {
          background: #c8a97e !important;
          color: #fff !important;
          border-color: #c8a97e !important;
        }
      `}</style>

      <section
        className="w-full border-t border-b py-20 md:py-15"
        style={{
          background: "var(--ft-bg)",
          borderColor: "rgba(200,169,126,0.12)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div ref={sectionRef} className="tm-section max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-14">
            <p
              className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "#c8a97e" }}
            >
              What Our Customers Say
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--nav-font)", color: "#e8e0d0" }}
            >
              Real Reviews.
              <br />
              <span style={{ color: "#c8a97e" }}>Real Comfort.</span>
            </h2>
            <div className="flex items-center gap-3">
              <div
                className="h-px w-10"
                style={{ background: "rgba(200,169,126,0.2)" }}
              />
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#c8a97e" }}
              />
              <div
                className="h-px w-10"
                style={{ background: "rgba(200,169,126,0.2)" }}
              />
            </div>
          </div>

          {/* Main card */}
          <div
            className="relative mx-auto max-w-3xl"
            onMouseEnter={() => {
              if (intervalRef.current) clearInterval(intervalRef.current);
            }}
            onMouseLeave={() => {
              intervalRef.current = setInterval(next, 5000);
            }}
          >
            {/* Large quote mark */}
            <div
              className="absolute -top-6 -left-2 select-none pointer-events-none"
              aria-hidden="true"
            >
              <Quote
                size={64}
                style={{ color: "#c8a97e", opacity: 0.12 }}
                fill="#c8a97e"
                strokeWidth={0}
              />
            </div>

            <div
              className="relative p-8 md:p-12"
              style={{
                background: "rgba(200,169,126,0.06)",
                border: "1px solid rgba(200,169,126,0.18)",
              }}
            >
              {/* Gold top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "#c8a97e" }}
              />

              <div
                key={active}
                className={
                  isAnimating ? "tm-card-exit" : `tm-card-enter-${direction}`
                }
              >
                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <StarRating rating={t.rating} />
                  <span
                    className="text-[0.65rem] font-bold tracking-[0.14em] uppercase px-2 py-0.5"
                    style={{
                      background: "rgba(200,169,126,0.12)",
                      border: "1px solid rgba(200,169,126,0.2)",
                      color: "#c8a97e",
                    }}
                  >
                    Verified Purchase
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="text-xl md:text-2xl font-bold mb-4 leading-snug"
                  style={{ fontFamily: "var(--nav-font)", color: "#e8e0d0" }}
                >
                  &ldquo;{t.title}&rdquo;
                </h3>

                {/* Body */}
                <p
                  className="text-base leading-relaxed mb-8"
                  style={{ color: "#8a8070" }}
                >
                  {t.text}
                </p>

                {/* Author row */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div
                      className="w-11 h-11 flex items-center justify-center text-sm font-bold"
                      style={{
                        background: "rgba(200,169,126,0.15)",
                        border: "1px solid rgba(200,169,126,0.3)",
                        color: "#c8a97e",
                        fontFamily: "var(--nav-font)",
                      }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#e8e0d0" }}
                      >
                        {t.name}
                      </p>
                      <p className="text-xs" style={{ color: "#8a8070" }}>
                        {t.location}
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-[0.65rem] tracking-widest uppercase"
                    style={{ color: "rgba(200,169,126,0.6)" }}
                  >
                    {t.product}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > active ? "right" : "left")}
                    className="tm-dot h-1.5 rounded-full cursor-pointer"
                    style={{
                      width: i === active ? 32 : 8,
                      background:
                        i === active ? "#c8a97e" : "rgba(200,169,126,0.3)",
                      border: "none",
                    }}
                    aria-label={`Go to review ${i + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  className="tm-arrow w-10 h-10 flex items-center justify-center"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(200,169,126,0.25)",
                    color: "#8a8070",
                    cursor: "pointer",
                  }}
                  aria-label="Previous review"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={next}
                  className="tm-arrow w-10 h-10 flex items-center justify-center"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(200,169,126,0.25)",
                    color: "#8a8070",
                    cursor: "pointer",
                  }}
                  aria-label="Next review"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Aggregate rating bar */}
          <div
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 py-8 border-t"
            style={{ borderColor: "rgba(200,169,126,0.12)" }}
          >
            {[
              { label: "Average Rating", value: "5.0 / 5.0" },
              { label: "Happy Customers", value: "1,200+" },
              { label: "Repeat Buyers", value: "78%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center text-center"
              >
                <p
                  className="text-3xl font-bold leading-none mb-1"
                  style={{ fontFamily: "var(--nav-font)", color: "#c8a97e" }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "#8a8070" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
