// components/wishlistDrawer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Heart,
  Trash2,
  ArrowRight,
  Package,
  ShoppingBag,
  ChevronRight,
} from "lucide-react";
import { useWishlist } from "@/context/wishlistContext";
import { useCart } from "@/context/cartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { WishlistItem } from "@/lib/types/wishlist";

// ── Move-to-Cart popover (size picker) ────────────────────────────────────────
// Fetches sizes for the product on demand, shows a picker, then calls addItem.

interface SizePickerProps {
  item: WishlistItem;
  onClose: () => void;
}

function SizePicker({ item, onClose }: SizePickerProps) {
  const { addItem: addToCart, openCart } = useCart();
  const { closeWishlist } = useWishlist();

  interface SizeEntry {
    size: string;
    stock: number;
  }
  const [sizes, setSizes] = useState<SizeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState<
    { colorName: string; colorHex: string; sizes: SizeEntry[] }[]
  >([]);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setSizes(variants[activeVariantIdx]?.sizes ?? []);
  }, [activeVariantIdx, variants]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

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
    closeWishlist();
    openCart();
    onClose();
  };

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 right-0 mb-2 z-30 overflow-hidden"
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
          background: "var(--nav-dropdown-bg, rgba(200,169,126,0.06))",
        }}
      >
        <span
          className="text-[10px] font-bold tracking-[0.14em] uppercase"
          style={{ color: "var(--nav-fg-muted)" }}
        >
          Select Size to Add
        </span>
        <button
          onClick={onClose}
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

      {/* Color swatches — only shown if product has multiple variants */}
      {variants.length > 1 && (
        <div
          className="flex items-center gap-2 px-3 pt-2.5 pb-1 flex-wrap"
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
              onClick={() => setActiveVariantIdx(idx)}
              style={{
                width: 16,
                height: 16,
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
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}

      <div className="p-2.5 flex flex-wrap gap-1.5">
        {loading ? (
          <p
            className="text-[10px] px-2 py-1"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            Loading sizes…
          </p>
        ) : sizes.length === 0 ? (
          <p
            className="text-[10px] px-2 py-1"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            No sizes available
          </p>
        ) : (
          sizes.map((s) => {
            const oos = s.stock === 0;
            const activeVariant = variants[activeVariantIdx];
            return (
              <button
                key={s.size}
                disabled={oos}
                onClick={() =>
                  handleSizeSelect(
                    s.size,
                    s.stock,
                    activeVariant?.colorName ?? "",
                    activeVariant?.colorHex ?? "",
                  )
                }
                className="px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-all duration-150"
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
          })
        )}
      </div>
    </div>
  );
}

// ── Wishlist Item Row ─────────────────────────────────────────────────────────

function WishlistItemRow({ item }: { item: WishlistItem }) {
  const { removeItem } = useWishlist();
  const [showSizePicker, setShowSizePicker] = useState(false);

  const discountPercent =
    item.originalPrice && item.originalPrice > item.price
      ? Math.round(
          ((item.originalPrice - item.price) / item.originalPrice) * 100,
        )
      : null;

  return (
    <div
      className="wl-item-row wl-item-animate flex gap-4 p-5"
      style={{ borderBottom: "1px solid var(--nav-border)" }}
    >
      {/* Product image — links to PDP */}
      <Link
        href={`/products/${item.slug}`}
        className="shrink-0 block overflow-hidden relative"
        style={{
          width: 72,
          height: 88,
          border: "1px solid var(--nav-border)",
          background: "var(--nav-bg)",
        }}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="72px"
            className="object-cover object-center transition-opacity duration-150 hover:opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package
              size={20}
              style={{ color: "var(--nav-accent)", opacity: 0.4 }}
            />
          </div>
        )}
      </Link>

      {/* Info + actions */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <Link
              href={`/products/${item.slug}`}
              className="block no-underline"
              style={{ color: "inherit" }}
            >
              <p
                className="text-sm font-bold uppercase tracking-wide leading-tight truncate transition-colors duration-150"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--nav-accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--nav-fg)")
                }
              >
                {item.name}
              </p>
            </Link>
            <p
              className="text-[10px] tracking-[0.1em] uppercase mt-0.5"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              {item.category}
            </p>
          </div>

          {/* Remove button */}
          <button
            className="wl-remove-btn flex-shrink-0"
            onClick={() => removeItem(item.productId)}
            aria-label={`Remove ${item.name} from wishlist`}
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span
            className="text-sm font-bold"
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
          {discountPercent && (
            <span
              className="text-[10px] font-bold"
              style={{ color: "var(--brand-teal)" }}
            >
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Move to Cart — relative so SizePicker can anchor to it */}
        <div className="relative">
          {showSizePicker && (
            <SizePicker item={item} onClose={() => setShowSizePicker(false)} />
          )}
          <button
            onClick={() => setShowSizePicker((v) => !v)}
            className="wl-move-btn flex items-center gap-1.5"
          >
            <ShoppingBag size={11} />
            Move to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Checkout Size Picker Modal ────────────────────────────────────────────────
// Shown when user clicks "Proceed to Checkout" from the wishlist drawer footer.
// Validates size selection before moving item to cart and navigating.

interface CheckoutSizePickerProps {
  item: WishlistItem;
  onClose: () => void;
  onConfirm: (
    size: string,
    colorName: string,
    colorHex: string,
    stock: number,
  ) => void;
}

function CheckoutSizePicker({
  item,
  onClose,
  onConfirm,
}: CheckoutSizePickerProps) {
  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([]);
  const [variants, setVariants] = useState<
    {
      colorName: string;
      colorHex: string;
      sizes: { size: string; stock: number }[];
    }[]
  >([]);
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
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

  useEffect(() => {
    setSizes(variants[activeVariantIdx]?.sizes ?? []);
    setSelectedSize(null);
  }, [activeVariantIdx, variants]);

  const handleConfirm = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    const activeVariant = variants[activeVariantIdx];
    const sizeData = sizes.find((s) => s.size === selectedSize);
    if (!sizeData || sizeData.stock === 0) return;
    onConfirm(
      selectedSize,
      activeVariant.colorName,
      activeVariant.colorHex,
      sizeData.stock,
    );
  };

  return (
    <div
      className="fixed inset-0 z-[210] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden"
        style={{ background: "#fff", border: "1px solid var(--nav-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            borderBottom: "1px solid var(--nav-border)",
            background: "var(--nav-dropdown-bg, rgba(200,169,126,0.06))",
          }}
        >
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--nav-fg)" }}
            >
              Select Size to Checkout
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

        {/* Color swatches — only when multiple variants */}
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
                onClick={() => setActiveVariantIdx(idx)}
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

        {/* Size grid */}
        <div className="p-5">
          <p
            className="text-[10px] font-bold tracking-widest uppercase mb-3"
            style={{
              color: sizeError ? "var(--nav-sale)" : "var(--nav-fg-muted)",
            }}
          >
            {sizeError ? "Please select a size to continue" : "Select Size"}
          </p>
          {loading ? (
            <p className="text-xs" style={{ color: "var(--nav-fg-muted)" }}>
              Loading…
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-5">
              {sizes.map((s) => {
                const oos = s.stock === 0;
                const active = selectedSize === s.size;
                return (
                  <button
                    key={s.size}
                    disabled={oos}
                    onClick={() => {
                      setSelectedSize(s.size);
                      setSizeError(false);
                    }}
                    className="px-4 py-2 text-xs font-bold tracking-widest uppercase transition-all"
                    style={{
                      border: active
                        ? "1px solid var(--brand-teal)"
                        : oos
                          ? "1px solid #e0e0e0"
                          : "1px solid var(--nav-border)",
                      background: active
                        ? "var(--brand-teal)"
                        : oos
                          ? "#f5f5f5"
                          : "#fff",
                      color: active
                        ? "#fff"
                        : oos
                          ? "#bdbdbd"
                          : "var(--nav-fg)",
                      cursor: oos ? "not-allowed" : "pointer",
                      textDecoration: oos ? "line-through" : "none",
                    }}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
          )}

          {/* Confirm CTA */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="wl-shop-btn"
            style={{ opacity: loading ? 0.5 : 1 }}
          >
            Proceed to Checkout <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Drawer ───────────────────────────────────────────────────────────────

export default function WishlistDrawer() {
  const { items, totalItems, isOpen, closeWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [checkoutItem, setCheckoutItem] = useState<WishlistItem | null>(null);

  // Close on Escape — dismisses checkout modal first, then drawer
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (checkoutItem) setCheckoutItem(null);
        else closeWishlist();
      }
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, closeWishlist, checkoutItem]);

  // Called by CheckoutSizePicker after a valid size is confirmed
  const handleCheckoutConfirm = (
    size: string,
    colorName: string,
    colorHex: string,
    stock: number,
  ) => {
    if (!checkoutItem) return;
    addToCart({
      productId: checkoutItem.productId,
      slug: checkoutItem.slug,
      name: checkoutItem.name,
      price: checkoutItem.price,
      category: checkoutItem.category,
      colorName,
      colorHex,
      size,
      image: checkoutItem.image,
      stock,
    });
    setCheckoutItem(null);
    closeWishlist();
    router.push("/checkout");
  };

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Checkout size validation modal — rendered above the drawer */}
      {checkoutItem && (
        <CheckoutSizePicker
          item={checkoutItem}
          onClose={() => setCheckoutItem(null)}
          onConfirm={handleCheckoutConfirm}
        />
      )}

      <style>{`
        .wl-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          z-index: 200; opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .wl-overlay.open { opacity: 1; pointer-events: all; }

        .wl-drawer {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(420px, 100vw);
          background: #fff;
          z-index: 201;
          display: flex; flex-direction: column;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.32, 0, 0.67, 0);
          box-shadow: -8px 0 40px rgba(0,0,0,0.12);
        }
        .wl-drawer.open {
          transform: translateX(0);
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .wl-item-row {
          transition: background 0.15s ease;
        }
        .wl-item-row:hover { background: rgba(200,169,126,0.04); }

        .wl-remove-btn {
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid transparent; background: transparent; cursor: pointer;
          color: var(--nav-fg-muted);
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          flex-shrink: 0;
        }
        .wl-remove-btn:hover {
          border-color: rgba(217,79,61,0.3);
          color: var(--nav-sale);
          background: rgba(217,79,61,0.06);
        }

        .wl-move-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 6px; padding: 7px 14px;
          font-family: var(--nav-font-ui); font-size: 10px;
          font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          border: 1px solid var(--nav-border); background: transparent;
          color: var(--nav-fg); cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .wl-move-btn:hover {
          background: var(--nav-fg);
          border-color: var(--nav-fg);
          color: #fff;
        }

        .wl-shop-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; padding: 16px;
          background: var(--nav-accent); color: #fff;
          border: none; cursor: pointer;
          font-family: var(--nav-font-ui); font-size: 12px;
          font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          transition: background 0.2s ease;
        }
        .wl-shop-btn:hover { background: var(--nav-accent-hover); }
        .wl-shop-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        @keyframes wlItemIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .wl-item-animate {
          animation: wlItemIn 0.3s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes wlBadgePop {
          0%   { transform: translate(30%,-30%) scale(1); }
          40%  { transform: translate(30%,-30%) scale(1.4); }
          70%  { transform: translate(30%,-30%) scale(0.9); }
          100% { transform: translate(30%,-30%) scale(1); }
        }
      `}</style>

      {/* Overlay */}
      <div
        className={`wl-overlay ${isOpen ? "open" : ""}`}
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`wl-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Wishlist"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{
            borderBottom: "1px solid var(--nav-border)",
            background: "var(--nav-bg)",
          }}
        >
          <div className="flex items-center gap-3">
            <Heart size={18} style={{ color: "var(--nav-accent)" }} />
            <div>
              <h2
                className="text-sm font-bold uppercase tracking-widest"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
              >
                Your Wishlist
              </h2>
              {totalItems > 0 && (
                <p
                  className="text-[10px] tracking-wide"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={closeWishlist}
            className="w-8 h-8 flex items-center justify-center transition-all duration-150"
            style={{
              border: "1px solid var(--nav-border)",
              color: "var(--nav-fg-muted)",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--nav-accent)";
              e.currentTarget.style.color = "var(--nav-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--nav-border)";
              e.currentTarget.style.color = "var(--nav-fg-muted)";
            }}
            aria-label="Close wishlist"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Gold accent line — matches CartDrawer ── */}
        <div
          className="h-0.5 shrink-0"
          style={{ background: "var(--nav-accent)" }}
        />

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-5">
              <div
                className="w-16 h-16 flex items-center justify-center"
                style={{
                  background: "rgba(200,169,126,0.1)",
                  border: "1px solid var(--nav-border)",
                }}
              >
                <Heart
                  size={28}
                  style={{ color: "var(--nav-accent)", opacity: 0.6 }}
                />
              </div>
              <div>
                <p
                  className="text-base font-bold uppercase tracking-widest mb-2"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  Your wishlist is empty
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Save products you love and come back to them anytime.
                </p>
              </div>
              <button
                onClick={() => {
                  closeWishlist();
                  router.push("/products");
                }}
                className="wl-shop-btn"
                style={{ width: "auto", padding: "12px 24px" }}
              >
                Explore Products <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div>
              {items.map((item, idx) => (
                <div
                  key={item.productId}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <WishlistItemRow item={item} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {items.length > 0 && (
          <div
            className="flex-shrink-0 p-5"
            style={{
              borderTop: "1px solid var(--nav-border)",
              background: "var(--nav-bg)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs tracking-wide"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                {totalItems} saved item{totalItems !== 1 ? "s" : ""}
              </span>
              <Link
                href="/profile/wishlist"
                onClick={closeWishlist}
                className="flex items-center gap-1 text-[11px] font-bold tracking-widests uppercase no-underline transition-colors duration-150"
                style={{ color: "var(--nav-accent)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--nav-accent-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--nav-accent)")
                }
              >
                View All <ChevronRight size={11} />
              </Link>
            </div>

            {/* Checkout CTA — mirrors cart drawer pattern */}
            <button
              onClick={() => setCheckoutItem(items[0])}
              className="wl-shop-btn"
            >
              Proceed to Checkout <ArrowRight size={14} />
            </button>

            <button
              onClick={() => {
                closeWishlist();
                router.push("/products");
              }}
              className="w-full text-center text-[11px] tracking-[0.1em] uppercase mt-3 py-2 transition-colors duration-150"
              style={{
                color: "var(--nav-fg-muted)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--nav-accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-fg-muted)")
              }
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
