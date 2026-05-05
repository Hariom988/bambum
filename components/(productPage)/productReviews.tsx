"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

interface ReviewImage {
  url: string;
}

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

const StarIcon = ({
  filled,
  half,
  size = 18,
  color = "#19635e",
}: {
  filled: boolean;
  half?: boolean;
  size?: number;
  color?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {half ? (
      <>
        <defs>
          <linearGradient id="half">
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="url(#half)"
          stroke={color}
          strokeWidth="1.5"
        />
      </>
    ) : (
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="1.5"
      />
    )}
  </svg>
);

const RatingStars = ({
  rating,
  size = 18,
}: {
  rating: number;
  size?: number;
}) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <StarIcon
        key={i}
        filled={i <= Math.floor(rating)}
        half={i === Math.ceil(rating) && rating % 1 >= 0.5}
        size={size}
      />
    ))}
  </div>
);

const InteractiveStars = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const [hover, setHover] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <StarIcon filled={i <= (hover || value)} size={28} />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <span className="text-sm font-medium" style={{ color: "#19635e" }}>
          {labels[hover || value]}
        </span>
      )}
    </div>
  );
};

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
  const [carouselIndex, setCarouselIndex] = useState(0);
  const autoRef = useRef<NodeJS.Timeout | null>(null);

  // Write Review
  const [writeOpen, setWriteOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Lightbox
  const [lightbox, setLightbox] = useState<string | null>(null);

  const CARDS_PER_VIEW =
    typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 3;

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reviews?productId=${productId}&page=${page}&limit=9`,
      );
      const data = await res.json();
      setReviews(data.reviews || []);
      setStats(data.stats || null);
      setTotalPages(data.totalPages || 1);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [productId, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Auto-rotate carousel
  useEffect(() => {
    if (reviews.length <= CARDS_PER_VIEW) return;
    autoRef.current = setInterval(() => {
      setCarouselIndex((prev) =>
        prev + CARDS_PER_VIEW >= reviews.length ? 0 : prev + CARDS_PER_VIEW,
      );
    }, 3000);
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [reviews.length, CARDS_PER_VIEW]);

  const handleCarousel = (dir: "prev" | "next") => {
    if (autoRef.current) clearInterval(autoRef.current);
    setCarouselIndex((prev) => {
      if (dir === "next")
        return prev + CARDS_PER_VIEW >= reviews.length
          ? 0
          : prev + CARDS_PER_VIEW;
      return prev - CARDS_PER_VIEW < 0
        ? Math.max(0, reviews.length - CARDS_PER_VIEW)
        : prev - CARDS_PER_VIEW;
    });
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    const combined = [...images, ...valid].slice(0, 4);
    setImages(combined);
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (idx: number) => {
    const updated = images.filter((_, i) => i !== idx);
    setImages(updated);
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
      images.forEach((img) => formData.append("images", img));

      const res = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to submit review.");
      }
      setSubmitSuccess(true);
      setRating(0);
      setTitle("");
      setBody("");
      setImages([]);
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

  const visibleReviews = reviews.slice(
    carouselIndex,
    carouselIndex + CARDS_PER_VIEW,
  );

  const totalDots = Math.ceil(reviews.length / CARDS_PER_VIEW);

  return (
    <section
      className="w-full py-16 px-4 md:px-8"
      style={{ background: "var(--nav-bg-color)" }}
    >
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl font-light"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <img
            src={lightbox}
            alt="Review"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2
            className="text-4xl font-bold mb-2"
            style={{ color: "#ffffff", fontFamily: "Georgia, serif" }}
          >
            Customer Reviews
          </h2>
          {stats && (
            <div className="flex items-center gap-3">
              <RatingStars rating={stats.average} size={22} />
              <span className="text-2xl font-semibold text-white">
                {stats.average.toFixed(1)}
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">{stats.total} Reviews</span>
            </div>
          )}
        </div>

        {/* Reviews Carousel */}
        {loading ? (
          <div className="flex gap-4 mb-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 rounded-2xl h-56 animate-pulse"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center mb-8"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <p className="text-gray-400">
              No reviews yet. Be the first to review!
            </p>
          </div>
        ) : (
          <div className="relative mb-8">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {visibleReviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  onImageClick={setLightbox}
                />
              ))}
            </div>

            {/* Nav buttons */}
            {reviews.length > CARDS_PER_VIEW && (
              <>
                <button
                  onClick={() => handleCarousel("prev")}
                  className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  ‹
                </button>
                <button
                  onClick={() => handleCarousel("next")}
                  className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                >
                  ›
                </button>
              </>
            )}

            {/* Dots */}
            {totalDots > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalDots }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i * CARDS_PER_VIEW)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      background:
                        Math.floor(carouselIndex / CARDS_PER_VIEW) === i
                          ? "#19635e"
                          : "rgba(255,255,255,0.3)",
                      width:
                        Math.floor(carouselIndex / CARDS_PER_VIEW) === i
                          ? "24px"
                          : "8px",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className="w-9 h-9 rounded-full text-sm font-medium transition-colors"
                style={{
                  background:
                    page === i + 1 ? "#19635e" : "rgba(255,255,255,0.08)",
                  color: page === i + 1 ? "white" : "rgba(255,255,255,0.5)",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Write a Review */}
        <div>
          {!writeOpen ? (
            <button
              onClick={() =>
                user
                  ? setWriteOpen(true)
                  : router.push(`/auth?redirectTo=/products/${productSlug}`)
              }
              className="px-10 py-4 rounded-xl border-2 border-white text-white font-bold text-sm tracking-widest uppercase transition-colors hover:bg-white hover:text-black"
            >
              Write a Review
            </button>
          ) : (
            <WriteReviewPanel
              user={user}
              rating={rating}
              setRating={setRating}
              title={title}
              setTitle={setTitle}
              body={body}
              setBody={setBody}
              imagePreviews={imagePreviews}
              onImageAdd={handleImageAdd}
              onImageRemove={removeImage}
              submitting={submitting}
              submitError={submitError}
              submitSuccess={submitSuccess}
              onSubmit={handleSubmit}
              onCancel={() => setWriteOpen(false)}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  onImageClick,
}: {
  review: Review;
  onImageClick: (url: string) => void;
}) {
  const initials = review.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 transition-transform hover:scale-[1.01]"
      style={{ background: "rgba(255,255,255,0.07)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "var(--brand-teal)" }}
          >
            {initials}
          </div>
          <span className="text-white font-semibold text-sm">
            {review.userName}
          </span>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full border font-medium"
          style={{
            color: "var(--brand-teal-light)",
            borderColor: "var(--brand-teal)",
          }}
        >
          Verified Purchase
        </span>
      </div>

      {/* Stars + date */}
      <div className="flex items-center gap-3">
        <RatingStars rating={review.rating} size={16} />
        <span className="text-gray-400 text-xs">
          {new Date(review.createdAt).toLocaleDateString("en-IN", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Title */}
      {review.title && (
        <p className="text-white font-bold text-sm">{review.title}</p>
      )}

      {/* Body */}
      <p className="text-gray-300 text-sm leading-relaxed flex-1">
        {review.body}
      </p>

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {review.images.map((url, idx) => (
            <button
              key={idx}
              onClick={() => onImageClick(url)}
              className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 hover:border-white/40 transition-colors"
            >
              <img
                src={url}
                alt={`Review image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Helpful */}
      <p className="text-gray-500 text-xs">Helpful ({review.helpful})</p>
    </div>
  );
}

