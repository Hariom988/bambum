"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

interface Testimonial {
  _id: string;
  name: string;
  rating: number;
  text: string;
  title: string;
  initials: string;
  location?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? "var(--ft-fg)" : "rgba(41,177,168,0.25)"}
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function TestimonialCard({ name, rating, text, title, initials }: Testimonial) {
  return (
    <div
      className="flex flex-col gap-3.5 rounded-xl p-6 h-full"
      style={{
        background: "var(--tm-card-bg)",
        border: "1px solid var(--tm-card-border)",
      }}
    >
      <StarRating rating={rating} />

      {title && (
        <p
          className="text-[11px] font-bold tracking-widest uppercase m-0"
          style={{ color: "var(--ft-fg)", fontFamily: "var(--nav-font-ui)" }}
        >
          {title}
        </p>
      )}

      <p
        className="flex-1 text-[0.9rem] leading-relaxed m-0"
        style={{ color: "var(--tm-body-fg)", fontFamily: "var(--nav-font-ui)" }}
      >
        &ldquo;{text}&rdquo;
      </p>

      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[0.65rem] font-bold shrink-0"
          style={{
            background: "rgba(41,177,168,0.15)",
            border: "1px solid rgba(41,177,168,0.3)",
            color: "var(--ft-fg)",
            fontFamily: "var(--nav-font)",
          }}
        >
          {initials}
        </div>
        <div>
          <p
            className="text-[0.8rem] font-semibold m-0"
            style={{ color: "var(--ft-fg)", fontFamily: "var(--nav-font-ui)" }}
          >
            {name}
          </p>
          <p
            className="text-[0.7rem] m-0"
            style={{
              color: "var(--tm-meta-fg)",
              fontFamily: "var(--nav-font-ui)",
            }}
          >
            Verified Customer
          </p>
        </div>
      </div>
    </div>
  );
}

const CARDS_DESKTOP = 3;
const CARDS_MOBILE = 1;

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch("/api/content/testimonials")
      .then((r) => r.json())
      .then((d) => setTestimonials(d.items || []))
      .catch(() => setTestimonials([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const perPage = isMobile ? CARDS_MOBILE : CARDS_DESKTOP;
  const maxIndex = Math.max(0, testimonials.length - perPage);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setIndex((i) => Math.min(maxIndex, i + 1)),
    [maxIndex],
  );

  // Reset index if resizing causes it to go out of bounds
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const avgRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((sum, t) => sum + t.rating, 0) /
          testimonials.length
        ).toFixed(1)
      : "—";

  const totalCount = testimonials.length;
  const canPrev = index > 0;
  const canNext = index < maxIndex;

  return (
    <>
      <style>{`
        :root {
          --tm-card-bg: #1a1a1a;
          --tm-card-border: rgba(255,255,255,0.06);
          --tm-body-fg: rgba(255,255,255,0.75);
          --tm-meta-fg: rgba(255,255,255,0.45);
          --tm-subtitle-fg: rgba(255,255,255,0.55);
          --tm-divider: rgba(255,255,255,0.08);
        }

        .tm-stat-divider {
          width: 1px;
          height: 40px;
          background: var(--tm-divider);
        }

        @media (max-width: 480px) {
          .tm-stat-divider { display: none; }
          .tm-stats-row { flex-wrap: wrap; gap: 24px !important; }
        }
      `}</style>

      <section
        style={{
          background: "var(--ft-bg)",
          borderTop: "1px solid var(--ft-border)",
          borderBottom: "1px solid var(--ft-border)",
          padding: "80px 0",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div
          ref={sectionRef}
          className="mx-auto px-6"
          style={{
            maxWidth: 1100,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition:
              "opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-14">
            <h2
              className="font-bold m-0 mb-3"
              style={{
                fontFamily: "var(--nav-font)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                color: "#ffffff",
                letterSpacing: "0.01em",
              }}
            >
              What Our Customers Say
            </h2>
            <p
              className="text-[0.9rem] m-0 mb-5 leading-relaxed"
              style={{ color: "var(--tm-subtitle-fg)" }}
            >
              Join thousands of satisfied customers who&apos;ve made the switch
              to
              <br />
              sustainable comfort
            </p>

            {!loading && testimonials.length > 0 && (
              <div className="flex items-center justify-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      fill="var(--ft-fg)"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <span
                  className="font-semibold text-[1.1rem]"
                  style={{ color: "#ffffff" }}
                >
                  {avgRating}/5
                </span>
              </div>
            )}
          </div>

          {/* Carousel */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div
                className="w-6 h-6 rounded-full border-2 animate-spin"
                style={{
                  borderColor: "var(--ft-fg)",
                  borderTopColor: "transparent",
                }}
              />
            </div>
          ) : testimonials.length === 0 ? (
            <p
              className="text-center text-[0.9rem]"
              style={{ color: "var(--tm-subtitle-fg)" }}
            >
              No reviews yet.
            </p>
          ) : (
            <div className="flex items-center gap-4">
              {/* Prev button */}
              <button
                onClick={prev}
                disabled={!canPrev}
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: canPrev
                    ? "rgba(41,177,168,0.15)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${canPrev ? "rgba(41,177,168,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: canPrev ? "var(--ft-fg)" : "rgba(255,255,255,0.2)",
                  cursor: canPrev ? "pointer" : "not-allowed",
                }}
              >
                <ChevronLeft size={18} />
              </button>

              {/* Cards viewport */}
              <div className="flex-1 overflow-hidden">
                <div
                  className="flex gap-5"
                  style={{
                    transform: `translateX(calc(-${index} * (100% / ${perPage} + ${20 / perPage}px)))`,
                    transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  {testimonials.map((t) => (
                    <div
                      key={t._id}
                      className="shrink-0"
                      style={{
                        width: `calc(${100 / perPage}% - ${(20 * (perPage - 1)) / perPage}px)`,
                      }}
                    >
                      <TestimonialCard {...t} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Next button */}
              <button
                onClick={next}
                disabled={!canNext}
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: canNext
                    ? "rgba(41,177,168,0.15)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${canNext ? "rgba(41,177,168,0.4)" : "rgba(255,255,255,0.08)"}`,
                  color: canNext ? "var(--ft-fg)" : "rgba(255,255,255,0.2)",
                  cursor: canNext ? "pointer" : "not-allowed",
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Dot indicators */}
          {!loading && testimonials.length > perPage && (
            <div className="flex items-center justify-center gap-2 mt-6">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === index ? 20 : 6,
                    height: 6,
                    background:
                      i === index ? "var(--ft-fg)" : "rgba(41,177,168,0.25)",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
