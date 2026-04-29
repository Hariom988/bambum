"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Star } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Add these new variables alongside the existing :root block
   in your globals.css / variables file:

   --tm-card-bg: #1a1a1a;
   --tm-card-border: rgba(255,255,255,0.06);
   --tm-star-active: var(--ft-fg);          // reuses teal accent
   --tm-star-inactive: rgba(41,177,168,0.25);
   --tm-heading-fg: #ffffff;
   --tm-body-fg: rgba(255,255,255,0.75);
   --tm-author-fg: var(--ft-fg);            // teal
   --tm-meta-fg: rgba(255,255,255,0.45);
   --tm-stat-value-fg: #ffffff;
   --tm-stat-label-fg: rgba(255,255,255,0.5);
   --tm-subtitle-fg: rgba(255,255,255,0.55);
   --tm-divider: rgba(255,255,255,0.08);
───────────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    name: "Sanjoa Sharma",
    rating: 5,
    text: "The most comfortable underwear I've ever owned. The bamboo fabric is incredibly soft and breathable.",
    initials: "SS",
  },
  {
    name: "Piyush",
    rating: 5,
    text: "Love the sustainability aspect and they feel amazing. Will never go back to regular cotton.",
    initials: "PI",
  },
  {
    name: "Alia",
    rating: 5,
    text: "These are worth every penny. The quality is outstanding and they actually stay comfortable all day.",
    initials: "AL",
  },
  {
    name: "Priya Sharma",
    rating: 5,
    text: "I was skeptical about bamboo fabric but decided to try Bambumm after seeing the reviews. Absolutely blown away — these briefs feel like wearing nothing.",
    initials: "PS",
  },
  {
    name: "Arjun Mehta",
    rating: 5,
    text: "My skin is super sensitive and regular cotton always causes irritation. These are a complete game-changer. Cool, soft, and no allergic reaction.",
    initials: "AM",
  },
  {
    name: "Rahul Verma",
    rating: 5,
    text: "Whether I'm in the office or working out, these stay comfortable all day. The breathability is real — I genuinely feel cooler.",
    initials: "RV",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={
            i < rating ? "var(--tm-star-active)" : "var(--tm-star-inactive)"
          }
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function TestimonialCard({
  name,
  rating,
  text,
  initials,
  visible,
  delay,
}: {
  name: string;
  rating: number;
  text: string;
  initials: string;
  visible: boolean;
  delay: number;
}) {
  return (
    <div
      className="tm-card"
      style={{
        background: "var(--tm-card-bg)",
        border: "1px solid var(--tm-card-border)",
        borderRadius: 12,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <StarRating rating={rating} />

      <p
        style={{
          color: "var(--tm-body-fg)",
          fontSize: "0.9rem",
          lineHeight: 1.65,
          margin: 0,
          flex: 1,
        }}
      >
        &ldquo;{text}&rdquo;
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(41,177,168,0.15)",
            border: "1px solid rgba(41,177,168,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "var(--tm-author-fg)",
            flexShrink: 0,
            fontFamily: "var(--nav-font)",
          }}
        >
          {initials}
        </div>
        <div>
          <p
            style={{
              color: "var(--tm-author-fg)",
              fontSize: "0.8rem",
              fontWeight: 600,
              margin: 0,
            }}
          >
            {name}
          </p>
          <p
            style={{
              color: "var(--tm-meta-fg)",
              fontSize: "0.7rem",
              margin: 0,
            }}
          >
            Verified Customer
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

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

  // Show first 3 on mobile, all 6 on desktop (handled via CSS grid)
  const displayed = TESTIMONIALS.slice(0, 3);

  return (
    <>
      <style>{`
        :root {
          --tm-card-bg: #1a1a1a;
          --tm-card-border: rgba(255,255,255,0.06);
          --tm-star-active: var(--ft-fg);
          --tm-star-inactive: rgba(41,177,168,0.25);
          --tm-heading-fg: #ffffff;
          --tm-body-fg: rgba(255,255,255,0.75);
          --tm-author-fg: var(--ft-fg);
          --tm-meta-fg: rgba(255,255,255,0.45);
          --tm-stat-value-fg: #ffffff;
          --tm-stat-label-fg: rgba(255,255,255,0.5);
          --tm-subtitle-fg: rgba(255,255,255,0.55);
          --tm-divider: rgba(255,255,255,0.08);
        }

        .tm-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 768px) {
          .tm-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .tm-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .tm-overall-stars {
          display: flex;
          align-items: center;
          gap: 6px;
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
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(28px)",
            transition:
              "opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2
              style={{
                fontFamily: "var(--nav-font)",
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 700,
                color: "var(--tm-heading-fg)",
                margin: "0 0 12px",
                letterSpacing: "0.01em",
              }}
            >
              What Our Customers Say
            </h2>
            <p
              style={{
                color: "var(--tm-subtitle-fg)",
                fontSize: "0.9rem",
                margin: "0 0 20px",
                lineHeight: 1.5,
              }}
            >
              Join thousands of satisfied customers who&apos;s made the switch
              to
              <br />
              sustainable comfort
            </p>
            {/* Overall rating */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <div className="tm-overall-stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill="var(--tm-star-active)"
                    strokeWidth={0}
                  />
                ))}
              </div>
              <span
                style={{
                  color: "var(--tm-heading-fg)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                4.0/5
              </span>
            </div>
          </div>

          {/* Cards grid */}
          <div className="tm-grid">
            {displayed.map((t, i) => (
              <TestimonialCard
                key={t.name}
                {...t}
                visible={visible}
                delay={i * 100}
              />
            ))}
          </div>

          {/* Stats bar */}
          <div
            className="tm-stats-row"
            style={{
              marginTop: 56,
              borderTop: "1px solid var(--tm-divider)",
              paddingTop: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 48,
            }}
          >
            {[
              { value: "5.0 / 5.0", label: "Average Rating" },
              { value: "1,200+", label: "Happy Customers" },
              { value: "98%", label: "Repeat Buyers" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{ display: "flex", alignItems: "center", gap: 48 }}
              >
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontFamily: "var(--nav-font)",
                      fontSize: "1.75rem",
                      fontWeight: 700,
                      color: "var(--tm-stat-value-fg)",
                      margin: "0 0 4px",
                      lineHeight: 1,
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--tm-stat-label-fg)",
                      margin: 0,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {stat.label}
                  </p>
                </div>
                {i < 2 && <div className="tm-stat-divider" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
