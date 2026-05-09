// ─── Reviews Manager ─────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";

import StarRating from "./page";
interface AdminReview {
  _id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  productSlug: string;
  rating: number;
  ratings: number;
  title?: string;
  body: string;
  images: string[];
  helpful: number;
  status: "visible" | "hidden";
  createdAt: string;
}

type Toast = { type: "success" | "error"; msg: string } | null;

const ReviewsManager = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "visible" | "hidden"
  >("all");
  const [productFilter, setProductFilter] = useState("all");
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        status: statusFilter,
        search,
        ...(productFilter !== "all" ? { productId: productFilter } : {}),
      });
      const res = await fetch(`/api/admin/content/reviews?${params}`);
      if (res.ok) {
        const d = await res.json();
        setReviews(d.reviews || []);
        setTotal(d.total || 0);
        setTotalPages(d.totalPages || 1);

        // Build unique product list from results
        const seen = new Map<string, string>();
        (d.reviews || []).forEach((r: AdminReview) => {
          if (!seen.has(r.productId)) seen.set(r.productId, r.productName);
        });
        setProducts(
          Array.from(seen.entries()).map(([id, name]) => ({ id, name })),
        );
      }
    } catch {}
    setLoading(false);
  }, [page, statusFilter, search, productFilter]);

  useEffect(() => {
    const t = setTimeout(fetchReviews, 300);
    return () => clearTimeout(t);
  }, [fetchReviews]);

  const handleToggle = async (review: AdminReview) => {
    const newStatus = review.status === "visible" ? "hidden" : "visible";
    try {
      const res = await fetch("/api/admin/content/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: review._id, status: newStatus }),
      });
      if (res.ok) {
        setToast({
          type: "success",
          msg: `Review ${newStatus === "visible" ? "made visible" : "hidden"}.`,
        });
        fetchReviews();
      } else {
        setToast({ type: "error", msg: "Failed to update." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/admin/content/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setToast({ type: "success", msg: "Review deleted." });
        fetchReviews();
      } else {
        setToast({ type: "error", msg: "Failed to delete." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setConfirmDelete(null);
  };

  const statusBtns: { label: string; value: "all" | "visible" | "hidden" }[] = [
    { label: "All", value: "all" },
    { label: "Visible", value: "visible" },
    { label: "Hidden", value: "hidden" },
  ];

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: 28,
              cursor: "pointer",
            }}
          >
            <X size={24} />
          </button>
          <img
            src={lightbox}
            alt="Review"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 mb-5"
        style={{
          background: "#fff",
          border: "1px solid var(--adm-border)",
          boxShadow: "var(--adm-shadow-card)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{
              background: "var(--adm-bg-accent-lt)",
              border: "1px solid var(--adm-accent-border)",
            }}
          >
            <Star size={14} style={{ color: "var(--adm-accent)" }} />
          </div>
          <div>
            <p
              className="font-sans text-[10px] font-bold tracking-[0.16em] uppercase"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Product Reviews
            </p>
            <p
              className="font-serif text-sm font-bold"
              style={{ color: "var(--adm-fg)" }}
            >
              {total} Review{total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setPage(1);
            fetchReviews();
          }}
          className="flex items-center gap-2 px-4 py-2 font-sans text-[10px] font-bold tracking-[0.14em] uppercase"
          style={{
            border: "1px solid var(--adm-border)",
            background: "transparent",
            color: "var(--adm-fg-muted)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--adm-accent)";
            e.currentTarget.style.color = "var(--adm-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--adm-border)";
            e.currentTarget.style.color = "var(--adm-fg-muted)";
          }}
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div
        className="flex flex-col sm:flex-row gap-3 px-5 py-4 mb-5"
        style={{
          background: "#fff",
          border: "1px solid var(--adm-border)",
          boxShadow: "var(--adm-shadow-card)",
        }}
      >
        {/* Search */}
        <div
          className="flex items-center gap-2 flex-1 px-3 py-2"
          style={{
            border: "1px solid var(--adm-border)",
            background: "var(--adm-bg-input)",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ color: "var(--adm-fg-faint)", flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, product, or content..."
            className="w-full bg-transparent outline-none font-sans text-[12px]"
            style={{ color: "var(--adm-fg)" }}
          />
        </div>

        {/* Product filter */}
        {products.length > 0 && (
          <select
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value);
              setPage(1);
            }}
            className="font-sans text-[12px] px-3 py-2 outline-none cursor-pointer"
            style={{
              border: "1px solid var(--adm-border)",
              background: "var(--adm-bg-input)",
              color: "var(--adm-fg)",
            }}
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        {/* Status filter */}
        <div className="flex">
          {statusBtns.map((btn) => (
            <button
              key={btn.value}
              onClick={() => {
                setStatusFilter(btn.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 font-sans text-[10px] font-bold tracking-[0.12em] uppercase"
              style={{
                background:
                  statusFilter === btn.value
                    ? "var(--adm-accent)"
                    : "transparent",
                color:
                  statusFilter === btn.value ? "#fff" : "var(--adm-fg-muted)",
                border: "1px solid var(--adm-border)",
                borderLeft:
                  btn.value !== "all" ? "none" : "1px solid var(--adm-border)",
                cursor: "pointer",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: "var(--adm-accent)" }}
          />
        </div>
      ) : reviews.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          style={{ background: "#fff", border: "1px solid var(--adm-border)" }}
        >
          <Star
            size={28}
            style={{ color: "var(--adm-accent)", opacity: 0.4 }}
          />
          <p
            className="font-serif text-[15px] font-bold mt-3"
            style={{ color: "var(--adm-fg)" }}
          >
            No reviews found.
          </p>
          <p
            className="font-sans text-[12px] mt-1"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            Try adjusting your filters.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((review) => {
            const initials = review.userName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={review._id}
                style={{
                  background: "#fff",
                  border: "1px solid var(--adm-border)",
                  boxShadow: "var(--adm-shadow-card)",
                  opacity: review.status === "visible" ? 1 : 0.65,
                }}
              >
                <div
                  className="h-0.5"
                  style={{
                    background:
                      review.status === "visible"
                        ? "var(--adm-accent)"
                        : "var(--adm-border)",
                  }}
                />
                <div className="flex items-start gap-4 p-5">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 shrink-0 flex items-center justify-center font-serif text-sm font-bold"
                    style={{
                      background: "var(--adm-bg-active)",
                      border: "1px solid var(--adm-accent-border)",
                      color: "var(--adm-accent)",
                    }}
                  >
                    {initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + product */}
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <span
                        className="font-sans text-sm font-bold"
                        style={{ color: "var(--adm-fg)" }}
                      >
                        {review.userName}
                      </span>
                      <a
                        href={`/products/${review.productSlug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-sans text-[10px] font-bold tracking-widest uppercase"
                        style={{
                          color: "var(--adm-accent)",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.textDecoration = "underline")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.textDecoration = "none")
                        }
                      >
                        {review.productName}
                      </a>
                    </div>

                    {/* Stars + date */}
                    <div className="flex items-center gap-3 mb-1.5">
                      <StarRating />
                      <span
                        className="font-sans text-[11px]"
                        style={{ color: "var(--adm-fg-muted)" }}
                      >
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>

                    {/* Title */}
                    {review.title && (
                      <p
                        className="font-sans text-[12px] font-semibold leading-snug"
                        style={{ color: "var(--adm-fg)" }}
                      >
                        "{review.title}"
                      </p>
                    )}

                    {/* Body */}
                    <p
                      className="font-sans text-[11px] leading-relaxed mt-0.5"
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      {review.body.length > 120
                        ? review.body.slice(0, 120) + "…"
                        : review.body}
                    </p>

                    {/* Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {review.images.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setLightbox(url)}
                            style={{
                              width: 36,
                              height: 36,
                              padding: 0,
                              border: "1px solid var(--adm-border)",
                              overflow: "hidden",
                              cursor: "pointer",
                              background: "none",
                            }}
                          >
                            <img
                              src={url}
                              alt=""
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(review)}
                      className="flex items-center gap-1 px-2.5 py-1.5 font-sans text-[9px] font-bold tracking-widest uppercase"
                      style={{
                        border: `1px solid ${review.status === "visible" ? "rgba(42,122,114,0.3)" : "var(--adm-border)"}`,
                        background:
                          review.status === "visible"
                            ? "var(--adm-bg-active)"
                            : "transparent",
                        color:
                          review.status === "visible"
                            ? "var(--adm-accent)"
                            : "var(--adm-fg-muted)",
                        cursor: "pointer",
                      }}
                    >
                      {review.status === "visible" ? (
                        <Eye size={10} />
                      ) : (
                        <EyeOff size={10} />
                      )}
                      {review.status === "visible" ? "Visible" : "Hidden"}
                    </button>
                    <button
                      onClick={() =>
                        setConfirmDelete({
                          id: review._id,
                          name: review.userName,
                        })
                      }
                      className="flex items-center justify-center p-1.5"
                      style={{
                        border: "1px solid var(--adm-border)",
                        color: "var(--adm-fg-muted)",
                        background: "transparent",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--adm-danger)";
                        e.currentTarget.style.color = "var(--adm-danger)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--adm-border)";
                        e.currentTarget.style.color = "var(--adm-fg-muted)";
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className="w-8 h-8 font-sans text-[11px] font-bold"
              style={{
                background:
                  page === i + 1 ? "var(--adm-accent)" : "transparent",
                color: page === i + 1 ? "#fff" : "var(--adm-fg-muted)",
                border: "1px solid var(--adm-border)",
                cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div
            className="w-full max-w-sm p-7"
            style={{
              background: "#fff",
              border: "1px solid var(--adm-border)",
              boxShadow: "var(--adm-shadow-modal)",
            }}
          >
            <h3
              className="font-serif text-[16px] font-bold mb-2"
              style={{ color: "var(--adm-fg)" }}
            >
              Delete Review?
            </h3>
            <p
              className="font-sans text-[13px] leading-relaxed mb-5"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Review by{" "}
              <strong style={{ color: "var(--adm-fg)" }}>
                {confirmDelete.name}
              </strong>{" "}
              will be permanently removed.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 font-sans text-[11px] font-bold tracking-widest uppercase"
                style={{
                  border: "1px solid var(--adm-border)",
                  color: "var(--adm-fg-muted)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="flex-[1.5] py-2.5 font-sans text-[11px] font-bold tracking-widest uppercase text-white"
                style={{
                  background: "var(--adm-danger)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[999] flex items-center gap-2.5 px-4 py-3"
          style={{
            background: "#fff",
            border: `1px solid ${toast.type === "success" ? "var(--adm-accent)" : "var(--adm-danger)"}`,
            boxShadow: "var(--adm-shadow-toast)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={15} style={{ color: "var(--adm-accent)" }} />
          ) : (
            <AlertCircle size={15} style={{ color: "var(--adm-danger)" }} />
          )}
          <span
            className="font-sans text-[13px] font-semibold"
            style={{ color: "var(--adm-fg)" }}
          >
            {toast.msg}
          </span>
        </div>
      )}
    </>
  );
};

export default ReviewsManager;
