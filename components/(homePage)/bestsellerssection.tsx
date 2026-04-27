"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";

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

function BestsellerCard({
  product,
  onNavigate,
}: {
  product: Product;
  onNavigate: (slug: string) => void;
}) {
  const [activeVariant, setActiveVariant] = useState(0);
  const variant = product.variants[activeVariant];
  const firstImage = variant?.images?.[0];

  if (!variant || !firstImage) return null;

  return (
    <div
      className="flex-none cursor-pointer group"
      style={{ width: 180 }}
      onClick={() => onNavigate(product.slug)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden mb-3"
        style={{
          aspectRatio: "3/4",
          background: "var(--nav-bg)",
          border: "1px solid var(--nav-border)",
        }}
      >
        <Image
          src={firstImage}
          alt={product.name}
          fill
          sizes="180px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <p
        className="text-xs font-bold uppercase tracking-wide leading-snug mb-1 truncate"
        style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
      >
        {product.name}
      </p>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={10}
            fill={i <= 4 ? "var(--nav-accent)" : "transparent"}
            style={{ color: "var(--nav-accent)" }}
            strokeWidth={1.5}
          />
        ))}
        <span
          className="text-[0.6rem] ml-1"
          style={{ color: "var(--nav-fg-muted)" }}
        >
          4.8
        </span>
      </div>

      {/* Color swatches */}
      <div className="flex items-center gap-1 mb-1">
        {product.variants.slice(0, 5).map((v, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setActiveVariant(idx);
            }}
            className="rounded-full transition-all duration-150"
            style={{
              width: 10,
              height: 10,
              background: v.colorHex,
              border:
                activeVariant === idx
                  ? "2px solid var(--nav-accent)"
                  : "1px solid var(--nav-border)",
              padding: 0,
              cursor: "pointer",
            }}
            aria-label={v.colorName}
          />
        ))}
      </div>

      <p
        className="text-xs font-bold"
        style={{ color: "var(--nav-accent)", fontFamily: "var(--nav-font)" }}
      >
        ₹{product.price.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

export default function BestsellersSection() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts((d.products || []).slice(0, 8)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const handleNavigate = useCallback(
    (slug: string) => {
      sessionStorage.setItem("pl_scroll", String(window.scrollY));
      router.push(`/products/${slug}`);
    },
    [router],
  );

  return (
    <section
      className="w-full py-10 md:py-14"
      style={{ background: "var(--nav-bg)", fontFamily: "var(--nav-font-ui)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p
              className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-1"
              style={{ color: "var(--nav-accent)" }}
            >
              Top Picks
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold uppercase tracking-widest"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
            >
              Bestsellers
            </h2>
          </div>
          <a
            href="/products"
            className="text-xs font-bold tracking-[0.14em] uppercase transition-colors duration-150"
            style={{ color: "var(--nav-accent)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--nav-accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--nav-accent)")
            }
          >
            View All
          </a>
        </div>

        {/* Horizontal scroll */}
        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-none animate-pulse"
                style={{ width: 180 }}
              >
                <div
                  className="mb-3"
                  style={{
                    aspectRatio: "3/4",
                    background: "var(--nav-border)",
                  }}
                />
                <div
                  className="h-3 rounded mb-1"
                  style={{ background: "var(--nav-border)", width: "80%" }}
                />
                <div
                  className="h-2 rounded"
                  style={{ background: "var(--nav-border)", width: "40%" }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="flex gap-4 overflow-x-auto pb-2"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
            }}
          >
            {products.map((product) => (
              <div key={product._id} style={{ scrollSnapAlign: "start" }}>
                <BestsellerCard product={product} onNavigate={handleNavigate} />
              </div>
            ))}
          </div>
        )}

        {/* View all button */}
        <div className="flex justify-center mt-8">
          <a
            href="/products"
            className="px-8 py-3 text-xs font-bold tracking-[0.16em] uppercase transition-all duration-200"
            style={{
              border: "1px solid var(--nav-fg)",
              color: "var(--nav-fg)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--nav-fg)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--nav-fg)";
            }}
          >
            VIEW ALL PRODUCTS
          </a>
        </div>
      </div>
    </section>
  );
}
