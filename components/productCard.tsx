"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/context/cartContext";
import { Minus, Plus, ShoppingBag, X, ChevronUp } from "lucide-react";
import Link from "next/link";

interface ProductSize {
  size: string;
  stock: number;
}

interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
  sizes?: ProductSize[];
}

interface Product {
  _id?: string;
  id?: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  category: string;
  variants: ProductVariant[];
}

interface ProductCardProps {
  product: Product;
  onNavigate?: (slug: string) => void;
}

export default function ProductCard({ product, onNavigate }: ProductCardProps) {
  const { addItem, removeItem, updateQty, isInCart, getItemQty } = useCart();

  const [activeVariant, setActiveVariant] = useState(0);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>(
    {},
  );
  const popoverRef = useRef<HTMLDivElement>(null);

  const variant = product.variants[activeVariant];
  const firstImage = variant?.images?.[0];
  const productId = product._id ?? product.slug;
  const selectedSize = selectedSizes[activeVariant] ?? null;

  // ✅ sizes must exist AND have at least one entry
  const hasSizes = Array.isArray(variant?.sizes) && variant.sizes.length > 0;
  const totalStock = variant?.sizes?.reduce((s, v) => s + v.stock, 0) ?? 0;
  const isOutOfStock = hasSizes && totalStock === 0;

  const inCart = selectedSize
    ? isInCart(productId, variant.colorName, selectedSize)
    : false;
  const cartQty = selectedSize
    ? getItemQty(productId, variant.colorName, selectedSize)
    : 0;
  const activeSizeStock =
    variant?.sizes?.find((s) => s.size === selectedSize)?.stock ?? 0;
  const maxQty = Math.max(0, activeSizeStock - cartQty);

  // Close popover on outside click
  useEffect(() => {
    if (!showSizePicker) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setShowSizePicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSizePicker]);

  if (!variant || !firstImage) return null;

  const originalPrice = product.originalPrice ?? null;
  const discountPercent =
    originalPrice && originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : null;
  const rating = product.rating ?? 4.9;

  // ✅ Only navigate if NO sizes data at all — never navigate when hasSizes is true
  const handleCardClick = (e: React.MouseEvent) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(product.slug);
  };

  const handleSizeSelect = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();
    const sizeData = variant.sizes?.find((s) => s.size === size);
    if (!sizeData || sizeData.stock === 0) return;

    setSelectedSizes((prev) => ({ ...prev, [activeVariant]: size }));

    const alreadyIn = isInCart(productId, variant.colorName, size);
    if (!alreadyIn) {
      addItem({
        productId,
        slug: product.slug,
        name: product.name,
        price: product.price,
        category: product.category,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        size,
        image: variant.images[0] ?? "",
        stock: sizeData.stock,
      });
    }
    setShowSizePicker(false);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    // ✅ If sizes loaded → show picker. Never navigate.
    // Only navigate as last resort if sizes truly didn't load from API.
    if (hasSizes) {
      setShowSizePicker((v) => !v);
      return;
    }

    // sizes not in DB at all → go to PDP
    onNavigate?.(product.slug);
  };

  const handleIncrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize || maxQty <= 0) return;
    updateQty(productId, variant.colorName, selectedSize, cartQty + 1);
  };

  const handleDecrease = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedSize) return;
    if (cartQty <= 1) {
      removeItem(productId, variant.colorName, selectedSize);
      setSelectedSizes((prev) => {
        const next = { ...prev };
        delete next[activeVariant];
        return next;
      });
    } else {
      updateQty(productId, variant.colorName, selectedSize, cartQty - 1);
    }
  };

  const renderStars = (r: number) => {
    const full = Math.floor(r);
    const half = r % 1 >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full;
          const isHalf = !filled && i === full && half;
          return (
            <svg key={i} width="11" height="11" viewBox="0 0 24 24">
              <defs>
                <linearGradient id={`hg-${product.slug}-${i}`}>
                  <stop offset="50%" stopColor="#F5A623" />
                  <stop offset="50%" stopColor="#E0E0E0" />
                </linearGradient>
              </defs>
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill={
                  filled
                    ? "#F5A623"
                    : isHalf
                      ? `url(#hg-${product.slug}-${i})`
                      : "#E0E0E0"
                }
              />
            </svg>
          );
        })}
        <span
          className="ml-1 text-[10px] font-bold"
          style={{ color: "#F5A623" }}
        >
          {r.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      onClick={handleCardClick}
      className="group block no-underline h-full"
      style={{ color: "inherit" }}
    >
      <div
        className="flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          background: "#fff",
          border: "1px solid var(--nav-border)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          fontFamily: "var(--nav-font-ui)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 8px 32px rgba(25,99,94,0.13)";
          (e.currentTarget as HTMLDivElement).style.transform =
            "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0 2px 12px rgba(0,0,0,0.06)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        {/* ── Image ── */}
        <div
          className="relative overflow-hidden flex-shrink-0"
          style={{ aspectRatio: "3/4", background: "#e8f0ee" }}
        >
          <Image
            src={firstImage}
            alt={`${product.name} – ${variant.colorName}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />

          {discountPercent && (
            <div
              className="absolute top-3 left-3 px-2 py-1 text-[10px] font-bold tracking-wider uppercase"
              style={{
                background: "rgba(245,166,35,0.15)",
                border: "1px solid rgba(245,166,35,0.35)",
                color: "#B8760A",
                borderRadius: "4px",
              }}
            >
              {discountPercent}% OFF
            </div>
          )}

          {isOutOfStock && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(245,240,232,0.72)" }}
            >
              <span
                className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase"
                style={{
                  background: "var(--nav-fg)",
                  color: "#fff",
                  borderRadius: "4px",
                }}
              >
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div
          className="flex flex-col gap-2 p-3 flex-1"
          style={{ background: "#f5ece3" }}
        >
          <h3
            className="text-sm font-bold leading-snug line-clamp-1 uppercase tracking-wide"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            {product.name}
          </h3>

          <p className="text-[11px] line-clamp-1" style={{ color: "#6b7b78" }}>
            {product.description ?? "Size and Description"}
          </p>

          <div className="flex items-baseline gap-2">
            <span
              className="text-base font-bold"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
            >
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {originalPrice && originalPrice > product.price && (
              <span
                className="text-xs line-through"
                style={{ color: "#9eaca9" }}
              >
                ₹{originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {discountPercent && (
            <p
              className="text-[11px] font-semibold"
              style={{ color: "var(--brand-teal)" }}
            >
              Save {discountPercent}% OFF on this Deal
            </p>
          )}

          {/* Swatches + Rating */}
          <div className="flex items-center justify-between gap-2 mt-auto pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.variants.map((v, idx) => (
                <button
                  key={`${v.colorName}-${idx}`}
                  title={v.colorName}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveVariant(idx);
                    setShowSizePicker(false);
                  }}
                  aria-label={v.colorName}
                  className="transition-all duration-150 shrink-0"
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: v.colorHex,
                    border:
                      activeVariant === idx
                        ? "2px solid var(--brand-teal)"
                        : "2px solid rgba(0,0,0,0.15)",
                    outline:
                      activeVariant === idx
                        ? "1.5px solid var(--brand-teal)"
                        : "none",
                    outlineOffset: 2,
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>
            {renderStars(rating)}
          </div>

          {/* ── Cart zone ── */}
          <div
            className="relative mt-1"
            ref={popoverRef}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Size picker popover */}
            {showSizePicker && hasSizes && (
              <div
                className="absolute bottom-full left-0 right-0 mb-2 z-30 rounded-xl overflow-hidden"
                style={{
                  background: "#fff",
                  border: "1px solid var(--nav-border)",
                  boxShadow: "0 -4px 24px rgba(0,0,0,0.13)",
                }}
              >
                <div
                  className="flex items-center justify-between px-3 py-2"
                  style={{
                    borderBottom: "1px solid var(--nav-border)",
                    background: "var(--nav-dropdown-bg)",
                  }}
                >
                  <span
                    className="text-[10px] font-bold tracking-[0.14em] uppercase"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Select Size
                  </span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowSizePicker(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--nav-fg-muted)",
                      display: "flex",
                      padding: 2,
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="p-2.5 flex flex-wrap gap-1.5">
                  {variant.sizes!.map((s) => {
                    const oos = s.stock === 0;
                    return (
                      <button
                        key={s.size}
                        disabled={oos}
                        onClick={(e) => handleSizeSelect(e, s.size)}
                        className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all duration-150"
                        style={{
                          border: oos
                            ? "1px solid #e0e0e0"
                            : "1px solid var(--nav-border)",
                          background: oos ? "#f5f5f5" : "#fff",
                          color: oos ? "#bdbdbd" : "var(--nav-fg)",
                          cursor: oos ? "not-allowed" : "pointer",
                          textDecoration: oos ? "line-through" : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!oos) {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "var(--brand-teal)";
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "#fff";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "var(--brand-teal)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!oos) {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "#fff";
                            (e.currentTarget as HTMLButtonElement).style.color =
                              "var(--nav-fg)";
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.borderColor = "var(--nav-border)";
                          }
                        }}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-1 pb-2">
                  <ChevronUp
                    size={10}
                    style={{ color: "var(--nav-fg-muted)" }}
                  />
                  <p
                    className="text-[9px]"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    Adds 1 to cart instantly
                  </p>
                </div>
              </div>
            )}

            {/* Qty controls */}
            {inCart && selectedSize ? (
              <div
                className="flex items-center overflow-hidden rounded-xl"
                style={{
                  border: "1px solid var(--brand-teal)",
                  background: "#fff",
                }}
              >
                <button
                  onClick={handleDecrease}
                  className="flex items-center justify-center transition-colors duration-150"
                  style={{
                    width: 44,
                    height: 44,
                    background: "var(--brand-teal)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>

                <span
                  className="flex-1 text-center text-sm font-bold"
                  style={{
                    color: "var(--brand-teal)",
                    fontFamily: "var(--nav-font)",
                  }}
                >
                  {cartQty}
                </span>

                <button
                  onClick={handleIncrease}
                  disabled={maxQty <= 0}
                  className="flex items-center justify-center transition-colors duration-150"
                  style={{
                    width: 44,
                    height: 44,
                    background: maxQty <= 0 ? "#c8d8d5" : "var(--brand-teal)",
                    color: "#fff",
                    border: "none",
                    cursor: maxQty <= 0 ? "not-allowed" : "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddToCartClick}
                disabled={isOutOfStock}
                className="w-full flex items-center justify-center gap-2 font-bold tracking-[0.1em] uppercase rounded-xl transition-all duration-200"
                style={{
                  height: 44,
                  fontSize: "12px",
                  background: isOutOfStock ? "#c8d8d5" : "var(--nav-fg)",
                  color: isOutOfStock ? "#7a9a96" : "#fff",
                  border: "none",
                  cursor: isOutOfStock ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isOutOfStock)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--brand-teal)";
                }}
                onMouseLeave={(e) => {
                  if (!isOutOfStock)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--nav-fg)";
                }}
              >
                <ShoppingBag size={13} />
                {isOutOfStock ? "Sold Out" : "Add to Cart"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
