"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Minus } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "What makes Bambum products different?",
    a: "Our products are made from premium bamboo fabric, offering superior comfort and breathability that synthetic or cotton alternatives simply can't match.",
  },
  {
    q: "Are the products suitable for sensitive skin?",
    a: "Yes, bamboo fabric is naturally hypoallergenic and gentle on skin — making it an ideal choice for those with sensitivities or allergies.",
  },
  {
    q: "Can I return innerwear products?",
    a: "Innerwear is non-returnable due to hygiene reasons. However, if you receive a defective or incorrect item, we will resolve it promptly.",
  },
  {
    q: "How long does delivery take?",
    a: "Delivery typically takes 2–4 business days for metro cities and 3–7 business days for other locations.",
  },
  {
    q: "How can I track my order?",
    a: "Once your order is shipped, you will receive a tracking link via email or SMS so you can follow your package at every step.",
  },
  {
    q: "Do you offer Cash on Delivery?",
    a: "Yes, COD is available on selected orders and locations. The option will appear at checkout if applicable for your area.",
  },
  {
    q: "What if I receive a damaged or wrong product?",
    a: "Please contact us within 48 hours of delivery with clear images or a video as proof. We will offer a replacement or refund as applicable.",
  },
];

function FAQItem({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: { q: string; a: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    if (isOpen) {
      el.style.maxHeight = el.scrollHeight + "px";
      el.style.opacity = "1";
    } else {
      el.style.maxHeight = "0px";
      el.style.opacity = "0";
    }
  }, [isOpen]);

  return (
    <div
      className="faq-item border-b"
      style={{ borderColor: "var(--nav-border)" }}
    >
      <button
        onClick={onToggle}
        className="faq-trigger w-full flex items-center justify-between gap-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        {/* Number + Question */}
        <div className="flex items-center gap-4 min-w-0">
          <span
            className="faq-num shrink-0 text-[0.65rem] font-bold tracking-[0.14em]"
            style={{
              color: isOpen ? "var(--nav-accent)" : "var(--nav-fg-muted)",
              transition: "color 0.2s ease",
              minWidth: "1.5rem",
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="text-sm md:text-[0.9375rem] font-semibold leading-snug tracking-wide"
            style={{
              color: isOpen ? "var(--nav-fg)" : "var(--nav-fg)",
              fontFamily: "var(--nav-font-ui)",
            }}
          >
            {item.q}
          </span>
        </div>

        {/* Icon */}
        <div
          className="faq-icon cursor-pointer shrink-0 w-7 h-7 flex items-center justify-center"
          style={{
            background: isOpen ? "var(--nav-accent)" : "rgba(200,169,126,0.1)",
            border: `1px solid ${isOpen ? "var(--nav-accent)" : "var(--nav-border)"}`,
            transition: "background 0.22s ease, border-color 0.22s ease",
          }}
        >
          {isOpen ? (
            <Minus size={13} color="#fff" strokeWidth={2.5} />
          ) : (
            <Plus
              size={13}
              style={{ color: "var(--nav-accent)" }}
              strokeWidth={2.5}
            />
          )}
        </div>
      </button>

      {/* Answer */}
      <div
        ref={bodyRef}
        style={{
          maxHeight: "0px",
          opacity: 0,
          overflow: "hidden",
          transition:
            "max-height 0.42s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease",
        }}
      >
        <div className="flex gap-4 pb-5 pr-12">
          {/* Accent left bar */}
          <div
            className="shrink-0 w-0.5 self-stretch rounded-full"
            style={{ background: "var(--nav-accent)", opacity: 0.5 }}
          />
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "var(--nav-fg-muted)",
              fontFamily: "var(--nav-font-ui)",
            }}
          >
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered entrance
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("faq-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <>
      <style>{`
        /* Section entrance */
        .faq-section {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1),
                      transform 0.7s cubic-bezier(0.22,1,0.36,1);
        }
        .faq-section.faq-visible { opacity: 1; transform: translateY(0); }

        /* Row hover */
        .faq-trigger:hover .faq-num { color: var(--nav-accent) !important; }
        .faq-trigger { transition: opacity 0.15s ease; }
        .faq-trigger:hover { opacity: 0.85; }
      `}</style>

      <section
        ref={sectionRef}
        className="faq-section w-full"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div className="max-w-8xl mx-auto px-6 py-16 md:py-20">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-12">
            <p
              className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-3"
              style={{ color: "var(--nav-accent)" }}
            >
              Got Questions?
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
            >
              FAQ
            </h2>
            <div className="flex items-center gap-3">
              <div
                className="h-px w-10"
                style={{ background: "var(--nav-border)" }}
              />
              <div
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--nav-accent)" }}
              />
              <div
                className="h-px w-10"
                style={{ background: "var(--nav-border)" }}
              />
            </div>
          </div>

          {/* Accordion */}
          <div
            className="rounded-sm overflow-hidden"
            style={{
              background: "#fff",
              border: "1px solid var(--nav-border)",
              boxShadow: "0 2px 24px rgba(200,169,126,0.08)",
            }}
          >
            <div className="px-6 md:px-8">
              {FAQ_ITEMS.map((item, i) => (
                <FAQItem
                  key={i}
                  item={item}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={() => toggle(i)}
                />
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p
            className="text-center text-xs mt-8 leading-relaxed"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            Still have questions?{" "}
            <a
              href="mailto:support@bambum.com"
              className="font-semibold underline underline-offset-2 transition-colors duration-150"
              style={{ color: "var(--nav-accent)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--nav-accent-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-accent)")
              }
            >
              Contact our support team
            </a>{" "}
            and we&apos;ll be happy to help.
          </p>
        </div>
      </section>
    </>
  );
}
