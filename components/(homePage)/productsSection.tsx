"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

  return (
    <>
      <style>{`
        .bestsellers-scroll::-webkit-scrollbar {
          display: none;
        }
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
        .swatch-bs:hover {
          transform: scale(1.15);
        }
        .swatch-bs.active-swatch {
          outline: 2px solid var(--nav-accent);
          outline-offset: 2px;
        }

        .img-zoom-bs {
          transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .product-card-bs:hover .img-zoom-bs {
          transform: scale(1.05);
        }

        @keyframes bsSkeletonPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .bs-skeleton {
          animation: bsSkeletonPulse 1.4s ease-in-out infinite;
        }
      `}</style>

      <section
        className="w-full py-10 md:py-14"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <h2
              className="text-3xl md:text-5xl font-bold uppercase tracking-tight"
              style={{
                fontFamily: "var(--nav-font)",
                color: "var(--nav-fg)",
                letterSpacing: "-0.01em",
              }}
            >
              Bestsellers
            </h2>
            <a
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
            </a>
          </div>

          {/* Scrollable Cards */}
          <div
            ref={scrollRef}
            className="bestsellers-scroll flex gap-4 md:gap-5 overflow-x-auto pb-2"
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
              : products.map((product) => {
                  const variant = getActiveVariant(product);
                  const firstImage = variant?.images?.[0];
                  if (!variant || !firstImage) return null;

                  return (
                    <div
                      key={product._id}
                      className="product-card-bs shrink-0 cursor-pointer"
                      style={{
                        width: 220,
                        minWidth: 220,
                        background: "#fff",
                        border: "1px solid var(--nav-border)",
                      }}
                      onClick={() => saveStateAndNavigate(product.slug)}
                    >
                      {/* Image */}
                      <div
                        className="relative overflow-hidden"
                        style={{
                          aspectRatio: "3/4",
                          background: "var(--nav-bg)",
                        }}
                      >
                        <Image
                          src={firstImage}
                          alt={`${product.name} – ${variant.colorName}`}
                          fill
                          sizes="220px"
                          className="img-zoom-bs object-cover object-center"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-3.5">
                        <p
                          className="text-sm font-bold uppercase leading-tight mb-1 truncate"
                          style={{
                            fontFamily: "var(--nav-font)",
                            color: "var(--nav-fg)",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {product.name}
                        </p>
                        <p
                          className="text-sm font-bold mb-2.5"
                          style={{ color: "var(--nav-fg)" }}
                        >
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
                })}
          </div>
        </div>
      </section>
    </>
  );
}
