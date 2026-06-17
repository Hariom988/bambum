"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Package, Trash2, X } from "lucide-react";
import { useWishlist } from "@/context/wishlistContext";
import { useCart } from "@/context/cartContext";
import { WishlistItem } from "@/lib/types/wishlist";

// ── Size Picker Modal ─────────────────────────────────────────────────────────

interface SizePickerModalProps {
  item: WishlistItem;
  onClose: () => void;
}

function SizePickerModal({ item, onClose }: SizePickerModalProps) {
  const { addItem: addToCart, openCart } = useCart();
  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([]);
  const [variants, setVariants] = useState<
    {
      colorName: string;
      colorHex: string;
      sizes: { size: string; stock: number }[];
    }[]
  >([]);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${encodeURIComponent(item.slug)}`)
      .then((r) => r.json())
      .then((d) => {
        const v = d.product?.variants ?? [];
        setVariants(v);
        setSizes(v[0]?.sizes ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [item.slug]);

  const handleSizeSelect = (
    size: string,
    stock: number,
    colorName: string,
    colorHex: string,
  ) => {
    if (stock === 0) return;
    addToCart({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      price: item.price,
      category: item.category,
      colorName,
      colorHex,
      size,
      image: item.image,
      stock,
    });
    openCart();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden"
        style={{ background: "#fff", border: "1px solid var(--nav-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--nav-border)" }}
        >
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--nav-fg)" }}
            >
              Move to Cart
            </p>
            <p
              className="text-[10px] mt-0.5 truncate max-w-[220px]"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              {item.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--nav-fg-muted)",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {variants.length > 1 && (
          <div
            className="flex items-center gap-2 px-5 py-3 flex-wrap"
            style={{ borderBottom: "1px solid var(--nav-border)" }}
          >
            <span
              className="text-[10px] font-bold tracking-widest uppercase mr-1"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              Color:
            </span>
            {variants.map((v, idx) => (
              <button
                key={idx}
                title={v.colorName}
                onClick={() => {
                  setActiveVariantIdx(idx);
                  setSizes(variants[idx]?.sizes ?? []);
                }}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: v.colorHex,
                  border:
                    activeVariantIdx === idx
                      ? "2px solid var(--brand-teal)"
                      : "2px solid rgba(0,0,0,0.15)",
                  outline:
                    activeVariantIdx === idx
                      ? "1.5px solid var(--brand-teal)"
                      : "none",
                  outlineOffset: 2,
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}

        <div className="p-5">
          <p
            className="text-[10px] font-bold tracking-widest uppercase mb-3"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            Select Size
          </p>
          {loading ? (
            <p className="text-xs" style={{ color: "var(--nav-fg-muted)" }}>
              Loading…
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => {
                const oos = s.stock === 0;
                const av = variants[activeVariantIdx];
                return (
                  <button
                    key={s.size}
                    disabled={oos}
                    onClick={() =>
                      handleSizeSelect(
                        s.size,
                        s.stock,
                        av?.colorName ?? "",
                        av?.colorHex ?? "",
                      )
                    }
                    className="px-4 py-2 text-xs font-bold tracking-widest uppercase transition-all"
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
                        e.currentTarget.style.background = "var(--brand-teal)";
                        e.currentTarget.style.color = "#fff";
                        e.currentTarget.style.borderColor = "var(--brand-teal)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!oos) {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.color = "var(--nav-fg)";
                        e.currentTarget.style.borderColor = "var(--nav-border)";
                      }
                    }}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Wishlist Card ─────────────────────────────────────────────────────────────

function WishlistCard({ item }: { item: WishlistItem }) {
  const { removeItem } = useWishlist();
  const [showSizePicker, setShowSizePicker] = useState(false);

  const discountPercent =
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100,
        )
      : null;

  return (
    <>
      {showSizePicker && (
        <SizePickerModal item={item} onClose={() => setShowSizePicker(false)} />
      )}
      <div
        className="overflow-hidden"
        style={{ background: "#fff", border: "1px solid var(--nav-border)" }}
      >
        {/* Image */}
        <Link
          href={`/products/${item.slug}`}
          className="block relative"
          style={{ aspectRatio: "3/4", background: "#e8f0ee" }}
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover object-top transition-opacity duration-150 hover:opacity-90"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package
                size={24}
                style={{ color: "var(--nav-accent)", opacity: 0.4 }}
              />
            </div>
          )}
          {discountPercent && (
            <div
              className="absolute top-3 left-3 px-2 py-1 text-[10px] font-bold tracking-wider uppercase"
              style={{
                background: "rgba(245,166,35,0.15)",
                border: "1px solid rgba(245,166,35,0.35)",
                color: "#B8760A",
              }}
            >
              {discountPercent}% OFF
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="p-4 flex flex-col gap-3">
          <div>
            <Link
              href={`/products/${item.slug}`}
              className="block no-underline"
              style={{ color: "inherit" }}
            >
              <p
                className="text-sm font-bold uppercase tracking-wide leading-snug line-clamp-1 transition-colors duration-150"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--brand-teal)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--nav-fg)")
                }
              >
                {item.name}
              </p>
            </Link>
            <p
              className="text-[10px] uppercase tracking-wide mt-0.5"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              {item.category}
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className="text-base font-bold"
              style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
            >
              ₹{item.price.toLocaleString("en-IN")}
            </span>
            {item.originalPrice && item.originalPrice > item.price && (
              <span
                className="text-xs line-through"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                ₹{item.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowSizePicker(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-all duration-150"
              style={{
                background: "var(--nav-fg)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--brand-teal)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--nav-fg)")
              }
            >
              <ShoppingBag size={12} /> Move to Cart
            </button>
            <button
              onClick={() => removeItem(item.productId)}
              aria-label="Remove from wishlist"
              className="flex items-center justify-center w-10 transition-all duration-150"
              style={{
                border: "1px solid var(--nav-border)",
                background: "transparent",
                color: "var(--nav-fg-muted)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(217,79,61,0.3)";
                e.currentTarget.style.color = "var(--nav-sale)";
                e.currentTarget.style.background = "rgba(217,79,61,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--nav-border)";
                e.currentTarget.style.color = "var(--nav-fg-muted)";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function WishlistPage() {
  const { items, totalItems, removeItem } = useWishlist();

  return (
    <div className="flex flex-col gap-4">
      {/* Header card — mirrors orders page pattern */}
      <div
        className="flex items-center gap-4 px-6 py-4"
        style={{
          background: "#fff",
          border: "1px solid var(--nav-border)",
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="w-9 h-9 flex items-center justify-center shrink-0"
          style={{
            background: "rgba(25,99,94,0.08)",
            border: "1px solid var(--nav-border)",
          }}
        >
          <Heart size={15} style={{ color: "var(--brand-teal)" }} />
        </div>
        <div className="flex-1">
          <p
            className="text-[10px] font-bold tracking-[0.16em] uppercase"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            Saved Items
          </p>
          <p
            className="text-sm font-bold"
            style={{ color: "var(--nav-fg)", fontFamily: "var(--nav-font)" }}
          >
            My Wishlist
          </p>
        </div>
        <span
          className="text-[10px] font-bold px-2.5 py-1"
          style={{
            background: "rgba(25,99,94,0.08)",
            border: "1px solid rgba(25,99,94,0.2)",
            color: "var(--brand-teal)",
          }}
        >
          {totalItems} {totalItems === 1 ? "Item" : "Items"}
        </span>
      </div>

      {/* Empty state */}
      {totalItems === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 text-center"
          style={{ background: "#fff", border: "1px solid var(--nav-border)" }}
        >
          <div
            className="w-14 h-14 flex items-center justify-center mb-4"
            style={{
              background: "rgba(25,99,94,0.08)",
              border: "1px solid var(--nav-border)",
            }}
          >
            <Heart
              size={22}
              style={{ color: "var(--brand-teal)", opacity: 0.6 }}
            />
          </div>
          <p
            className="text-base font-bold uppercase tracking-widest mb-2"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            No saved items yet
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--nav-fg-muted)" }}>
            Tap the heart icon on any product to save it here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold tracking-[0.14em] uppercase no-underline"
            style={{ background: "var(--brand-teal)", color: "#fff" }}
          >
            <ShoppingBag size={13} /> Shop Now
          </Link>
        </div>
      ) : (
        /* Grid — matches product listing layout */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <WishlistCard key={item.productId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
