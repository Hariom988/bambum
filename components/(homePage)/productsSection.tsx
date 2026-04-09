"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/productCard";

interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
}

interface Product {
  _id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  variants: ProductVariant[];
}

const CARDS_PER_VIEW = { mobile: 2, tablet: 3, desktop: 4 };

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(CARDS_PER_VIEW.desktop);
  const trackRef = useRef<HTMLDivElement>(null);

  // Responsive visible count
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(
        w < 640
          ? CARDS_PER_VIEW.mobile
          : w < 1024
            ? CARDS_PER_VIEW.tablet
            : CARDS_PER_VIEW.desktop,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Reset page on resize so we never land on an out-of-range page
  useEffect(() => {
    setPage(0);
  }, [visibleCount]);

  // Fetch products once
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(products.length / visibleCount);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  const prev = useCallback(() => setPage((p) => Math.max(0, p - 1)), []);
  const next = useCallback(
    () => setPage((p) => Math.min(totalPages - 1, p + 1)),
    [totalPages],
  );

  // Touch swipe
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50 && canNext) next();
    if (diff < -50 && canPrev) prev();
    touchStartX.current = null;
  };

  const visibleProducts = products.slice(
    page * visibleCount,
    page * visibleCount + visibleCount,
  );

  return (
    <section
      className="w-full"
      style={{ background: "var(--nav-bg)", fontFamily: "var(--nav-font-ui)" }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
        {/* ── Header ── */}
        <div className="flex flex-col items-center text-center mb-12">
          <p
            className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-3"
            style={{ color: "var(--nav-accent)" }}
          >
            Our Collection
          </p>
          <h2
            className="text-3xl md:text-4xl font-bold uppercase tracking-widest mb-4"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            Shop Now
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

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  border: "1px solid var(--nav-border)",
                  background: "#fff",
                }}
              >
                <div
                  className="aspect-3/4"
                  style={{ background: "var(--nav-border)" }}
                />
                <div className="p-4 flex flex-col gap-2">
                  <div
                    className="h-3 rounded w-3/4"
                    style={{ background: "var(--nav-border)" }}
                  />
                  <div
                    className="h-3 rounded w-1/2"
                    style={{ background: "var(--nav-border)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-sm" style={{ color: "var(--nav-fg-muted)" }}>
              No products available right now.
            </p>
          </div>
        )}

        {/* ── Carousel ── */}
        {!loading && products.length > 0 && (
          <div>
            {/* Track */}
            <div
              ref={trackRef}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              style={{ minHeight: 300 }}
            >
              {visibleProducts.map((product) => (
                <ProductCard key={product._id} product={product as any} />
              ))}
            </div>

            {/* ── Controls ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10">
                {/* Prev */}
                <button
                  onClick={prev}
                  disabled={!canPrev}
                  aria-label="Previous products"
                  className="flex items-center justify-center w-10 h-10 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    border: "1px solid var(--nav-border)",
                    background: "#fff",
                    color: "var(--nav-fg)",
                  }}
                  onMouseEnter={(e) => {
                    if (canPrev) {
                      e.currentTarget.style.background = "var(--nav-accent)";
                      e.currentTarget.style.borderColor = "var(--nav-accent)";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "var(--nav-border)";
                    e.currentTarget.style.color = "var(--nav-fg)";
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                {/* Dots */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      aria-label={`Go to page ${i + 1}`}
                      className="transition-all duration-200"
                      style={{
                        width: i === page ? 24 : 8,
                        height: 8,
                        borderRadius: 999,
                        background:
                          i === page
                            ? "var(--nav-accent)"
                            : "var(--nav-border)",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={next}
                  disabled={!canNext}
                  aria-label="Next products"
                  className="flex items-center justify-center w-10 h-10 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    border: "1px solid var(--nav-border)",
                    background: "#fff",
                    color: "var(--nav-fg)",
                  }}
                  onMouseEnter={(e) => {
                    if (canNext) {
                      e.currentTarget.style.background = "var(--nav-accent)";
                      e.currentTarget.style.borderColor = "var(--nav-accent)";
                      e.currentTarget.style.color = "#fff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.borderColor = "var(--nav-border)";
                    e.currentTarget.style.color = "var(--nav-fg)";
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Page counter */}
            {totalPages > 1 && (
              <p
                className="text-center text-[0.65rem] tracking-widest uppercase mt-4"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                {page * visibleCount + 1}–
                {Math.min((page + 1) * visibleCount, products.length)} of{" "}
                {products.length}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
