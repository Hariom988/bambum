"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

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

const INITIAL_SHOW = 4;
const SHOW_MORE_STEP = 2;

// ─── Stars ────────────────────────────────────────────────────────────────────

function StarIcon({ filled, size = 16 }: { filled: boolean; size?: number }) {
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

function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
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
        <span className="text-sm font-semibold" style={{ color: "#19635e" }}>
          {labels[hover || value]}
        </span>
      )}
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: ReviewStats }) {
  return (
    <div
      className="flex flex-col sm:flex-row items-start gap-8 w-full mb-8 md:mb-10 p-6 md:p-8 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Score */}
      <div className="flex flex-col items-start shrink-0 min-w-[120px]">
        <span
          className="text-6xl md:text-7xl font-bold text-white leading-none"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {stats.average.toFixed(1)}
        </span>
        <div className="mt-2">
          <RatingStars rating={stats.average} size={22} />
        </div>
        <span className="text-white/40 text-sm mt-2">
          {stats.total} {stats.total === 1 ? "Review" : "Reviews"}
        </span>
      </div>

      {/* Bars */}
      <div className="flex flex-col gap-2.5 w-full">
        {[5, 4, 3, 2, 1].map((star) => {
          const count =
            stats.distribution[star as keyof typeof stats.distribution];
          const pct =
            stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
          return (
            <div key={star} className="flex items-center gap-3">
              <span className="text-white/50 text-xs w-3 shrink-0 text-right">
                {star}
              </span>
              <StarIcon filled size={13} />
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: "#19635e" }}
                />
              </div>
              <span className="text-white/35 text-xs w-8 text-right shrink-0">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
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
  const images = Array.isArray(review.images)
    ? review.images.filter(Boolean)
    : [];

  return (
    <div
      className="w-full flex flex-col gap-4 p-5 md:p-6 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: "#19635e" }}
          >
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm leading-tight">
              {review.userName}
            </span>
            <span className="text-white/35 text-xs mt-0.5">
              {new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <span
            className="text-[10px] font-medium px-2.5 py-1 rounded-full"
            style={{ border: "1px solid #19635e", color: "#4db6ac" }}
          >
            Verified Purchase
          </span>
          {isOwner && (
            <button
              onClick={() => onDelete(review._id)}
              className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-md transition-colors hover:bg-red-500/20"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,100,100,0.35)",
                color: "rgba(255,100,100,0.85)",
                cursor: "pointer",
              }}
            >
              DELETE
            </button>
          )}
        </div>
      </div>

      {/* Stars */}
      <RatingStars rating={review.rating} size={16} />

      {/* Title */}
      {review.title && (
        <p className="text-white font-bold text-sm leading-snug m-0">
          {review.title}
        </p>
      )}

      {/* Body */}
      <p className="text-white/60 text-sm leading-relaxed m-0">{review.body}</p>

      {/* Images — only shown if present (new reviews with fixed API) */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, idx) => (
            <button
              key={idx}
              onClick={() => onImageClick(url)}
              className="shrink-0 overflow-hidden rounded-xl transition-opacity hover:opacity-75"
              style={{
                width: 80,
                height: 80,
                padding: 0,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)",
                cursor: "pointer",
              }}
            >
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

      {/* Helpful */}
      {review.helpful > 0 && (
        <p className="text-white/25 text-xs m-0">Helpful ({review.helpful})</p>
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
    "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none font-sans";
  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
  };
  const labelCls =
    "block text-[11px] font-bold tracking-widest uppercase mb-2 text-white/40";

  return (
    <div
      className="rounded-2xl p-5 md:p-8 mb-8"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
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
            style={{ background: "#19635e" }}
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
          <div>
            <label className={labelCls}>Your Rating *</label>
            <InteractiveStars value={rating} onChange={setRating} />
          </div>
          <div>
            <label className={labelCls}>Review Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 80))}
              placeholder="Summarise your experience..."
              className={inputCls}
              style={inputStyle}
            />
            <p className="text-right text-xs mt-1 text-white/20">
              {title.length}/80
            </p>
          </div>
          <div>
            <label className={labelCls}>Your Review *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 1000))}
              placeholder="Share your experience with this product..."
              rows={4}
              className={`${inputCls} resize-none`}
              style={inputStyle}
            />
            <p className="text-right text-xs mt-1 text-white/20">
              {body.length}/1000
            </p>
          </div>
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
                  className="flex flex-col items-center justify-center shrink-0 rounded-xl cursor-pointer"
                  style={{
                    width: 80,
                    height: 80,
                    border: "2px dashed rgba(255,255,255,0.15)",
                  }}
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
          <div className="flex gap-3 pt-1 flex-wrap">
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-8 py-3 text-white text-sm font-bold tracking-wider uppercase rounded-xl disabled:opacity-50 transition-opacity"
              style={{
                background: "#19635e",
                border: "none",
                cursor: "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 text-sm text-white/50 rounded-xl bg-transparent transition-colors hover:text-white/80"
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer",
              }}
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75">
      <div
        className="w-full max-w-sm rounded-2xl p-7"
        style={{
          background: "#111",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p className="text-white font-bold text-base m-0 mb-2">
          Delete your review?
        </p>
        <p className="text-white/50 text-sm m-0 mb-6">
          This action cannot be undone.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm text-white/60 bg-transparent"
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              cursor: "pointer",
            }}
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

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
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
  const [visibleCount, setVisibleCount] = useState(INITIAL_SHOW);
  const [writeOpen, setWriteOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews?productId=${productId}&page=1&limit=50`,
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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
      setVisibleCount(INITIAL_SHOW);
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

  const visibleReviews = reviews.slice(0, visibleCount);
  const hasMore = visibleCount < reviews.length;

  return (
    <section
      className="w-full py-12 md:py-16"
      style={{ background: "#0a0a0a" }}
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

      {/* Full width container with comfortable padding */}
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8 md:mb-10 flex-wrap">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white m-0"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Customer Reviews
          </h2>
          <button
            onClick={() => {
              if (!user) {
                router.push(`/auth?redirectTo=/products/${productSlug}`);
                return;
              }
              setWriteOpen((o) => !o);
            }}
            className="shrink-0 px-5 py-2.5 md:px-7 md:py-3 text-white font-bold text-xs md:text-sm tracking-widest uppercase rounded-xl border-2 border-white bg-transparent transition-all hover:bg-white hover:text-black"
            style={{ cursor: "pointer" }}
          >
            Write a Review
          </button>
        </div>

        {/* Stats */}
        {!loading && stats && stats.total > 0 && <StatsBar stats={stats} />}

        {/* Write Review Panel */}
        {writeOpen && (
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

        {/* Reviews */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 md:p-6 rounded-2xl animate-pulse"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  height: 160,
                }}
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p className="text-white/40 m-0">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
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

            {/* Show More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisibleCount((c) => c + SHOW_MORE_STEP)}
                  className="px-10 py-3.5 text-sm font-bold tracking-widest uppercase rounded-xl transition-colors"
                  style={{
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "rgba(255,255,255,0.6)",
                    background: "rgba(255,255,255,0.04)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                  }}
                >
                  Show More ({reviews.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
