"use client";

import { useEffect, useRef } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

const CONTACTS = [
  {
    icon: Mail,
    label: "Email Us",
    value: "support@bambum.com",
    sub: "We'll get back to you within 24–48 hours",
    href: "mailto:support@bambum.com",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+91-XXXXXXXXXX",
    sub: "Mon – Sat, 10 AM to 6 PM IST",
    href: "tel:+91XXXXXXXXXX",
  },
  {
    icon: MapPin,
    label: "Find Us",
    value: "Gurgaon, Haryana",
    sub: "India",
    href: null,
  },
  {
    icon: Clock,
    label: "Response Time",
    value: "24 – 48 hrs",
    sub: "Typical support reply window",
    href: null,
  },
];

export default function ContactPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const t = setTimeout(() => hero.classList.add("ct-visible"), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = cardsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("ct-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        /* Hero fade */
        .ct-hero { opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease, transform 0.8s ease; }
        .ct-hero.ct-visible { opacity: 1; transform: translateY(0); }

        /* Cards stagger */
        .ct-cards > * { opacity: 0; transform: translateY(20px); }
        .ct-cards.ct-visible > *:nth-child(1) { animation: ctUp 0.6s 0.05s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ct-cards.ct-visible > *:nth-child(2) { animation: ctUp 0.6s 0.15s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ct-cards.ct-visible > *:nth-child(3) { animation: ctUp 0.6s 0.25s cubic-bezier(0.22,1,0.36,1) forwards; }
        .ct-cards.ct-visible > *:nth-child(4) { animation: ctUp 0.6s 0.35s cubic-bezier(0.22,1,0.36,1) forwards; }
        @keyframes ctUp { to { opacity: 1; transform: translateY(0); } }

        /* Card hover */
        .ct-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          cursor: default;
        }
        .ct-card.ct-link { cursor: pointer; }
        .ct-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(200,169,126,0.13);
          border-color: var(--nav-accent) !important;
        }
        .ct-card .ct-icon-wrap {
          transition: background 0.22s ease;
        }
        .ct-card:hover .ct-icon-wrap {
          background: rgba(200,169,126,0.22) !important;
        }

        /* Pulse dot */
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.7); }
        }
        .pulse-dot { animation: pulse 2s ease-in-out infinite; }
      `}</style>

      <main
        className="min-h-screen"
        style={{
          background: "var(--nav-bg)",
          color: "var(--nav-fg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        {/* ── HERO ── */}
        <section
          className="relative overflow-hidden border-b"
          style={{ borderColor: "var(--nav-border)" }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.75"
            style={{ background: "var(--nav-accent)" }}
          />

          <div
            ref={heroRef}
            className="ct-hero relative max-w-5xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-16 items-center"
          >
            {/* ── LEFT: title block ── */}
            <div>
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-7 text-xs font-semibold tracking-[0.14em] uppercase"
                style={{
                  background: "rgba(200,169,126,0.12)",
                  border: "1px solid var(--nav-border)",
                  color: "var(--nav-accent)",
                }}
              >
                <span
                  className="pulse-dot inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--nav-accent)" }}
                />
                We&apos;re Here to Help
              </div>

              <h1
                className="text-5xl md:text-8xl font-bold uppercase leading-[0.95] tracking-tight mb-6"
                style={{ fontFamily: "var(--nav-font)" }}
              >
                Get in
                <br />
                <span style={{ color: "var(--nav-accent)" }}>Touch.</span>
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className="h-px w-14"
                  style={{ background: "var(--nav-accent)" }}
                />
                <p
                  className="text-xs tracking-[0.14em] uppercase"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Bambum Support
                </p>
              </div>

              <p
                className="text-base leading-relaxed max-w-md"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Have a question about your order, our products, or anything
                else? Our support team typically responds within{" "}
                <strong style={{ color: "var(--nav-fg)" }}>24–48 hours.</strong>
              </p>
            </div>

            {/* ── RIGHT: hours panel ── */}
            <div className="flex justify-center md:justify-end">
              <div
                className="relative w-full max-w-sm overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 8px 40px rgba(200,169,126,0.12)",
                }}
              >
                {/* Gold top bar */}
                <div
                  className="h-1 w-full"
                  style={{ background: "var(--nav-accent)" }}
                />

                {/* Header row */}
                <div
                  className="px-7 pt-6 pb-5 border-b flex items-center gap-3"
                  style={{ borderColor: "var(--nav-border)" }}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(200,169,126,0.1)",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    <Clock
                      size={16}
                      style={{ color: "var(--nav-accent)" }}
                      strokeWidth={1.75}
                    />
                  </div>
                  <div>
                    <p
                      className="text-[0.65rem] font-bold tracking-[0.16em] uppercase"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Support Hours
                    </p>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: "var(--nav-fg)",
                        fontFamily: "var(--nav-font)",
                      }}
                    >
                      When we&apos;re available
                    </p>
                  </div>
                </div>

                {/* Days */}
                <div className="px-7 py-5 flex flex-col gap-3">
                  {[
                    {
                      day: "Monday – Saturday",
                      hours: "10:00 AM – 6:00 PM",
                      active: true,
                    },
                    { day: "Sunday", hours: "Closed", active: false },
                  ].map((row) => (
                    <div
                      key={row.day}
                      className="flex items-center justify-between gap-4 py-3 px-4"
                      style={{
                        background: row.active
                          ? "rgba(200,169,126,0.07)"
                          : "rgba(0,0,0,0.02)",
                        border: `1px solid ${row.active ? "rgba(200,169,126,0.2)" : "var(--nav-border)"}`,
                      }}
                    >
                      <span
                        className="text-xs font-semibold tracking-wide"
                        style={{
                          color: row.active
                            ? "var(--nav-fg)"
                            : "var(--nav-fg-muted)",
                        }}
                      >
                        {row.day}
                      </span>
                      <span
                        className="text-xs font-bold tracking-wide"
                        style={{
                          color: row.active
                            ? "var(--nav-accent)"
                            : "var(--nav-fg-muted)",
                        }}
                      >
                        {row.hours}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Timezone footer */}
                <div
                  className="mx-7 mb-6 px-4 py-3 flex items-center justify-between"
                  style={{
                    background: "rgba(200,169,126,0.06)",
                    border: "1px solid var(--nav-border)",
                  }}
                >
                  <span
                    className="text-[0.65rem] tracking-[0.12em] uppercase font-semibold"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Timezone
                  </span>
                  <span
                    className="text-[0.7rem] font-bold tracking-wide"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    IST · UTC +5:30
                  </span>
                </div>

                {/* Live indicator */}
                <div
                  className="absolute top-5 right-5 flex items-center gap-1.5 px-2.5 py-1"
                  style={{
                    background: "rgba(200,169,126,0.12)",
                    border: "1px solid rgba(200,169,126,0.25)",
                  }}
                >
                  <span
                    className="pulse-dot w-1.5 h-1.5 rounded-full inline-block"
                    style={{ background: "var(--nav-accent)" }}
                  />
                  <span
                    className="text-[0.6rem] font-bold tracking-widest uppercase"
                    style={{ color: "var(--nav-accent)" }}
                  >
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONTACT CARDS ── */}
        <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
          <div
            ref={cardsRef}
            className="ct-cards grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {CONTACTS.map((c) => {
              const Icon = c.icon;
              const Tag = c.href ? "a" : "div";
              return (
                <Tag
                  key={c.label}
                  {...(c.href ? { href: c.href } : {})}
                  className={`ct-card ${c.href ? "ct-link" : ""} flex flex-col gap-5 p-7 no-underline`}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--nav-border)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <div
                    className="ct-icon-wrap w-11 h-11 flex items-center justify-center"
                    style={{
                      background: "rgba(200,169,126,0.1)",
                      border: "1px solid var(--nav-border)",
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: "var(--nav-accent)" }}
                      strokeWidth={1.75}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p
                      className="text-[0.65rem] font-bold tracking-[0.16em] uppercase"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      {c.label}
                    </p>
                    <p
                      className="text-base font-bold leading-snug"
                      style={{
                        fontFamily: "var(--nav-font)",
                        color: "var(--nav-fg)",
                      }}
                    >
                      {c.value}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      {c.sub}
                    </p>
                  </div>

                  {c.href && (
                    <div
                      className="mt-auto text-[0.65rem] font-bold tracking-[0.12em] uppercase flex items-center gap-1.5"
                      style={{ color: "var(--nav-accent)" }}
                    >
                      <span>{c.icon === Mail ? "Send email" : "Call now"}</span>
                      <span>→</span>
                    </div>
                  )}
                </Tag>
              );
            })}
          </div>
        </section>

        {/* ── BOTTOM NOTE ── */}
        <section
          className="border-t"
          style={{
            borderColor: "var(--nav-border)",
            background: "rgba(200,169,126,0.06)",
          }}
        ></section>
      </main>
    </>
  );
}
