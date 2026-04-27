"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
}

interface Testimonial {
  _id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  text: string;
  product: string;
  initials: string;
  isActive: boolean;
  order: number;
}

type Toast = { type: "success" | "error"; msg: string } | null;
type ActiveTab = "faq" | "testimonials";

// ─── Star Rating Component ────────────────────────────────────────────────────

function StarRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange?: (r: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          style={{
            background: "none",
            border: "none",
            cursor: onChange ? "pointer" : "default",
            padding: 0,
          }}
        >
          <Star
            size={16}
            fill={i <= rating ? "#b8945e" : "transparent"}
            strokeWidth={1.5}
            style={{ color: "#b8945e" }}
          />
        </button>
      ))}
    </div>
  );
}

// ─── FAQ Manager ─────────────────────────────────────────────────────────────

function FAQManager() {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    q: string;
  } | null>(null);
  const [form, setForm] = useState({ question: "", answer: "" });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content/faq");
      if (res.ok) {
        const d = await res.json();
        setItems(d.items || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAdd = () => {
    setEditingItem(null);
    setForm({ question: "", answer: "" });
    setShowForm(true);
  };

  const openEdit = (item: FAQItem) => {
    setEditingItem(item);
    setForm({ question: item.question, answer: item.answer });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setToast({ type: "error", msg: "Question and answer are required." });
      return;
    }
    setSaving(true);
    try {
      const body = editingItem ? { ...form, _id: editingItem._id } : form;
      const res = await fetch("/api/admin/content/faq", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setToast({
          type: "success",
          msg: editingItem ? "FAQ updated." : "FAQ added.",
        });
        setShowForm(false);
        fetchItems();
      } else {
        const d = await res.json();
        setToast({ type: "error", msg: d.error || "Failed to save." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  };

  const handleToggle = async (item: FAQItem) => {
    try {
      await fetch(`/api/admin/content/faq?id=${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchItems();
    } catch {
      setToast({ type: "error", msg: "Failed to toggle." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/content/faq?id=${id}`, { method: "DELETE" });
      setToast({ type: "success", msg: "FAQ deleted." });
      fetchItems();
    } catch {
      setToast({ type: "error", msg: "Failed to delete." });
    }
    setConfirmDelete(null);
  };

  const handleReorder = async (item: FAQItem, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i._id === item._id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === items.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newItems = [...items];
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    setItems(newItems);
    try {
      await Promise.all([
        fetch("/api/admin/content/faq", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: newItems[idx]._id, order: idx }),
        }),
        fetch("/api/admin/content/faq", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: newItems[swapIdx]._id, order: swapIdx }),
        }),
      ]);
    } catch {}
  };

  return (
    <>
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
            <MessageSquare size={14} style={{ color: "var(--adm-accent)" }} />
          </div>
          <div>
            <p
              className="font-sans text-[10px] font-bold tracking-[0.16em] uppercase"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Frequently Asked Questions
            </p>
            <p
              className="font-serif text-sm font-bold"
              style={{ color: "var(--adm-fg)" }}
            >
              {items.length} FAQ{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 font-sans text-[10px] font-bold tracking-[0.14em] uppercase"
          style={{
            background: "var(--adm-accent)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={12} /> Add FAQ
        </button>
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
      ) : items.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16"
          style={{ background: "#fff", border: "1px solid var(--adm-border)" }}
        >
          <MessageSquare
            size={28}
            style={{ color: "var(--adm-accent)", opacity: 0.4 }}
          />
          <p
            className="font-serif text-[15px] font-bold mt-3"
            style={{ color: "var(--adm-fg)" }}
          >
            No FAQs yet
          </p>
          <p
            className="font-sans text-[12px] mt-1"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            Add your first FAQ above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => (
            <div
              key={item._id}
              style={{
                background: "#fff",
                border: "1px solid var(--adm-border)",
                boxShadow: "var(--adm-shadow-card)",
                opacity: item.isActive ? 1 : 0.6,
              }}
            >
              <div
                className="h-0.5"
                style={{
                  background: item.isActive
                    ? "var(--adm-accent)"
                    : "var(--adm-border)",
                }}
              />
              <div className="flex items-start gap-4 p-5">
                {/* Order controls */}
                <div className="flex flex-col gap-1 shrink-0 mt-0.5">
                  <button
                    onClick={() => handleReorder(item, "up")}
                    disabled={idx === 0}
                    className="flex items-center justify-center w-6 h-6 disabled:opacity-30"
                    style={{
                      background: "var(--adm-bg-soft)",
                      border: "1px solid var(--adm-border)",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronUp
                      size={11}
                      style={{ color: "var(--adm-fg-muted)" }}
                    />
                  </button>
                  <button
                    onClick={() => handleReorder(item, "down")}
                    disabled={idx === items.length - 1}
                    className="flex items-center justify-center w-6 h-6 disabled:opacity-30"
                    style={{
                      background: "var(--adm-bg-soft)",
                      border: "1px solid var(--adm-border)",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronDown
                      size={11}
                      style={{ color: "var(--adm-fg-muted)" }}
                    />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase mb-1"
                    style={{ color: "var(--adm-accent)" }}
                  >
                    Q{idx + 1}
                  </p>
                  <p
                    className="font-sans text-sm font-bold leading-snug"
                    style={{ color: "var(--adm-fg)" }}
                  >
                    {item.question}
                  </p>
                  <p
                    className="font-sans text-[12px] leading-relaxed mt-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    {item.answer}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 font-sans text-[9px] font-bold tracking-widest uppercase"
                    style={{
                      border: `1px solid ${item.isActive ? "rgba(184,148,94,0.3)" : "var(--adm-border)"}`,
                      background: item.isActive
                        ? "var(--adm-bg-active)"
                        : "transparent",
                      color: item.isActive
                        ? "var(--adm-accent)"
                        : "var(--adm-fg-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {item.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                    {item.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 font-sans text-[9px] font-bold tracking-widest uppercase"
                    style={{
                      border: "1px solid var(--adm-border)",
                      color: "var(--adm-fg-muted)",
                      background: "transparent",
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
                    <Edit3 size={10} /> Edit
                  </button>
                  <button
                    onClick={() =>
                      setConfirmDelete({ id: item._id, q: item.question })
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
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div
            className="w-full max-w-lg"
            style={{
              background: "#fff",
              border: "1px solid var(--adm-border)",
              boxShadow: "var(--adm-shadow-modal)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              className="h-0.5"
              style={{ background: "var(--adm-accent)" }}
            />
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--adm-border-soft)" }}
            >
              <p
                className="font-serif text-sm font-bold"
                style={{ color: "var(--adm-fg)" }}
              >
                {editingItem ? "Edit FAQ" : "Add New FAQ"}
              </p>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--adm-fg-muted)",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label
                  className="block font-sans text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Question *
                </label>
                <input
                  type="text"
                  value={form.question}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, question: e.target.value }))
                  }
                  placeholder="Enter the FAQ question..."
                  className="w-full px-3.5 py-2.5 font-sans text-[13px] outline-none"
                  style={{
                    border: "1px solid var(--adm-border)",
                    background: "var(--adm-bg-input)",
                    color: "var(--adm-fg)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--adm-accent)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--adm-border)")
                  }
                />
              </div>
              <div>
                <label
                  className="block font-sans text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Answer *
                </label>
                <textarea
                  value={form.answer}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, answer: e.target.value }))
                  }
                  placeholder="Enter the FAQ answer..."
                  rows={4}
                  className="w-full px-3.5 py-2.5 font-sans text-[13px] outline-none resize-none"
                  style={{
                    border: "1px solid var(--adm-border)",
                    background: "var(--adm-bg-input)",
                    color: "var(--adm-fg)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--adm-accent)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--adm-border)")
                  }
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 font-sans text-[11px] font-bold tracking-[0.14em] uppercase"
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
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 font-sans text-[11px] font-bold tracking-[0.14em] uppercase disabled:opacity-50"
                  style={{
                    background: "var(--adm-accent)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {saving ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  {saving ? "Saving…" : editingItem ? "Update" : "Save FAQ"}
                </button>
              </div>
            </div>
          </div>
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
              Delete FAQ?
            </h3>
            <p
              className="font-sans text-[13px] leading-relaxed mb-5"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              "{confirmDelete.q}" will be permanently removed.
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
}

// ─── Testimonials Manager ─────────────────────────────────────────────────────

const EMPTY_T = {
  name: "",
  location: "",
  rating: 5,
  title: "",
  text: "",
  product: "",
};

function TestimonialsManager() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [form, setForm] = useState(EMPTY_T);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content/testimonials");
      if (res.ok) {
        const d = await res.json();
        setItems(d.items || []);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_T);
    setShowForm(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      location: item.location,
      rating: item.rating,
      title: item.title,
      text: item.text,
      product: item.product,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.title.trim() || !form.text.trim()) {
      setToast({
        type: "error",
        msg: "Name, title, and review text are required.",
      });
      return;
    }
    setSaving(true);
    try {
      const body = editingItem ? { ...form, _id: editingItem._id } : form;
      const res = await fetch("/api/admin/content/testimonials", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setToast({
          type: "success",
          msg: editingItem ? "Testimonial updated." : "Testimonial added.",
        });
        setShowForm(false);
        fetchItems();
      } else {
        const d = await res.json();
        setToast({ type: "error", msg: d.error || "Failed to save." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  };

  const handleToggle = async (item: Testimonial) => {
    try {
      await fetch(`/api/admin/content/testimonials?id=${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      fetchItems();
    } catch {
      setToast({ type: "error", msg: "Failed to toggle." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/admin/content/testimonials?id=${id}`, {
        method: "DELETE",
      });
      setToast({ type: "success", msg: "Testimonial deleted." });
      fetchItems();
    } catch {
      setToast({ type: "error", msg: "Failed to delete." });
    }
    setConfirmDelete(null);
  };

  const handleReorder = async (item: Testimonial, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i._id === item._id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === items.length - 1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    const newItems = [...items];
    [newItems[idx], newItems[swapIdx]] = [newItems[swapIdx], newItems[idx]];
    setItems(newItems);
    try {
      await Promise.all([
        fetch("/api/admin/content/testimonials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: newItems[idx]._id, order: idx }),
        }),
        fetch("/api/admin/content/testimonials", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: newItems[swapIdx]._id, order: swapIdx }),
        }),
      ]);
    } catch {}
  };

  const inputCls = "w-full px-3.5 py-2.5 font-sans text-[13px] outline-none";
  const inputStyle = {
    border: "1px solid var(--adm-border)",
    background: "var(--adm-bg-input)",
    color: "var(--adm-fg)",
  };

  return (
    <>
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
              Customer Reviews
            </p>
            <p
              className="font-serif text-sm font-bold"
              style={{ color: "var(--adm-fg)" }}
            >
              {items.length} Testimonial{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 font-sans text-[10px] font-bold tracking-[0.14em] uppercase"
          style={{
            background: "var(--adm-accent)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          <Plus size={12} /> Add Review
        </button>
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
      ) : items.length === 0 ? (
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
            No testimonials yet
          </p>
          <p
            className="font-sans text-[12px] mt-1"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            Add your first review above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => (
            <div
              key={item._id}
              style={{
                background: "#fff",
                border: "1px solid var(--adm-border)",
                boxShadow: "var(--adm-shadow-card)",
                opacity: item.isActive ? 1 : 0.6,
              }}
            >
              <div
                className="h-0.5"
                style={{
                  background: item.isActive
                    ? "var(--adm-accent)"
                    : "var(--adm-border)",
                }}
              />
              <div className="flex items-start gap-4 p-5">
                {/* Order controls */}
                <div className="flex flex-col gap-1 shrink-0 mt-0.5">
                  <button
                    onClick={() => handleReorder(item, "up")}
                    disabled={idx === 0}
                    className="flex items-center justify-center w-6 h-6 disabled:opacity-30"
                    style={{
                      background: "var(--adm-bg-soft)",
                      border: "1px solid var(--adm-border)",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronUp
                      size={11}
                      style={{ color: "var(--adm-fg-muted)" }}
                    />
                  </button>
                  <button
                    onClick={() => handleReorder(item, "down")}
                    disabled={idx === items.length - 1}
                    className="flex items-center justify-center w-6 h-6 disabled:opacity-30"
                    style={{
                      background: "var(--adm-bg-soft)",
                      border: "1px solid var(--adm-border)",
                      cursor: "pointer",
                    }}
                  >
                    <ChevronDown
                      size={11}
                      style={{ color: "var(--adm-fg-muted)" }}
                    />
                  </button>
                </div>

                {/* Avatar */}
                <div
                  className="w-10 h-10 shrink-0 flex items-center justify-center font-serif text-sm font-bold"
                  style={{
                    background: "var(--adm-bg-active)",
                    border: "1px solid var(--adm-accent-border)",
                    color: "var(--adm-accent)",
                  }}
                >
                  {item.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span
                      className="font-sans text-sm font-bold"
                      style={{ color: "var(--adm-fg)" }}
                    >
                      {item.name}
                    </span>
                    {item.location && (
                      <span
                        className="font-sans text-[11px]"
                        style={{ color: "var(--adm-fg-muted)" }}
                      >
                        {item.location}
                      </span>
                    )}
                    <StarRating rating={item.rating} />
                  </div>
                  <p
                    className="font-sans text-[12px] font-semibold leading-snug"
                    style={{ color: "var(--adm-fg)" }}
                  >
                    "{item.title}"
                  </p>
                  <p
                    className="font-sans text-[11px] leading-relaxed mt-1"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    {item.text.length > 100
                      ? item.text.slice(0, 100) + "…"
                      : item.text}
                  </p>
                  {item.product && (
                    <span
                      className="font-sans text-[10px] font-bold tracking-widest uppercase mt-1 inline-block"
                      style={{ color: "var(--adm-accent)" }}
                    >
                      {item.product}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 font-sans text-[9px] font-bold tracking-widest uppercase"
                    style={{
                      border: `1px solid ${item.isActive ? "rgba(184,148,94,0.3)" : "var(--adm-border)"}`,
                      background: item.isActive
                        ? "var(--adm-bg-active)"
                        : "transparent",
                      color: item.isActive
                        ? "var(--adm-accent)"
                        : "var(--adm-fg-muted)",
                      cursor: "pointer",
                    }}
                  >
                    {item.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                    {item.isActive ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => openEdit(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 font-sans text-[9px] font-bold tracking-widests uppercase"
                    style={{
                      border: "1px solid var(--adm-border)",
                      color: "var(--adm-fg-muted)",
                      background: "transparent",
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
                    <Edit3 size={10} /> Edit
                  </button>
                  <button
                    onClick={() =>
                      setConfirmDelete({ id: item._id, name: item.name })
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
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div
            className="w-full max-w-lg"
            style={{
              background: "#fff",
              border: "1px solid var(--adm-border)",
              boxShadow: "var(--adm-shadow-modal)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div
              className="h-0.5"
              style={{ background: "var(--adm-accent)" }}
            />
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--adm-border-soft)" }}
            >
              <p
                className="font-serif text-sm font-bold"
                style={{ color: "var(--adm-fg)" }}
              >
                {editingItem ? "Edit Testimonial" : "Add New Testimonial"}
              </p>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--adm-fg-muted)",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block font-sans text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    style={inputStyle}
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Customer name"
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--adm-accent)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--adm-border)")
                    }
                  />
                </div>
                <div>
                  <label
                    className="block font-sans text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    className={inputCls}
                    style={inputStyle}
                    value={form.location}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, location: e.target.value }))
                    }
                    placeholder="Mumbai"
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--adm-accent)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--adm-border)")
                    }
                  />
                </div>
              </div>

              <div>
                <label
                  className="block font-sans text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Rating
                </label>
                <StarRating
                  rating={form.rating}
                  onChange={(r) => setForm((f) => ({ ...f, rating: r }))}
                />
              </div>

              <div>
                <label
                  className="block font-sans text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Review Title *
                </label>
                <input
                  type="text"
                  className={inputCls}
                  style={inputStyle}
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Short punchy title..."
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--adm-accent)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--adm-border)")
                  }
                />
              </div>

              <div>
                <label
                  className="block font-sans text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Review Text *
                </label>
                <textarea
                  rows={4}
                  className={`${inputCls} resize-none`}
                  style={inputStyle}
                  value={form.text}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, text: e.target.value }))
                  }
                  placeholder="The full review text..."
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--adm-accent)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--adm-border)")
                  }
                />
              </div>

              <div>
                <label
                  className="block font-sans text-[10px] font-bold tracking-[0.14em] uppercase mb-1.5"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Product (optional)
                </label>
                <input
                  type="text"
                  className={inputCls}
                  style={inputStyle}
                  value={form.product}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, product: e.target.value }))
                  }
                  placeholder="Men's Brief – Black"
                  onFocus={(e) =>
                    (e.target.style.borderColor = "var(--adm-accent)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "var(--adm-border)")
                  }
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 font-sans text-[11px] font-bold tracking-[0.14em] uppercase"
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
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 font-sans text-[11px] font-bold tracking-[0.14em] uppercase disabled:opacity-50"
                  style={{
                    background: "var(--adm-accent)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {saving ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  {saving ? "Saving…" : editingItem ? "Update" : "Save Review"}
                </button>
              </div>
            </div>
          </div>
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
              Delete Testimonial?
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
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminContentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("faq");
  const [time, setTime] = useState("");

  useEffect(() => {
    const isActive = sessionStorage.getItem("admin_session_active");
    if (!isActive) {
      router.replace("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    sessionStorage.removeItem("admin_session_active");
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div
      className="font-serif min-h-screen"
      style={{ background: "var(--adm-bg)", color: "var(--adm-fg)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-5"
        style={{
          height: 60,
          background: "var(--adm-bg-white)",
          borderBottom: "1px solid var(--adm-border)",
          boxShadow: "var(--adm-shadow-nav)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 font-sans text-[11px] font-bold tracking-widest uppercase transition-all"
            style={{
              border: "1px solid var(--adm-border)",
              background: "transparent",
              color: "var(--adm-fg-muted)",
              cursor: "pointer",
            }}
            onClick={() => router.push("/admin/dashboard")}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-accent)";
              e.currentTarget.style.color = "var(--adm-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-border)";
              e.currentTarget.style.color = "var(--adm-fg-muted)";
            }}
          >
            <ChevronLeft size={13} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div
            className="w-px h-5"
            style={{ background: "var(--adm-border)" }}
          />
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 font-sans text-[10px] font-bold tracking-[0.14em] uppercase"
            style={{
              background: "var(--adm-bg-active)",
              border: "1px solid var(--adm-accent-border)",
              color: "var(--adm-accent)",
            }}
          >
            Content Manager
          </div>
        </div>
        <div className="flex items-center gap-4">
          {time && (
            <span
              className="hidden sm:block font-sans text-[11px] tracking-[0.04em]"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              {time}
            </span>
          )}
          <button
            className="font-sans text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 px-3 py-1.5"
            style={{
              border: "1px solid var(--adm-border)",
              background: "transparent",
              color: "var(--adm-fg-muted)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-danger-border)";
              e.currentTarget.style.color = "var(--adm-danger)";
              e.currentTarget.style.background = "var(--adm-bg-danger-lt)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-border)";
              e.currentTarget.style.color = "var(--adm-fg-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut size={11} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {/* Page header */}
        <div className="mb-6">
          <p
            className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
            style={{ color: "var(--adm-accent)" }}
          >
            Bambumm Admin
          </p>
          <h1
            className="text-[22px] font-bold"
            style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
          >
            Content Manager
          </h1>
          <p
            className="font-sans text-[12px] mt-0.5"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            Manage FAQs and customer testimonials shown on your storefront.
          </p>
        </div>

        {/* Tab switcher */}
        <div
          className="flex mb-6"
          style={{ border: "1px solid var(--adm-border)", background: "#fff" }}
        >
          {(
            [
              { key: "faq" as ActiveTab, label: "FAQs", icon: MessageSquare },
              {
                key: "testimonials" as ActiveTab,
                label: "Testimonials",
                icon: Star,
              },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 flex items-center justify-center gap-2 py-3 font-sans text-[11px] font-bold tracking-[0.12em] uppercase transition-all"
              style={{
                background:
                  activeTab === key ? "var(--adm-bg-active)" : "transparent",
                color:
                  activeTab === key
                    ? "var(--adm-accent)"
                    : "var(--adm-fg-muted)",
                border: "none",
                borderBottom:
                  activeTab === key
                    ? `2px solid var(--adm-accent)`
                    : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "faq" ? <FAQManager /> : <TestimonialsManager />}
      </main>
    </div>
  );
}
