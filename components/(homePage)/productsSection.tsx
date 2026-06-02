"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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

const SS_SCROLL = "ps_scroll";

export default function ProductsSection() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVariants, setActiveVariants] = useState<Record<string, number>>(
    {},
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const saveStateAndNavigate = useCallback(
    (slug: string) => {
      sessionStorage.setItem(SS_SCROLL, String(window.scrollY));
      router.push(`/products/${slug}`);
    },
    [router],
  );

  const setVariant = (productId: string, idx: number) => {
    setActiveVariants((prev) => ({ ...prev, [productId]: idx }));
  };

  const getActiveVariant = (product: Product) => {
    const idx = activeVariants[product._id] ?? 0;
    return product.variants[idx] ?? product.variants[0];
  };

  // Shared card renderer to avoid duplication
  const renderCard = (product: Product) => {
    const variant = getActiveVariant(product);
    const firstImage = variant?.images?.[0];
    if (!variant || !firstImage) return null;

    return (
      <div
        key={product._id}
        className="product-card-bs rounded-2xl cursor-pointer shrink-0"
        style={{
          background: "#fff",
          border: "1px solid var(--nav-border)",
        }}
        onClick={() => saveStateAndNavigate(product.slug)}
      >
        {/* Image */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            aspectRatio: "3/4",
            background: "var(--nav-bg)",
          }}
        >
          <Image
            src={firstImage}
            alt={`${product.name} – ${variant.colorName}`}
            fill
            sizes="(max-width: 768px) 50vw, 220px"
            className="img-zoom-bs object-cover object-center"
          />
        </div>

        {/* Info */}
        <div className="p-3.5">
          <p
            className="text-sm font-bold uppercase leading-tight mb-1 truncate"
            style={{
              fontFamily: "var(--nav-font)",
              color: "black",
              letterSpacing: "0.02em",
            }}
          >
            {product.name}
          </p>
          <p className="text-sm font-bold mb-2.5" style={{ color: "black" }}>
            ₹{product.price.toLocaleString("en-IN")}
          </p>

          {/* Rating Row */}
          <div
            className="flex items-center justify-between mb-3"
            style={{
              borderTop: "1px solid var(--nav-border)",
              paddingTop: "10px",
            }}
          >
            <span
              className="text-[11px] tracking-wide"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              Rating
            </span>
            <span
              className="text-[11px] font-bold"
              style={{ color: "var(--nav-fg)" }}
            >
              4.9
            </span>
          </div>

          {/* Color Swatches */}
          <div
            className="flex items-center gap-2 flex-wrap"
            onClick={(e) => e.stopPropagation()}
          >
            {product.variants.map((v, idx) => (
              <button
                key={`${v.colorName}-${idx}`}
                title={v.colorName}
                onClick={(e) => {
                  e.stopPropagation();
                  setVariant(product._id, idx);
                }}
                aria-label={v.colorName}
                className={`swatch-bs shrink-0 ${
                  (activeVariants[product._id] ?? 0) === idx
                    ? "active-swatch"
                    : ""
                }`}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: v.colorHex,
                  border: "2px solid var(--nav-border)",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .bestsellers-scroll::-webkit-scrollbar { display: none; }
        .bestsellers-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .product-card-bs {
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.22s ease;
        }
        .product-card-bs:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px rgba(200, 169, 126, 0.18);
        }
        .swatch-bs {
          transition: outline 0.15s ease, transform 0.15s ease;
        }
        .swatch-bs:hover { transform: scale(1.15); }
        .swatch-bs.active-swatch {
          outline: 2px solid var(--nav-accent);
          outline-offset: 2px;
        }
        .img-zoom-bs {
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .product-card-bs:hover .img-zoom-bs { transform: scale(1.05); }
        @keyframes bsSkeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .bs-skeleton { animation: bsSkeletonPulse 1.4s ease-in-out infinite; }
      `}</style>

      <section
        className="w-full  py-5 md:py-5"
        style={{
          background: "var(--brand-background-page)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <h2
              className="text-2xl md:text-4xl font-bold uppercase tracking-tight"
              style={{
                fontFamily: "var(--nav-font)",
                color: "black",
                letterSpacing: "-0.01em",
              }}
            >
              SHOP BY BAMBUMM
            </h2>
            <Link
              href="/products"
              className="text-xs font-bold tracking-[0.14em] uppercase pb-0.5 transition-colors duration-200"
              style={{
                color: "var(--nav-fg-muted)",
                borderBottom: "1px solid var(--nav-border)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--nav-accent)";
                e.currentTarget.style.borderBottomColor = "var(--nav-accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--nav-fg-muted)";
                e.currentTarget.style.borderBottomColor = "var(--nav-border)";
              }}
            >
              View All
            </Link>
          </div>

          {/* ── MOBILE: 2-column grid, wraps naturally ── */}
          <div className="md:hidden">
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bs-skeleton rounded-2xl"
                    style={{
                      aspectRatio: "3/4",
                      background: "var(--nav-border)",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => renderCard(product))}
              </div>
            )}
          </div>

          {/* ── DESKTOP: horizontal scroll (unchanged) ── */}
          <div
            ref={scrollRef}
            className="bestsellers-scroll hidden md:flex gap-4 md:gap-5 overflow-x-auto pb-2"
          >
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="bs-skeleton shrink-0 rounded-none"
                    style={{
                      width: 220,
                      minWidth: 220,
                      background: "var(--nav-border)",
                      height: 340,
                    }}
                  />
                ))
              : products.map((product) => (
                  <div key={product._id} style={{ width: 220, minWidth: 220 }}>
                    {renderCard(product)}
                  </div>
                ))}
          </div>
        </div>
      </section>
    </>
  );
}
