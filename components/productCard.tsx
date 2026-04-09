"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
}

interface Product {
  _id?: string;
  id?: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  variants: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
  onNavigate?: (slug: string) => void;
}

export default function ProductCard({ product, onNavigate }: ProductCardProps) {
  const [activeVariant, setActiveVariant] = useState(0);
  const variant = product.variants[activeVariant];
  const firstImage = variant?.images?.[0];

  if (!variant || !firstImage) return null;

  const handleCardClick = (e: React.MouseEvent) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(product.slug);
  };

  return (
    <a
      href={`/products/${product.slug}`}
      onClick={handleCardClick}
      className="group block no-underline"
      style={{ color: "inherit" }}
    >
      <div
        className="transition-all duration-300"
        style={{
          background: "#fff",
          border: "1px solid var(--nav-border)",
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
        {/* Image */}
        <div
          className="relative overflow-hidden aspect-[3/4]"
          style={{ background: "var(--nav-bg)" }}
        >
          <Image
            src={firstImage}
            alt={`${product.name} – ${variant.colorName}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />

          {/* Category badge */}
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

          {/* View hint */}
          <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
            <span
              className="px-4 py-2 text-[0.65rem] font-bold tracking-[0.16em] uppercase opacity-0 translate-y-2 transition-all duration-250 group-hover:opacity-100 group-hover:translate-y-0"
              style={{ background: "var(--nav-accent)", color: "#fff" }}
            >
              View Details →
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-sm font-bold uppercase tracking-widest leading-snug"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
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

          <p
            className="text-[0.65rem] tracking-[0.12em] uppercase"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            {variant.colorName}
          </p>

          {/* Swatches */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.variants.map((v, idx) => (
              <button
                key={`${v.colorName}-${idx}`}
                title={v.colorName}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveVariant(idx);
                }}
                aria-label={v.colorName}
                aria-pressed={activeVariant === idx}
                className="transition-all duration-150 shrink-0"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: v.colorHex,
                  border:
                    activeVariant === idx
                      ? "2px solid var(--nav-accent)"
                      : "2px solid var(--nav-border)",
                  outline:
                    activeVariant === idx
                      ? "1.5px solid var(--nav-accent)"
                      : "none",
                  outlineOffset: 2,
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </a>
  );
}