function WriteReviewPanel({
  user,
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
  user: unknown;
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
  return (
    <div
      className="rounded-2xl p-6 md:p-8"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <h3
        className="text-white text-xl font-bold mb-6"
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
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="M20 6L9 17l-5-5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-white font-semibold">
            Review submitted successfully!
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Thank you for your feedback.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Rating */}
          <div>
            <label className="block text-gray-400 text-xs font-semibold tracking-widest uppercase mb-2">
              Your Rating *
            </label>
            <InteractiveStars value={rating} onChange={setRating} />
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-400 text-xs font-semibold tracking-widest uppercase mb-2">
              Review Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 80))}
              placeholder="Summarise your experience..."
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-teal-600"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
            <p className="text-gray-600 text-xs mt-1 text-right">
              {title.length}/80
            </p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-gray-400 text-xs font-semibold tracking-widest uppercase mb-2">
              Your Review *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value.slice(0, 1000))}
              placeholder="Share your experience with this product..."
              rows={4}
              className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none resize-none focus:ring-1 focus:ring-teal-600"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            />
            <p className="text-gray-600 text-xs mt-1 text-right">
              {body.length}/1000
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-gray-400 text-xs font-semibold tracking-widest uppercase mb-2">
              Add Photos (up to 4)
            </label>
            <div className="flex flex-wrap gap-3">
              {imagePreviews.map((src, i) => (
                <div
                  key={i}
                  className="relative w-20 h-20 rounded-xl overflow-hidden"
                >
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => onImageRemove(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
              {imagePreviews.length < 4 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 transition-colors">
                  <span className="text-white/40 text-2xl">+</span>
                  <span className="text-white/30 text-xs">Photo</span>
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
            <p className="text-gray-600 text-xs mt-1">Max 5MB per image</p>
          </div>

          {submitError && <p className="text-red-400 text-sm">{submitError}</p>}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onSubmit}
              disabled={submitting}
              className="px-8 py-3 rounded-xl text-white text-sm font-bold tracking-wider uppercase transition-opacity disabled:opacity-50"
              style={{ background: "var(--brand-teal)" }}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl text-gray-400 text-sm font-medium border border-white/10 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
