"use client";

import { use, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Check,
  Minus,
  Plus,
  AlertTriangle,
  Truck,
  RotateCcw,
  Leaf,
} from "lucide-react";
import { useCart } from "@/context/cartContext";

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
  description: string;
  price: number;
  category: string;
  stock: number;
  variants: ProductVariant[];
}

interface Props {
  params: Promise<{ slug: string }>;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--nav-bg)", fontFamily: "var(--nav-font-ui)" }}
    >
      <div
        className="h-0.5 w-full"
        style={{ background: "var(--nav-accent)" }}
      />
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start animate-pulse">
          <div
            className="aspect-3/4 w-full"
            style={{ background: "var(--nav-border)" }}
          />
          <div className="flex flex-col gap-6 pt-4">
            {[24, 48, 24, 1, 28, 1, 80].map((h, i) => (
              <div
                key={i}
                style={{
                  height: h === 1 ? 1 : h,
                  width:
                    h === 1
                      ? "100%"
                      : ["100%", "75%", "25%", "100%", "100%", "100%", "100%"][
                          i
                        ],
                  background: "var(--nav-border)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProductPage({ params }: Props) {
  const { slug } = use(params);
  const { addItem, isInCart, getItemQty } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound404, setNotFound404] = useState(false);

  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (r.status === 404) {
          setNotFound404(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.product) setProduct(d.product);
        else if (d !== null) setNotFound404(true);
      })
      .catch(() => setNotFound404(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Skeleton />;
  if (notFound404 || !product) return notFound();

  const variant = product.variants[activeVariantIdx];
  const stock = product.stock ?? 0;
  const inCart = isInCart(product._id ?? product.slug, variant.colorName);
  const cartQty = getItemQty(product._id ?? product.slug, variant.colorName);
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 10;
  const maxQty = Math.max(0, stock - cartQty);

  const switchVariant = (idx: number) => {
    setActiveVariantIdx(idx);
    setActiveImageIdx(0);
    setQty(1);
  };

  const prevImage = () =>
    setActiveImageIdx(
      (i) => (i - 1 + variant.images.length) % variant.images.length,
    );
  const nextImage = () =>
    setActiveImageIdx((i) => (i + 1) % variant.images.length);

  const handleAddToCart = () => {
    if (isOutOfStock || maxQty <= 0) return;

    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product._id ?? product.slug,
        slug: product.slug,
        name: product.name,
        price: product.price,
        category: product.category,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        image: variant.images[0] ?? "",
        stock,
      });
    }

    // Show "Added" flash
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1800);
    setQty(1); // reset local qty after adding
  };

  return (
    <>
      <style>{`
        .thumb-btn {
          transition: border-color 0.18s ease, opacity 0.18s ease;
          opacity: 0.65;
        }
        .thumb-btn:hover { opacity: 1; }
        .thumb-btn.active { opacity: 1; border-color: var(--nav-accent) !important; }

        .swatch-btn { transition: outline 0.15s ease, border-color 0.15s ease; }
        .swatch-btn:hover { outline: 2px solid var(--nav-accent); outline-offset: 2px; }
        .swatch-btn.active {
          border-color: var(--nav-accent) !important;
          outline: 2px solid var(--nav-accent); outline-offset: 2px;
        }

        .nav-arrow { transition: background 0.18s ease, color 0.18s ease; }
        .nav-arrow:hover {
          background: var(--nav-accent) !important;
          color: #fff !important;
        }

        /* ── Add to Cart button ── */
        .atc-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          flex: 1; padding: 16px 24px;
          font-family: var(--nav-font-ui); font-size: 11px;
          font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          border: none; cursor: pointer;
          transition: background 0.2s ease, transform 0.12s ease, box-shadow 0.2s ease;
          position: relative; overflow: hidden;
        }
        .atc-btn.idle {
          background: var(--nav-fg); color: #fff;
        }
        .atc-btn.idle:hover {
          background: var(--nav-accent);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(200,169,126,0.3);
        }
        .atc-btn.idle:active { transform: translateY(0); }
        .atc-btn.added {
          background: var(--nav-accent); color: #fff;
        }
        .atc-btn.out {
          background: #e8e0d5; color: #b0a898; cursor: not-allowed;
        }

        /* Ripple on add */
        @keyframes atcRipple {
          from { transform: scale(0); opacity: 0.4; }
          to { transform: scale(3); opacity: 0; }
        }
        .atc-ripple {
          position: absolute; width: 60px; height: 60px; border-radius: 50%;
          background: rgba(255,255,255,0.35); pointer-events: none;
          animation: atcRipple 0.6s ease forwards;
        }

        /* Qty stepper */
        .qty-btn {
          width: 44px; height: 50px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--nav-border); background: transparent; cursor: pointer;
          color: var(--nav-fg-muted);
          transition: background 0.15s, border-color 0.15s, color 0.15s;
          flex-shrink: 0;
        }
        .qty-btn:hover:not(:disabled) {
          border-color: var(--nav-accent); color: var(--nav-accent);
          background: rgba(200,169,126,0.08);
        }
        .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Trust badges */
        .trust-badge {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px;
          border: 1px solid var(--nav-border);
          transition: border-color 0.2s ease;
          flex: 1;
        }
        .trust-badge:hover { border-color: var(--nav-accent); }

        /* Page entrance */
        @keyframes pdpFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .pdp-enter {
          animation: pdpFadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        .pdp-enter-delay-1 { animation-delay: 0.08s; }
        .pdp-enter-delay-2 { animation-delay: 0.16s; }

        /* Low stock pulse */
        @keyframes stockPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .stock-dot { animation: stockPulse 2s ease-in-out infinite; }
      `}</style>

      <main
        className="min-h-screen"
        style={{
          background: "var(--nav-bg)",
          color: "var(--nav-fg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        {/* Thin top accent */}
        <div
          className="h-0.5 w-full"
          style={{ background: "var(--nav-accent)" }}
        />

        <div className="max-w-6xl mx-auto px-4 py-10 md:py-16">
          {/* ── Breadcrumb ── */}
          <nav
            className="flex items-center gap-2 mb-8 text-[0.7rem] font-semibold tracking-[0.12em] uppercase pdp-enter"
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

          {/* ── Main layout ── */}
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            {/* ══ LEFT — Gallery ══ */}
            <div className="flex gap-3 pdp-enter">
              {/* Thumbnails */}
              <div
                className="hidden sm:flex flex-col gap-2"
                style={{ width: 72 }}
              >
                {variant.images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`thumb-btn relative overflow-hidden shrink-0 ${activeImageIdx === idx ? "active" : ""}`}
                    style={{
                      width: 72,
                      height: 90,
                      border: "1px solid var(--nav-border)",
                      background: "var(--nav-bg)",
                      padding: 0,
                      cursor: "pointer",
                    }}
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

                  {/* Out of stock overlay */}
                  {isOutOfStock && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: "rgba(245,240,232,0.75)",
                        backdropFilter: "blur(2px)",
                      }}
                    >
                      <div
                        className="px-5 py-2.5 text-xs font-bold tracking-[0.18em] uppercase"
                        style={{ background: "var(--nav-fg)", color: "#fff" }}
                      >
                        Out of Stock
                      </div>
                    </div>
                  )}

                  <button
                    className="nav-arrow absolute left-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9"
                    onClick={prevImage}
                    aria-label="Previous image"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1px solid var(--nav-border)",
                      color: "var(--nav-fg)",
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    className="nav-arrow absolute right-2 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9"
                    onClick={nextImage}
                    aria-label="Next image"
                    style={{
                      background: "rgba(255,255,255,0.85)",
                      border: "1px solid var(--nav-border)",
                      color: "var(--nav-fg)",
                      cursor: "pointer",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <ChevronRight size={18} />
                  </button>

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

                {/* Mobile thumbnails */}
                <div className="flex sm:hidden gap-2 mt-2 overflow-x-auto pb-1">
                  {variant.images.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`thumb-btn relative overflow-hidden shrink-0 ${activeImageIdx === idx ? "active" : ""}`}
                      style={{
                        width: 56,
                        height: 70,
                        border: "1px solid var(--nav-border)",
                        background: "var(--nav-bg)",
                        padding: 0,
                        cursor: "pointer",
                      }}
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

            {/* ══ RIGHT — Info ══ */}
            <div className="flex flex-col gap-6 pdp-enter pdp-enter-delay-1">
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
              <div className="flex items-baseline gap-3">
                <p
                  className="text-2xl font-bold"
                  style={{
                    color: "var(--nav-fg)",
                    fontFamily: "var(--nav-font)",
                  }}
                >
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
                <span
                  className="text-xs font-normal tracking-wider"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  incl. of all taxes
                </span>
              </div>

              <div
                className="h-px"
                style={{ background: "var(--nav-border)" }}
              />

              {/* ── Stock status ── */}
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <>
                    <AlertTriangle
                      size={13}
                      style={{ color: "var(--nav-sale)" }}
                    />
                    <span
                      className="text-xs font-bold tracking-wide uppercase"
                      style={{ color: "var(--nav-sale)" }}
                    >
                      Out of Stock
                    </span>
                  </>
                ) : isLowStock ? (
                  <>
                    <span
                      className="stock-dot w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "#e67e22", display: "inline-block" }}
                    />
                    <span
                      className="text-xs font-semibold tracking-wide"
                      style={{ color: "#e67e22" }}
                    >
                      Only {stock} left in stock — order soon
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "#27ae60", display: "inline-block" }}
                    />
                    <span
                      className="text-xs font-semibold tracking-wide"
                      style={{ color: "#27ae60" }}
                    >
                      In Stock
                    </span>
                  </>
                )}
              </div>

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
                      key={`${v.colorName}-${idx}`}
                      className={`swatch-btn ${activeVariantIdx === idx ? "active" : ""}`}
                      title={v.colorName}
                      onClick={() => switchVariant(idx)}
                      aria-label={v.colorName}
                      aria-pressed={activeVariantIdx === idx}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: v.colorHex,
                        border: "2px solid var(--nav-border)",
                        cursor: "pointer",
                        flexShrink: 0,
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div
                className="h-px"
                style={{ background: "var(--nav-border)" }}
              />

              {/* ── Quantity + Add to Cart ── */}
              {!isOutOfStock && (
                <div>
                  <p
                    className="text-[0.7rem] font-bold tracking-[0.14em] uppercase mb-3"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    Quantity
                  </p>
                  <div className="flex items-stretch gap-3">
                    {/* Qty stepper */}
                    <div
                      className="flex items-stretch"
                      style={{ border: "1px solid var(--nav-border)" }}
                    >
                      <button
                        className="qty-btn"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <div
                        className="flex items-center justify-center font-bold text-sm"
                        style={{
                          width: 52,
                          borderLeft: "1px solid var(--nav-border)",
                          borderRight: "1px solid var(--nav-border)",
                          color: "var(--nav-fg)",
                          fontFamily: "var(--nav-font)",
                        }}
                      >
                        {qty}
                      </div>
                      <button
                        className="qty-btn"
                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        disabled={qty >= maxQty}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <button
                      className={`atc-btn ${isOutOfStock || maxQty <= 0 ? "out" : addedAnim ? "added" : "idle"}`}
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || maxQty <= 0}
                    >
                      {addedAnim ? (
                        <>
                          <Check size={16} strokeWidth={2.5} />
                          Added to Cart!
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={15} />
                          {inCart ? "Add More" : "Add to Cart"}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Already in cart note */}
                  {inCart && cartQty > 0 && (
                    <p
                      className="text-[10px] mt-2 tracking-wide"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      {cartQty} already in your cart
                      {maxQty === 0 && " · max stock reached"}
                    </p>
                  )}
                </div>
              )}

              {/* Out of stock CTA */}
              {isOutOfStock && (
                <div
                  className="flex items-center gap-3 p-4"
                  style={{
                    background: "rgba(217,79,61,0.05)",
                    border: "1px solid rgba(217,79,61,0.15)",
                  }}
                >
                  <AlertTriangle
                    size={16}
                    style={{ color: "var(--nav-sale)", flexShrink: 0 }}
                  />
                  <div>
                    <p
                      className="text-xs font-bold tracking-wide"
                      style={{ color: "var(--nav-fg)" }}
                    >
                      Currently unavailable
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Check back soon or explore other colours.
                    </p>
                  </div>
                </div>
              )}

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

              {/* ── Trust badges ── */}
              <div className="flex flex-col sm:flex-row gap-2 pdp-enter pdp-enter-delay-2">
                {[
                  {
                    icon: Truck,
                    label: "Free Shipping",
                    sub: "On orders above ₹499",
                  },
                  {
                    icon: RotateCcw,
                    label: "Easy Returns",
                    sub: "Within 48 hours",
                  },
                  {
                    icon: Leaf,
                    label: "Eco-Friendly",
                    sub: "100% Bamboo Fabric",
                  },
                ].map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="trust-badge"
                    style={{ background: "#fff" }}
                  >
                    <Icon
                      size={15}
                      style={{ color: "var(--nav-accent)", flexShrink: 0 }}
                      strokeWidth={1.75}
                    />
                    <div>
                      <p
                        className="text-[10px] font-bold tracking-[0.1em] uppercase"
                        style={{ color: "var(--nav-fg)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-[9px] tracking-wide mt-0.5"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
