"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hoveredVariant, setHoveredVariant] = useState(0);

  const activeVariant = product.variants[hoveredVariant];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--nav-border)",
          transition: "box-shadow 0.25s ease, border-color 0.25s ease",
          fontFamily: "var(--nav-font-ui)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 12px 40px rgba(200,169,126,0.15)";
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--nav-accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--nav-border)";
        }}
      >
        {/* ── IMAGE ── */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "3/4", background: "var(--nav-bg)" }}
        >
          <Image
            src={activeVariant.images[0]}
            alt={`${product.name} – ${activeVariant.colorName}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center"
            style={{
              transition: "transform 0.5s cubic-bezier(0.25,1,0.5,1)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLImageElement).style.transform =
                "scale(1.05)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLImageElement).style.transform =
                "scale(1)")
            }
          />

          {/* category badge */}
          <div
            className="absolute top-3 left-3 px-2 py-1 text-[0.6rem] font-bold tracking-[0.14em] uppercase"
            style={{
              background: "rgba(255,255,255,0.88)",
              border: "1px solid var(--nav-border)",
              color: "var(--nav-fg-muted)",
              backdropFilter: "blur(4px)",
            }}
          >
            {product.category}
          </div>

          {/* view detail hint on hover */}
          <div
            className="absolute inset-0 flex items-end justify-center pb-4"
            style={{ pointerEvents: "none" }}
          >
            <span
              className="px-4 py-2 text-[0.65rem] font-bold tracking-[0.16em] uppercase"
              style={{
                background: "var(--nav-accent)",
                color: "#fff",
                opacity: 0,
                transform: "translateY(8px)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
              }}
              // We control this via group hover via inline class trick below
              ref={(el) => {
                if (!el) return;
                const card = el.closest("a");
                if (!card) return;
                const show = () => {
                  el.style.opacity = "1";
                  el.style.transform = "translateY(0)";
                };
                const hide = () => {
                  el.style.opacity = "0";
                  el.style.transform = "translateY(8px)";
                };
                card.addEventListener("mouseenter", show);
                card.addEventListener("mouseleave", hide);
              }}
            >
              View Details →
            </span>
          </div>
        </div>

        {/* ── INFO ── */}
        <div className="p-4 flex flex-col gap-3">
          {/* name + price */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-sm font-bold uppercase tracking-widest leading-snug"
              style={{
                fontFamily: "var(--nav-font)",
                color: "var(--nav-fg)",
              }}
            >
              {product.name}
            </h3>
            <span
              className="text-sm font-bold shrink-0"
              style={{ color: "var(--nav-accent)" }}
            >
              ₹{product.price}
            </span>
          </div>

          {/* selected colour label */}
          <p
            className="text-[0.65rem] tracking-[0.12em] uppercase"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            {activeVariant.colorName}
          </p>

          {/* colour swatches */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.variants.map((variant, idx) => (
              <button
                key={variant.colorName}
                title={variant.colorName}
                onMouseEnter={() => setHoveredVariant(idx)}
                onMouseLeave={() => setHoveredVariant(hoveredVariant)}
                onClick={(e) => {
                  e.preventDefault(); // don't navigate on swatch click — just preview
                  setHoveredVariant(idx);
                }}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: variant.colorHex,
                  border:
                    hoveredVariant === idx
                      ? "2px solid var(--nav-accent)"
                      : "2px solid var(--nav-border)",
                  outline:
                    hoveredVariant === idx
                      ? "1.5px solid var(--nav-accent)"
                      : "none",
                  outlineOffset: 2,
                  cursor: "pointer",
                  transition: "border 0.15s ease, outline 0.15s ease",
                  flexShrink: 0,
                }}
                aria-label={variant.colorName}
              />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
