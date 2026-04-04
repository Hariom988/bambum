"use client";
import { use } from "react";
import { useState } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getProductBySlug } from "@/lib/data/products";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: Props) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const variant = product.variants[activeVariantIdx];

  const switchVariant = (idx: number) => {
    setActiveVariantIdx(idx);
    setActiveImageIdx(0); // reset to first image on colour change
  };

  const prevImage = () =>
    setActiveImageIdx(
      (i) => (i - 1 + variant.images.length) % variant.images.length,
    );
  const nextImage = () =>
    setActiveImageIdx((i) => (i + 1) % variant.images.length);

  return (
    <>
      <style>{`
        .thumb-btn {
          transition: border-color 0.18s ease, opacity 0.18s ease;
          opacity: 0.65;
        }
        .thumb-btn:hover { opacity: 1; }
        .thumb-btn.active { opacity: 1; border-color: var(--nav-accent) !important; }

        .swatch-btn {
          transition: outline 0.15s ease, border-color 0.15s ease;
        }
        .swatch-btn:hover { outline: 2px solid var(--nav-accent); outline-offset: 2px; }
        .swatch-btn.active {
          border-color: var(--nav-accent) !important;
          outline: 2px solid var(--nav-accent);
          outline-offset: 2px;
        }

        .nav-arrow {
          transition: background 0.18s ease, color 0.18s ease;
        }
        .nav-arrow:hover {
          background: var(--nav-accent) !important;
          color: #fff !important;
        }
      `}</style>

      <main
        className="min-h-screen"
        style={{
          background: "var(--nav-bg)",
          color: "var(--nav-fg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        {/* thin top accent */}
        <div
          className="h-0.5 w-full"
          style={{ background: "var(--nav-accent)" }}
        />

        <div className="max-w-6xl mx-auto px-4  py-10 md:py-16">
          {/* ── BREADCRUMB ── */}
          <nav
            className="flex items-center gap-2 mb-8 text-[0.7rem] font-semibold tracking-[0.12em] uppercase"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            <a
              href="/"
              style={{ color: "var(--nav-fg-muted)", textDecoration: "none" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--nav-accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-fg-muted)")
              }
            >
              Home
            </a>
            <span>/</span>
            <span style={{ color: "var(--nav-fg)" }}>{product.name}</span>
          </nav>

          {/* ── MAIN LAYOUT ── */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* ══ LEFT — GALLERY ══ */}
            <div className="flex gap-3">
              {/* Thumbnails — vertical strip on left */}
              <div
                className="hidden sm:flex flex-col gap-2"
                style={{ width: 72 }}
              >
                {variant.images.map((src, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn relative overflow-hidden shrink-0 ${activeImageIdx === idx ? "active" : ""}`}
                    style={{
                      width: 72,
                      height: 90,
                      border: "1px solid var(--nav-border)",
                      background: "var(--nav-bg)",
                      padding: 0,
                      cursor: "pointer",
                    }}
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} ${variant.colorName} view ${idx + 1}`}
                      fill
                      sizes="72px"
                      className="object-cover object-center"
                    />
                  </button>
                ))}
              </div>

              {/* Main image */}
              <div className="flex-1 relative" style={{ aspectRatio: "3/4" }}>
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{ border: "1px solid var(--nav-border)" }}
                >
                  <Image
                    key={`${activeVariantIdx}-${activeImageIdx}`}
                    src={variant.images[activeImageIdx]}
                    alt={`${product.name} – ${variant.colorName}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center"
                    style={{ transition: "opacity 0.3s ease" }}
                  />

                  {/* Prev / Next arrows */}
                  <button
                    className="nav-arrow absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9"
                    onClick={prevImage}
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1px solid var(--nav-border)",
                      color: "var(--nav-fg)",
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                    }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className="nav-arrow absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9"
                    onClick={nextImage}
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1px solid var(--nav-border)",
                      color: "var(--nav-fg)",
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                    }}
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>

                  {/* Image counter */}
                  <div
                    className="absolute bottom-3 right-3 px-2 py-1 text-[0.6rem] font-bold tracking-widest"
                    style={{
                      background: "rgba(0,0,0,0.45)",
                      color: "#fff",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {activeImageIdx + 1} / {variant.images.length}
                  </div>
                </div>

                {/* Mobile thumbnails — horizontal strip below */}
                <div className="flex sm:hidden gap-2 mt-2 overflow-x-auto pb-1">
                  {variant.images.map((src, idx) => (
                    <button
                      key={idx}
                      className={`thumb-btn relative overflow-hidden shrink-0 ${activeImageIdx === idx ? "active" : ""}`}
                      style={{
                        width: 56,
                        height: 70,
                        border: "1px solid var(--nav-border)",
                        background: "var(--nav-bg)",
                        padding: 0,
                        cursor: "pointer",
                      }}
                      onClick={() => setActiveImageIdx(idx)}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover object-center"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ══ RIGHT — PRODUCT INFO ══ */}
            <div className="flex flex-col gap-7">
              {/* Category */}
              <p
                className="text-[0.65rem] font-bold tracking-[0.18em] uppercase"
                style={{ color: "var(--nav-accent)" }}
              >
                {product.category}
              </p>

              {/* Name */}
              <div>
                <h1
                  className="text-3xl md:text-4xl font-bold uppercase tracking-wide leading-tight mb-2"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  {product.name}
                </h1>
                <div
                  className="h-0.5 w-12"
                  style={{ background: "var(--nav-accent)" }}
                />
              </div>

              {/* Price */}
              <p
                className="text-2xl font-bold"
                style={{
                  color: "var(--nav-fg)",
                  fontFamily: "var(--nav-font)",
                }}
              >
                ₹{product.price}
                <span
                  className="text-xs font-normal ml-2 tracking-wider"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  incl. of all taxes
                </span>
              </p>

              {/* Divider */}
              <div
                className="h-px"
                style={{ background: "var(--nav-border)" }}
              />

              {/* Colour picker */}
              <div>
                <p
                  className="text-[0.7rem] font-bold tracking-[0.14em] uppercase mb-3"
                  style={{ color: "var(--nav-fg)" }}
                >
                  Colour:{" "}
                  <span style={{ color: "var(--nav-accent)" }}>
                    {variant.colorName}
                  </span>
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {product.variants.map((v, idx) => (
                    <button
                      key={v.colorName}
                      className={`swatch-btn ${activeVariantIdx === idx ? "active" : ""}`}
                      title={v.colorName}
                      onClick={() => switchVariant(idx)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: v.colorHex,
                        border: "2px solid var(--nav-border)",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                      aria-label={v.colorName}
                      aria-pressed={activeVariantIdx === idx}
                    />
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div
                className="h-px"
                style={{ background: "var(--nav-border)" }}
              />

              {/* Description */}
              <div>
                <p
                  className="text-[0.7rem] font-bold tracking-[0.14em] uppercase mb-2"
                  style={{ color: "var(--nav-fg)" }}
                >
                  About this product
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
