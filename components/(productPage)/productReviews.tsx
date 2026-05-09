"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  _id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  images: string[];
  helpful: number;
  createdAt: string;
  status: "visible" | "hidden";
}

interface ReviewStats {
  average: number;
  total: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

interface Props {
  productId: string;
  productSlug: string;
  productName: string;
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function StarIcon({ filled, size = 18 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? "#19635e" : "none"}
        stroke="#19635e"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RatingStars({ rating, size = 18 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= Math.round(rating)} size={size} />
      ))}
    </div>
  );
}

function InteractiveStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="p-0.5 transition-transform hover:scale-110"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <StarIcon filled={i <= (hover || value)} size={28} />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--brand-teal)" }}
        >
          {labels[hover || value]}
        </span>
      )}
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  currentUserId,
  onImageClick,
  onDelete,
}: {
  review: Review;
  currentUserId?: string;
  onImageClick: (url: string) => void;
  onDelete: (id: string) => void;
}) {
  const initials = review.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isOwner = !!(currentUserId && currentUserId === review.userId);

  // images: filter out empty strings just in case
  const images = Array.isArray(review.images)
    ? review.images.filter(Boolean)
    : [];

  return (
    <div className="relative flex flex-col gap-3 p-5 rounded-2xl h-full bg-white/[0.07]">
      {/* Delete button — owner only */}
      {isOwner && (
        <button
          onClick={() => onDelete(review._id)}
          className="absolute top-3 right-3 text-[11px] font-bold tracking-wider px-2 py-1 rounded-md transition-colors hover:bg-red-500/20"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,100,100,0.3)",
            color: "rgba(255,100,100,0.85)",
            cursor: "pointer",
          }}
        >
          DELETE
        </button>
      )}

      {/* Avatar + name + badge */}
      <div
        className="flex items-center gap-2.5 flex-wrap"
        style={{ paddingRight: isOwner ? "64px" : "0" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ background: "var(--brand-teal)" }}
        >
          {initials}
        </div>
        <span className="text-white font-semibold text-sm">
          {review.userName}
        </span>
        <span
          className="ml-auto text-[11px] font-medium px-2.5 py-0.5 rounded-full shrink-0 whitespace-nowrap"
          style={{
            border: "1px solid var(--brand-teal)",
            color: "var(--brand-teal-light)",
          }}
        >
          Verified Purchase
        </span>
      </div>

      {/* Stars + date */}
      <div className="flex items-center gap-3 flex-wrap">
        <RatingStars rating={review.rating} size={16} />
        <span className="text-xs text-white/45">
          {new Date(review.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Title */}
      {review.title && (
        <p className="text-white font-bold text-sm leading-snug m-0">
          {review.title}
        </p>
      )}

      {/* Body */}
      <p className="text-white/70 text-sm leading-relaxed flex-1 m-0">
        {review.body}
      </p>

      {/* ── Review images ── */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-1">
          {images.map((url, idx) => (
            <button
              key={idx}
              onClick={() => onImageClick(url)}
              className="shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-75"
              style={{
                width: 64,
                height: 64,
                padding: 0,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)",
                cursor: "pointer",
              }}
            >
              {/* Using plain <img> — make sure res.cloudinary.com is in next.config images.domains */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Review photo ${idx + 1}`}
                className="w-full h-full object-cover block"
                onError={(e) => {
                  const el = e.currentTarget.parentElement;
                  if (el) el.style.display = "none";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Write Review Panel ───────────────────────────────────────────────────────

function WriteReviewPanel({
  rating,
  setRating,
  title,
  setTitle,
  body,
  setBody,
  imagePreviews,
  onImageAdd,
  onImageRemove,
  submitting,
  submitError,
  submitSuccess,
  onSubmit,
  onCancel,
}: {
  rating: number;
  setRating: (v: number) => void;
  title: string;
  setTitle: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  imagePreviews: string[];
  onImageAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (i: number) => void;
  submitting: boolean;
  submitError: string;
  submitSuccess: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const inputCls =
    "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none bg-white/[0.07] border border-white/[0.12] font-sans";

  const labelCls =
    "block text-[11px] font-bold tracking-widest uppercase mb-2 text-white/45";

  return (
    <div className="rounded-2xl p-6 md:p-8 mt-6 bg-white/[0.05] border border-white/[0.1]">
      <h3
        className="text-white text-xl font-bold mt-0 mb-6"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Write a Review
      </h3>

      {submitSuccess ? (
        <div className="text-center py-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: "var(--brand-teal)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              className="w-7 h-7"
            >
              <path
                d="M20 6L9 17l-5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-white font-semibold m-0">Review submitted!</p>
          <p className="text-white/50 text-sm mt-1 m-0">
            Thank you for your feedback.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Rating */}
          <div>
            <label className={labelCls}>Your Rating *</label>
            <InteractiveStars value={rating} onChange={setRating} />
          </div>

          {/* Title */}
          <div>
            <label className={labelCls}>Review Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 80))}
              placeholder="Summarise your experience..."
              className={inputCls}
            />
            <p className="text-right text-xs mt-1 text-white/20">
              {title.length}/80
            </p>
          </div>

          {/* Body */}
          <div>
            <label className={labelCls}>Your Review *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 1000))}
              placeholder="Share your experience with this product..."
              rows={4}
              className={`${inputCls} resize-none`}
            />
            <p className="text-right text-xs mt-1 text-white/20">
              {body.length}/1000
            </p>
          </div>

          {/* Images */}
          <div>
            <label className={labelCls}>Add Photos (up to 4)</label>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative rounded-xl overflow-hidden shrink-0"
                  style={{ width: 80, height: 80 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => onImageRemove(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-sm bg-black/70"
                    style={{ border: "none", cursor: "pointer" }}
                  >
                    ×
                  </button>
                </div>
              ))}
              {imagePreviews.length < 4 && (
                <label
                  className="flex flex-col items-center justify-center shrink-0 rounded-xl cursor-pointer border-2 border-dashed border-white/20"
                  style={{ width: 80, height: 80 }}
                >
                  <span className="text-white/30 text-2xl leading-none">+</span>
                  <span className="text-white/25 text-[11px] mt-0.5">
                    Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onImageAdd}
                  />
                </label>
              )}
            </div>
            <p className="text-xs mt-2 text-white/25">Max 5MB per image</p>
          </div>

          {submitError && (
            <p className="text-red-400 text-sm m-0">{submitError}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-8 py-3 text-white text-sm font-bold tracking-wider uppercase rounded-xl disabled:opacity-50 transition-opacity"
              style={{
                background: "var(--brand-teal)",
                border: "none",
                cursor: "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 text-sm text-white/50 rounded-xl border border-white/10 bg-transparent"
              style={{ cursor: "pointer" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-sm rounded-2xl p-7 bg-[#1a1a1a] border border-white/10">
        <p className="text-white font-bold text-base m-0 mb-2">
          Delete your review?
        </p>
        <p className="text-white/50 text-sm m-0 mb-6">
          This action cannot be undone.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm text-white/60 bg-transparent border border-white/15"
            style={{ cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 border-none"
            style={{ cursor: "pointer" }}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-6 text-white text-4xl leading-none bg-transparent border-none"
        style={{ cursor: "pointer" }}
      >
        ×
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Review"
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductReviews({
  productId,
  productSlug,
  productName,
}: Props) {
  const { user } = useAuth();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Carousel
  const [slideIdx, setSlideIdx] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const autoRef = useRef<NodeJS.Timeout | null>(null);

  // Write review
  const [writeOpen, setWriteOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Delete + lightbox
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews?productId=${productId}&page=${page}&limit=9`,
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
      setTotalPages(data.totalPages || 1);
      setSlideIdx(0);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Responsive cardsPerView ────────────────────────────────────────────────

  useEffect(() => {
    const update = () => setCardsPerView(window.innerWidth < 768 ? 1 : 3);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // ── Carousel ───────────────────────────────────────────────────────────────

  const totalSlides =
    reviews.length === 0 ? 0 : Math.ceil(reviews.length / cardsPerView);

  const stopAuto = useCallback(() => {
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    if (reviews.length <= cardsPerView) return;
    autoRef.current = setInterval(() => {
      setSlideIdx((prev) => (prev + 1 >= totalSlides ? 0 : prev + 1));
    }, 3000);
  }, [reviews.length, cardsPerView, totalSlides, stopAuto]);

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [startAuto, stopAuto]);

  const goTo = (idx: number) => {
    stopAuto();
    setSlideIdx(idx);
    startAuto();
  };
  const goPrev = () =>
    goTo(slideIdx <= 0 ? Math.max(0, totalSlides - 1) : slideIdx - 1);
  const goNext = () => goTo(slideIdx >= totalSlides - 1 ? 0 : slideIdx + 1);

  const visibleReviews = reviews.slice(
    slideIdx * cardsPerView,
    slideIdx * cardsPerView + cardsPerView,
  );

  // ── Image handlers ─────────────────────────────────────────────────────────

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => f.size <= 5 * 1024 * 1024,
    );
    const combined = [...imageFiles, ...files].slice(0, 4);
    setImageFiles(combined);
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const handleImageRemove = (idx: number) => {
    const updated = imageFiles.filter((_, i) => i !== idx);
    setImageFiles(updated);
    setImagePreviews(updated.map((f) => URL.createObjectURL(f)));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!user) {
      router.push(`/auth?redirectTo=/products/${productSlug}`);
      return;
    }
    if (rating === 0) return setSubmitError("Please select a rating.");
    if (body.trim().length < 10)
      return setSubmitError("Review must be at least 10 characters.");

    setSubmitting(true);
    setSubmitError("");
    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("productSlug", productSlug);
      formData.append("productName", productName);
      formData.append("rating", String(rating));
      formData.append("title", title);
      formData.append("body", body);
      imageFiles.forEach((img) => formData.append("images", img));

      const res = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });
      if (res.status === 401) {
        router.push(`/auth?redirectTo=/products/${productSlug}`);
        return;
      }
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to submit.");
      }

      setSubmitSuccess(true);
      setRating(0);
      setTitle("");
      setBody("");
      setImageFiles([]);
      setImagePreviews([]);
      fetchReviews();
      setTimeout(() => {
        setSubmitSuccess(false);
        setWriteOpen(false);
      }, 2500);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      if (res.status === 401) {
        router.push(`/auth?redirectTo=/products/${productSlug}`);
        return;
      }
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      fetchReviews();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteId(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section
      className="w-full py-16 px-4 md:px-8"
      style={{ background: "var(--nav-bg-color)" }}
    >
      {lightbox && (
        <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
      )}
      {deleteId && (
        <ConfirmModal
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <div className="w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-3"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Customer Reviews
          </h2>
          {!loading && stats && stats.total > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <RatingStars rating={stats.average} size={22} />
              <span className="text-2xl font-semibold text-white">
                {stats.average.toFixed(1)}
              </span>
              <span className="text-white/35">|</span>
              <span className="text-white/50">
                {stats.total} {stats.total === 1 ? "Review" : "Reviews"}
              </span>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-52 rounded-2xl animate-pulse bg-white/[0.06]"
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl p-12 text-center mb-8 bg-white/[0.04]">
            <p className="text-white/40 m-0">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        ) : (
          /* ── Carousel ── */
          <div className="relative mb-8">
            {/* Prev */}
            <button
              onClick={goPrev}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl border border-white/25 bg-black/60 hover:bg-black/80 transition-colors"
              style={{ cursor: "pointer" }}
            >
              ‹
            </button>

            {/* Cards */}
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns:
                  visibleReviews.length >= cardsPerView
                    ? `repeat(${cardsPerView}, 1fr)`
                    : `repeat(${visibleReviews.length}, minmax(0, 380px))`,
                justifyContent:
                  visibleReviews.length < cardsPerView ? "center" : "stretch",
              }}
            >
              {visibleReviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUserId={user?.id}
                  onImageClick={setLightbox}
                  onDelete={setDeleteId}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={goNext}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center text-white text-2xl border border-white/25 bg-black/60 hover:bg-black/80 transition-colors"
              style={{ cursor: "pointer" }}
            >
              ›
            </button>

            {/* Dots */}
            {totalSlides > 1 && (
              <div className="flex justify-center gap-2 mt-5">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="h-2 rounded-full border-none p-0 transition-all duration-300"
                    style={{
                      width: i === slideIdx ? 24 : 8,
                      background:
                        i === slideIdx
                          ? "var(--brand-teal)"
                          : "rgba(255,255,255,0.25)",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DB pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="w-9 h-9 rounded-full text-sm font-medium border-none transition-colors"
                style={{
                  background:
                    page === i + 1
                      ? "var(--brand-teal)"
                      : "rgba(255,255,255,0.08)",
                  color: page === i + 1 ? "white" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Write a Review */}
        {!writeOpen ? (
          <button
            onClick={() => {
              if (!user) {
                router.push(`/auth?redirectTo=/products/${productSlug}`);
                return;
              }
              setWriteOpen(true);
            }}
            className="px-10 py-4 text-white font-bold text-sm tracking-widest uppercase rounded-xl border-2 border-white bg-transparent transition-all hover:bg-white hover:text-black"
            style={{ cursor: "pointer" }}
          >
            Write a Review
          </button>
        ) : (
          <WriteReviewPanel
            rating={rating}
            setRating={setRating}
            title={title}
            setTitle={setTitle}
            body={body}
            setBody={setBody}
            imagePreviews={imagePreviews}
            onImageAdd={handleImageAdd}
            onImageRemove={handleImageRemove}
            submitting={submitting}
            submitError={submitError}
            submitSuccess={submitSuccess}
            onSubmit={handleSubmit}
            onCancel={() => setWriteOpen(false)}
          />
        )}
      </div>
    </section>
  );
}
