"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, notFound } from "next/navigation";
import {
  ShoppingBag,
  Check,
  Minus,
  Plus,
  AlertTriangle,
  Ruler,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/context/cartContext";
import ProductReviews from "@/components/(productPage)/productReviews";
import BackButton from "@/components/backButton";

interface ProductSize {
  size: string;
  stock: number;
}

interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
  sizes: ProductSize[];
}

interface Product {
  _id?: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  category: string;
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
      style={{
        background: "var(--nav-bg)",
        fontFamily: "var(--nav-font-ui)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 animate-pulse">
        <div
          className="h-4 w-64 rounded mb-8"
          style={{ background: "var(--nav-border)" }}
        />
        <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
          <div>
            <div
              className="w-full rounded-2xl"
              style={{ aspectRatio: "1/1", background: "var(--nav-border)" }}
            />
            <div className="flex gap-3 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl flex-1"
                  style={{
                    aspectRatio: "1/1",
                    background: "var(--nav-border)",
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-5 pt-2">
            {[16, 36, 24, 1, 32, 60, 100].map((h, i) => (
              <div
                key={i}
                className="rounded"
                style={{
                  height: h,
                  background: "var(--nav-border)",
                  width: ["40%", "80%", "30%", "100%", "70%", "100%", "100%"][
                    i
                  ],
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ── Size Guide Modal ──────────────────────────────────────────────────────────
function SizeGuideModal({ onClose }: { onClose: () => void }) {
  const rows = [
    { label: "Small (S)", waistIn: "28–30", waistCm: "70–75" },
    { label: "Medium (M)", waistIn: "32–34", waistCm: "80–85" },
    { label: "Large (L)", waistIn: "36–38", waistCm: "90–95" },
    { label: "X-Large (XL)", waistIn: "40–42", waistCm: "100–105" },
    { label: "XXL", waistIn: "44–46", waistCm: "110–115" },
  ];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--nav-border)" }}
        >
          <h3
            className="font-bold text-base uppercase tracking-widest"
            style={{ fontFamily: "var(--nav-font)", color: "var(--nav-fg)" }}
          >
            Size Guide
          </h3>
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr style={{ background: "var(--brand-teal)", color: "#fff" }}>
                <th className="px-5 py-3 font-bold tracking-wider uppercase text-xs">
                  Size
                </th>
                <th className="px-5 py-3 font-bold tracking-wider uppercase text-xs text-center">
                  Waist (in)
                </th>
                <th className="px-5 py-3 font-bold tracking-wider uppercase text-xs text-center">
                  Waist (cm)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.label}
                  style={{
                    background: i % 2 === 0 ? "#f9f9f9" : "#fff",
                    borderBottom: "1px solid var(--nav-border)",
                  }}
                >
                  <td
                    className="px-5 py-3 font-semibold"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    {r.label}
                  </td>
                  <td
                    className="px-5 py-3 text-center"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {r.waistIn}
                  </td>
                  <td
                    className="px-5 py-3 text-center"
                    style={{ color: "var(--nav-fg-muted)" }}
                  >
                    {r.waistCm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i === Math.floor(rating) && rating % 1 >= 0.5;
        return (
          <svg key={i} width="16" height="16" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`sg-${i}`}>
                <stop offset="50%" stopColor="#F5A623" />
                <stop offset="50%" stopColor="#E0E0E0" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={filled ? "#F5A623" : half ? "url(#sg-0)" : "#E0E0E0"}
            />
          </svg>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { addItem, isInCart, getItemQty } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound404, setNotFound404] = useState(false);

  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [thumbStart, setThumbStart] = useState(0); // for thumbnail overflow
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const THUMB_VISIBLE = 4;

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
  const images = variant.images;

  const activeSizeData = variant.sizes?.find((s) => s.size === selectedSize);
  const currentStock = activeSizeData?.stock ?? 0;
  const totalColorStock = variant.sizes?.reduce((a, s) => a + s.stock, 0) ?? 0;
  const isOutOfStock = totalColorStock === 0;

  const productId = product._id ?? product.slug;
  const inCart = selectedSize
    ? isInCart(productId, variant.colorName, selectedSize)
    : false;
  const cartQty = selectedSize
    ? getItemQty(productId, variant.colorName, selectedSize)
    : 0;
  const maxQty = Math.min(10, Math.max(0, currentStock - cartQty));

  const originalPrice = product.originalPrice ?? null;
  const discountPercent =
    originalPrice && originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : null;
  const rating = product.rating ?? 4.9;
  const reviewCount = product.reviewCount ?? 128;

  const switchVariant = (idx: number) => {
    setActiveVariantIdx(idx);
    setActiveImageIdx(0);
    setThumbStart(0);
    setSelectedSize(null);
    setQty(1);
    setSizeError(false);
  };

  const goToImage = (idx: number) => {
    setActiveImageIdx(idx);
    // Auto-scroll thumbnails to keep active visible
    if (idx < thumbStart) setThumbStart(idx);
    else if (idx >= thumbStart + THUMB_VISIBLE)
      setThumbStart(idx - THUMB_VISIBLE + 1);
  };

  const prevImage = () =>
    goToImage((activeImageIdx - 1 + images.length) % images.length);
  const nextImage = () => goToImage((activeImageIdx + 1) % images.length);

  const thumbsCanScrollLeft = thumbStart > 0;
  const thumbsCanScrollRight = thumbStart + THUMB_VISIBLE < images.length;

  const handleAddToCart = (): boolean => {
    if (isOutOfStock) return false;
    if (!selectedSize) {
      setSizeError(true);
      return false;
    }
    if (maxQty <= 0) return false;

    for (let i = 0; i < qty; i++) {
      addItem({
        productId: productId,
        slug: product.slug,
        name: product.name,
        price: product.price,
        category: product.category,
        colorName: variant.colorName,
        colorHex: variant.colorHex,
        size: selectedSize,
        image: images[0] ?? "",
        stock: currentStock,
      });
    }
    setAddedAnim(true);
    setSizeError(false);
    setTimeout(() => setAddedAnim(false), 1800);
    setQty(1);
    return true;
  };

  const handleBuyNow = () => {
    const added = handleAddToCart();
    if (added) {
      setTimeout(() => router.push("/checkout"), 300);
    }
  };

  return (
    <>
      {showSizeGuide && (
        <SizeGuideModal onClose={() => setShowSizeGuide(false)} />
      )}

      <style>{`
        .pdp-size-btn {
          padding: 10px 20px;
          font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase;
          border: 1px solid var(--nav-border); background: #fff; color: var(--nav-fg);
          cursor: pointer; transition: all 0.15s ease; border-radius: 8px;
        }
        .pdp-size-btn:hover:not(:disabled) { border-color: var(--brand-teal);  }
        .pdp-size-btn.active { background: var(--brand-teal); border-color: var(--brand-teal); color: #ffffff; }
        .pdp-size-btn:disabled { opacity: 0.35; cursor: not-allowed; text-decoration: line-through; }

        .pdp-thumb { transition: all 0.15s ease; border-radius: 12px; overflow: hidden; }
        .pdp-thumb.active { outline: 2px solid var(--brand-teal); outline-offset: 2px; }
        .pdp-thumb:hover:not(.active) { outline: 2px solid var(--nav-border); outline-offset: 2px; }

        .swatch { transition: all 0.15s ease; }
        .swatch.active { outline: 2.5px solid var(--brand-teal); outline-offset: 3px; }
        .swatch:hover:not(.active) { outline: 2px solid var(--nav-fg-muted); outline-offset: 3px; }

        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(3px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .fade-up-1 { animation-delay: 0.08s; }
      `}</style>

      <main
        className="min-h-screen"
        style={{
          background: "var(--brand-background-page)",
          color: "var(--nav-fg)",
          fontFamily: "var(--nav-font-ui)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* ── Breadcrumb ── */}
          <div className="mb-4 fade-up">
            <BackButton fallbackHref="/products" label="Back" />
          </div>
          <nav
            className="flex items-center gap-2 mb-8 text-xs font-semibold tracking-widest uppercase fade-up"
            style={{ color: "var(--nav-fg-muted)" }}
          >
            <a
              href="/"
              className="hover:underline transition-colors"
              style={{ color: "var(--nav-fg-muted)", textDecoration: "none" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--brand-teal)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-fg-muted)")
              }
            >
              Home
            </a>
            <ChevronRight size={12} />
            <a
              href="/products"
              className="hover:underline transition-colors"
              style={{ color: "var(--nav-fg-muted)", textDecoration: "none" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--brand-teal)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-fg-muted)")
              }
            >
              Shop
            </a>
            <ChevronRight size={12} />
            <a
              href={`/products?category=${encodeURIComponent(product.category)}`}
              style={{ color: "var(--nav-fg-muted)", textDecoration: "none" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--brand-teal)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-fg-muted)")
              }
            >
              {product.category}
            </a>
            <ChevronRight size={12} />
            <span
              style={{ color: "var(--nav-fg)" }}
              className="truncate max-w-[180px]"
            >
              {product.name}
            </span>
          </nav>

          <div className="grid md:grid-cols-2 gap-8 md:gap-14 items-start">
            {/* ══ LEFT — Gallery ══ */}
            <div className="fade-up">
              {/* Main image */}
              <div
                className="relative w-full  overflow-hidden rounded-2xl"
                style={{ aspectRatio: "1/1", background: "#f0eeea" }}
              >
                <Image
                  key={`${activeVariantIdx}-${activeImageIdx}`}
                  src={images[activeImageIdx]}
                  alt={`${product.name} – ${variant.colorName}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center"
                  style={{ transition: "opacity 0.25s ease" }}
                />

                {/* Discount badge */}
                {discountPercent && (
                  <div
                    className="absolute top-4 left-4 px-3 py-1.5 text-xs font-bold tracking-wider rounded-full"
                    style={{ background: "#1a1a1a", color: "#fff" }}
                  >
                    {discountPercent}% OFF
                  </div>
                )}

                {/* Sold out overlay */}
                {isOutOfStock && (
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-2xl"
                    style={{ background: "rgba(245,240,232,0.75)" }}
                  >
                    <div
                      className="px-5 py-2.5 text-xs font-bold tracking-widest uppercase rounded-full"
                      style={{ background: "var(--nav-fg)", color: "#fff" }}
                    >
                      Sold Out
                    </div>
                  </div>
                )}

                {/* Prev/Next arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150"
                      style={{
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid var(--nav-border)",
                        color: "var(--nav-fg)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "var(--brand-teal)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "#fff";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(255,255,255,0.9)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "var(--nav-fg)";
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150"
                      style={{
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid var(--nav-border)",
                        color: "var(--nav-fg)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "var(--brand-teal)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "#fff";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "rgba(255,255,255,0.9)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "var(--nav-fg)";
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div
                    className="absolute bottom-3 right-3 px-2 py-1 text-[10px] font-bold rounded-full"
                    style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}
                  >
                    {activeImageIdx + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails — horizontal row, max THUMB_VISIBLE visible */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 mt-3">
                  {/* Scroll left */}
                  {thumbsCanScrollLeft && (
                    <button
                      onClick={() => setThumbStart((s) => Math.max(0, s - 1))}
                      className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-150"
                      style={{
                        border: "1px solid var(--nav-border)",
                        background: "#fff",
                        color: "var(--nav-fg-muted)",
                        cursor: "pointer",
                      }}
                    >
                      <ChevronLeft size={14} />
                    </button>
                  )}

                  <div className="flex gap-2 flex-1 overflow-hidden">
                    {images
                      .slice(thumbStart, thumbStart + THUMB_VISIBLE)
                      .map((src, i) => {
                        const realIdx = thumbStart + i;
                        return (
                          <button
                            key={realIdx}
                            onClick={() => goToImage(realIdx)}
                            className={`pdp-thumb relative shrink-0 flex-1`}
                            style={{
                              aspectRatio: "1/1",
                              border:
                                activeImageIdx === realIdx
                                  ? "2px solid var(--brand-teal)"
                                  : "2px solid var(--nav-border)",
                              cursor: "pointer",
                              background: "#f0eeea",
                              minWidth: 0,
                            }}
                          >
                            <Image
                              src={src}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover object-center rounded-xl"
                            />
                          </button>
                        );
                      })}

                    {/* +N overflow pill */}
                    {images.length > thumbStart + THUMB_VISIBLE &&
                      !thumbsCanScrollRight && (
                        <div
                          className="flex items-center justify-center shrink-0 rounded-xl text-xs font-bold"
                          style={{
                            aspectRatio: "1/1",
                            flex: 1,
                            background: "rgba(25,99,94,0.08)",
                            border: "2px solid var(--nav-border)",
                            color: "var(--brand-teal)",
                            minWidth: 0,
                          }}
                        >
                          +{images.length - (thumbStart + THUMB_VISIBLE)}
                        </div>
                      )}
                  </div>

                  {/* Scroll right */}
                  {thumbsCanScrollRight && (
                    <button
                      onClick={() =>
                        setThumbStart((s) =>
                          Math.min(images.length - THUMB_VISIBLE, s + 1),
                        )
                      }
                      className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-150"
                      style={{
                        border: "1px solid var(--nav-border)",
                        background: "#fff",
                        color: "var(--nav-fg-muted)",
                        cursor: "pointer",
                      }}
                    >
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ══ RIGHT — Info ══ */}
            <div className="flex flex-col gap-5 fade-up fade-up-1">
              {/* Category + stock status */}
              <div className="flex items-center justify-between">
                <p
                  className="text-xs font-bold tracking-[0.18em] uppercase"
                  style={{ color: "var(--brand-teal)" }}
                >
                  {product.category}
                </p>
                {!isOutOfStock && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: "#27ae60", display: "inline-block" }}
                    />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "#27ae60" }}
                    >
                      In Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Product name */}
              <h1
                className="text-2xl md:text-3xl font-bold leading-tight"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
              >
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="flex items-center gap-3">
                <Stars rating={rating} />
                <span
                  className="text-sm font-bold"
                  style={{ color: "#F5A623" }}
                >
                  {rating.toFixed(1)}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  | {reviewCount} Reviews
                </span>
              </div>

              <div style={{ height: 1, background: "var(--nav-border)" }} />

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {originalPrice && originalPrice > product.price && (
                  <span
                    className="text-base line-through"
                    style={{ color: "#bdbdbd" }}
                  >
                    ₹{originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p
                className="text-xs -mt-3"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Inclusive of all taxes
              </p>

              {/* Color picker */}
              <div>
                <p
                  className="text-xs font-bold tracking-[0.14em] uppercase mb-3"
                  style={{ color: "var(--nav-fg)" }}
                >
                  COLOR :{" "}
                  <span style={{ color: "var(--brand-teal)" }}>
                    {variant.colorName.toUpperCase()}
                  </span>
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {product.variants.map((v, idx) => (
                    <button
                      key={`${v.colorName}-${idx}`}
                      className={`swatch ${activeVariantIdx === idx ? "active" : ""}`}
                      title={v.colorName}
                      onClick={() => switchVariant(idx)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: v.colorHex,
                        border: "2px solid rgba(0,0,0,0.1)",
                        cursor: "pointer",
                        padding: 0,
                        flexShrink: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Size picker */}
              <div className={sizeError ? "shake" : ""}>
                <div className="flex items-center justify-between mb-3">
                  <p
                    className="text-xs font-bold tracking-[0.14em] uppercase"
                    style={{
                      color: sizeError ? "var(--nav-sale)" : "var(--nav-fg)",
                    }}
                  >
                    SIZE
                    {sizeError && (
                      <span className="normal-case tracking-normal ml-2 font-normal">
                        (Please select a size)
                      </span>
                    )}
                    {selectedSize && !sizeError && (
                      <span style={{ color: "var(--brand-teal)" }}>
                        {" "}
                        : {selectedSize.toUpperCase()}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="flex items-center gap-1 text-xs font-semibold transition-colors"
                    style={{
                      color: "var(--nav-fg-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--brand-teal)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--nav-fg-muted)")
                    }
                  >
                    <Ruler size={13} /> Size Guide
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {variant.sizes?.map((s) => {
                    const oos = s.stock === 0;
                    return (
                      <button
                        key={s.size}
                        disabled={oos}
                        onClick={() => {
                          setSelectedSize(s.size);
                          setSizeError(false);
                          setQty(1);
                        }}
                        className={`pdp-size-btn ${selectedSize === s.size ? "active" : ""}`}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>

                {/* Stock hint for selected size */}
                {selectedSize && (
                  <div className="mt-3 flex items-center gap-2">
                    {currentStock === 0 ? (
                      <>
                        <AlertTriangle
                          size={13}
                          style={{ color: "var(--nav-sale)" }}
                        />
                        <span
                          className="text-xs font-bold"
                          style={{ color: "var(--nav-sale)" }}
                        >
                          Out of Stock
                        </span>
                      </>
                    ) : currentStock <= 10 ? (
                      <>
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            background: "#e67e22",
                            display: "inline-block",
                          }}
                        />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#e67e22" }}
                        >
                          Only {currentStock} left in stock
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{
                            background: "#27ae60",
                            display: "inline-block",
                          }}
                        />
                        <span
                          className="text-xs font-semibold"
                          style={{ color: "#27ae60" }}
                        >
                          In Stock
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Quantity */}
              {!isOutOfStock && (
                <div>
                  <p
                    className="text-xs font-bold tracking-[0.14em] uppercase mb-3"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    QUANTITY
                  </p>
                  <div className="flex items-center gap-4">
                    <div
                      className="flex items-center rounded-xl overflow-hidden"
                      style={{ border: "1px solid var(--nav-border)" }}
                    >
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1 || !selectedSize}
                        className="flex items-center justify-center w-11 h-11 transition-colors duration-150"
                        style={{
                          background: "none",
                          border: "none",
                          cursor:
                            qty <= 1 || !selectedSize
                              ? "not-allowed"
                              : "pointer",
                          color: "var(--nav-fg)",
                          opacity: qty <= 1 || !selectedSize ? 0.35 : 1,
                        }}
                      >
                        <Minus size={16} />
                      </button>
                      <span
                        className="flex items-center justify-center w-12 h-11 font-bold text-base"
                        style={{
                          borderLeft: "1px solid var(--nav-border)",
                          borderRight: "1px solid var(--nav-border)",
                          fontFamily: "var(--nav-font)",
                          color: "var(--nav-fg)",
                        }}
                      >
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        disabled={!selectedSize || qty >= maxQty}
                        className="flex items-center justify-center w-11 h-11 transition-colors duration-150"
                        style={{
                          background: "none",
                          border: "none",
                          cursor:
                            !selectedSize || qty >= maxQty
                              ? "not-allowed"
                              : "pointer",
                          color: "var(--nav-fg)",
                          opacity: !selectedSize || qty >= maxQty ? 0.35 : 1,
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      Maximum 10 items per order
                    </p>
                  </div>

                  {inCart && cartQty > 0 && selectedSize && (
                    <p
                      className="text-[11px] mt-2"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      {cartQty} already in your cart
                      {maxQty === 0 ? " · max stock reached" : ""}
                    </p>
                  )}
                </div>
              )}

              {/* CTA Buttons */}
              {!isOutOfStock ? (
                <div className="flex flex-col gap-3 pt-1">
                  {/* ADD TO CART — teal */}
                  <button
                    onClick={handleAddToCart}
                    disabled={selectedSize !== null && maxQty <= 0}
                    className="w-full flex items-center justify-center gap-2.5 font-bold tracking-[0.14em] uppercase rounded-xl transition-all duration-200"
                    style={{
                      height: 52,
                      fontSize: "13px",
                      background: addedAnim ? "#27ae60" : "var(--brand-teal)",
                      color: "#fff",
                      border: "none",
                      cursor:
                        selectedSize !== null && maxQty <= 0
                          ? "not-allowed"
                          : "pointer",
                      boxShadow: "0 4px 16px rgba(25,99,94,0.25)",
                    }}
                  >
                    {addedAnim ? (
                      <>
                        <Check size={16} strokeWidth={2.5} /> Added to Cart!
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} /> ADD TO CART
                      </>
                    )}
                  </button>

                  {/* BUY NOW — dark */}
                  <button
                    onClick={handleBuyNow}
                    className="w-full flex items-center justify-center font-bold tracking-[0.14em] uppercase rounded-xl transition-all duration-200"
                    style={{
                      height: 52,
                      fontSize: "13px",
                      background: "var(--nav-fg)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.opacity =
                        "0.85")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.opacity =
                        "1")
                    }
                  >
                    BUY NOW
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl"
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
                      className="text-xs font-bold"
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
            </div>
          </div>

          {/* ══ Description Section ══ */}
          <div className="mt-12 md:mt-16">
            <div style={{ borderBottom: "2px solid var(--nav-border)" }}>
              <div className="flex gap-8">
                <button
                  className="pb-3 text-sm font-bold tracking-widest uppercase transition-colors"
                  style={{
                    borderBottom: "2px solid var(--brand-teal)",
                    marginBottom: "-2px",
                    color: "var(--brand-teal)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    paddingBottom: "12px",
                  }}
                >
                  Description
                </button>
              </div>
            </div>

            <div className="py-8 max-w-3xl">
              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                {product.description}
              </p>

              {/* Key Features — always shown */}
              <div>
                <h3
                  className="text-base font-bold mb-5"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  Key Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3">
                  {[
                    "100% Organic Bamboo Fiber",
                    "Naturally Antibacterial & Hypoallergenic",
                    "Ultra-Soft & Breathable",
                    "Moisture-Wicking Technology",
                    "Temperature Regulating",
                    "Eco-Friendly & Sustainable",
                    "Tag-Free Design for Comfort",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-3">
                      <div
                        className="flex items-center justify-center w-5 h-5 rounded-full shrink-0 mt-0.5"
                        style={{ background: "rgba(25,99,94,0.1)" }}
                      >
                        <Check
                          size={11}
                          strokeWidth={2.5}
                          style={{ color: "var(--brand-teal)" }}
                        />
                      </div>
                      <span
                        className="text-sm"
                        style={{ color: "var(--nav-fg)" }}
                      >
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <ProductReviews
            productId={productId}
            productSlug={product.slug}
            productName={product.name}
          />
        </div>
      </main>
    </>
  );
}
