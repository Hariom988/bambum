"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import AdminToast, { ToastState } from "@/app/admin/adminToast";
import ConfirmDeleteModal from "@/app/admin/confirmDeleteModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
}

type FormState = { question: string; answer: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM: FormState = { question: "", answer: "" };

const inputCls =
  "w-full px-3.5 py-2.5 font-sans text-[13px] outline-none transition-all duration-150";
const inputStyle = {
  border: "1px solid var(--adm-border)",
  background: "var(--adm-bg-input)",
  color: "var(--adm-fg)",
};

// ─── FAQ Form Modal ───────────────────────────────────────────────────────────

function FAQFormModal({
  editingItem,
  saving,
  onSave,
  onClose,
}: {
  editingItem: FAQItem | null;
  saving: boolean;
  onSave: (form: FormState) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(
    editingItem
      ? { question: editingItem.question, answer: editingItem.answer }
      : EMPTY_FORM,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
    >
      <div
        className="w-full max-w-lg"
        style={{
          background: "var(--adm-bg-white)",
          border: "1px solid var(--adm-border)",
          boxShadow: "var(--adm-shadow-modal)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Modal header */}
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
            onClick={onClose}
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

        {/* Form body */}
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
              autoFocus
              value={form.question}
              onChange={(e) =>
                setForm((f) => ({ ...f, question: e.target.value }))
              }
              placeholder="Enter the FAQ question…"
              className={inputCls}
              style={inputStyle}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--adm-accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--adm-border)")
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
              placeholder="Enter the FAQ answer…"
              rows={5}
              className={`${inputCls} resize-none`}
              style={inputStyle}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--adm-accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--adm-border)")
              }
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
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
              onClick={() => onSave(form)}
              disabled={saving}
              className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 font-sans text-[11px] font-bold tracking-[0.14em] uppercase disabled:opacity-50"
              style={{
                background: "var(--adm-accent)",
                color: "#fff",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}
              {saving ? "Saving…" : editingItem ? "Update FAQ" : "Save FAQ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FAQ Row ──────────────────────────────────────────────────────────────────

function FAQRow({
  item,
  index,
  total,
  onEdit,
  onToggle,
  onDelete,
  onReorder,
}: {
  item: FAQItem;
  index: number;
  total: number;
  onEdit: (item: FAQItem) => void;
  onToggle: (item: FAQItem) => void;
  onDelete: (item: FAQItem) => void;
  onReorder: (item: FAQItem, dir: "up" | "down") => void;
}) {
  return (
    <div
      style={{
        background: "var(--adm-bg-white)",
        border: "1px solid var(--adm-border)",
        boxShadow: "var(--adm-shadow-card)",
        opacity: item.isActive ? 1 : 0.65,
        transition: "opacity 0.2s",
      }}
    >
      {/* Active indicator bar */}

      <div className="flex rounded-sm items-start gap-3 p-5">
        {/* Reorder controls */}
        <div className="flex flex-col gap-1 shrink-0 mt-0.5">
          <button
            onClick={() => onReorder(item, "up")}
            disabled={index === 0}
            className="flex items-center justify-center w-6 h-6 disabled:opacity-25 transition-opacity"
            style={{
              background: "var(--adm-bg-soft)",
              border: "1px solid var(--adm-border)",
              cursor: index === 0 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronUp size={11} style={{ color: "var(--adm-fg-muted)" }} />
          </button>
          <button
            onClick={() => onReorder(item, "down")}
            disabled={index === total - 1}
            className="flex items-center justify-center w-6 h-6 disabled:opacity-25 transition-opacity"
            style={{
              background: "var(--adm-bg-soft)",
              border: "1px solid var(--adm-border)",
              cursor: index === total - 1 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronDown size={11} style={{ color: "var(--adm-fg-muted)" }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className="font-sans text-[10px] font-bold tracking-[0.12em] uppercase mb-1"
            style={{ color: "var(--adm-accent)" }}
          >
            Q{index + 1}
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

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Visibility toggle */}
          <button
            onClick={() => onToggle(item)}
            className="flex rounded-sm items-center gap-1 px-2.5 py-1.5 font-sans text-[9px] font-bold tracking-widest uppercase transition-all duration-150"
            style={{
              border: `1px solid ${item.isActive ? "var(--adm-accent-border-md)" : "var(--adm-border)"}`,
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
            <span className="hidden sm:inline">
              {item.isActive ? "Active" : "Inactive"}
            </span>
          </button>

          {/* Edit */}
          <button
            onClick={() => onEdit(item)}
            className="flex rounded-sm items-center gap-1 px-2.5 py-1.5 font-sans text-[9px] font-bold tracking-widest uppercase transition-all duration-150"
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
            <Edit3 size={10} />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(item)}
            className="flex rounded-sm items-center justify-center p-1.5 transition-all duration-150"
            style={{
              border: "1px solid var(--adm-border)",
              color: "var(--adm-fg-muted)",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-danger)";
              e.currentTarget.style.color = "var(--adm-danger)";
              e.currentTarget.style.background = "var(--adm-bg-danger-lt)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--adm-border)";
              e.currentTarget.style.color = "var(--adm-fg-muted)";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminFAQPage() {
  const router = useRouter();
  const [items, setItems] = useState<FAQItem[]>([]);
  const [filtered, setFiltered] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FAQItem | null>(null);

  // Auth guard
  useEffect(() => {
    const isActive = sessionStorage.getItem("admin_session_active");
    if (!isActive) router.replace("/admin/login");
  }, [router]);

  // Fetch
  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/content/faq");
      if (res.ok) {
        const d = await res.json();
        setItems(d.items || []);
      }
    } catch {
      setToast({ type: "error", msg: "Failed to load FAQs." });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Search filter
  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(
      q
        ? items.filter(
            (i) =>
              i.question.toLowerCase().includes(q) ||
              i.answer.toLowerCase().includes(q),
          )
        : items,
    );
  }, [search, items]);

  // Save (add or edit)
  const handleSave = async (form: FormState) => {
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
        setEditingItem(null);
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

  // Toggle visibility
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

  // Delete
  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await fetch(`/api/admin/content/faq?id=${confirmDelete._id}`, {
        method: "DELETE",
      });
      setToast({ type: "success", msg: "FAQ deleted." });
      fetchItems();
    } catch {
      setToast({ type: "error", msg: "Failed to delete." });
    }
    setConfirmDelete(null);
  };

  // Reorder
  const handleReorder = async (item: FAQItem, dir: "up" | "down") => {
    const idx = items.findIndex((i) => i._id === item._id);
    if (dir === "up" && idx === 0) return;
    if (dir === "down" && idx === items.length - 1) return;
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    const next = [...items];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setItems(next);
    try {
      await Promise.all([
        fetch("/api/admin/content/faq", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: next[idx]._id, order: idx }),
        }),
        fetch("/api/admin/content/faq", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: next[swapIdx]._id, order: swapIdx }),
        }),
      ]);
    } catch {
      setToast({ type: "error", msg: "Failed to reorder." });
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const openEdit = (item: FAQItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const activeCount = items.filter((i) => i.isActive).length;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--adm-bg)", color: "var(--adm-fg)" }}
    >
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {/* ── PAGE HEADING ── */}
        <div className="mb-8">
          <p
            className="font-sans text-[9px] font-bold tracking-[0.2em] uppercase mb-1"
            style={{ color: "var(--adm-accent)" }}
          >
            Content
          </p>
          <h1
            className="text-[1.6rem] font-bold tracking-tight"
            style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
          >
            FAQ Manager
          </h1>
          <p
            className="font-sans text-[0.8125rem] mt-1"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            Manage frequently asked questions shown on your storefront.
          </p>
        </div>

        {/* ── STAT + ACTIONS BAR ── */}
        <div
          className="flex rounded-sm flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 mb-6"
          style={{
            background: "var(--adm-bg-white)",
            border: "1px solid var(--adm-border)",
            boxShadow: "var(--adm-shadow-card)",
          }}
        >
          {/* Stats */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-sm flex items-center justify-center"
                style={{
                  background: "var(--adm-bg-accent-lt)",
                  border: "1px solid var(--adm-accent-border)",
                }}
              >
                <MessageSquare
                  size={14}
                  style={{ color: "var(--adm-accent)" }}
                />
              </div>
              <div>
                <p
                  className="font-sans text-[10px] font-bold tracking-[0.14em] uppercase"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Total FAQs
                </p>
                <p
                  className="font-serif text-sm font-bold"
                  style={{ color: "var(--adm-fg)" }}
                >
                  {items.length}
                </p>
              </div>
            </div>
            <div
              className="w-px h-8 hidden sm:block"
              style={{ background: "var(--adm-border)" }}
            />
            <div className="hidden sm:block">
              <p
                className="font-sans text-[10px] font-bold tracking-[0.14em] uppercase"
                style={{ color: "var(--adm-fg-muted)" }}
              >
                Active
              </p>
              <p
                className="font-serif text-sm font-bold"
                style={{ color: "var(--adm-accent)" }}
              >
                {activeCount}
              </p>
            </div>
          </div>

          {/* Add button */}
          <button
            onClick={openAdd}
            className="flex rounded-sm items-center gap-2 px-4 py-2.5 font-sans text-[10px] font-bold tracking-[0.14em] uppercase transition-all duration-150"
            style={{
              background: "var(--adm-accent)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--adm-accent-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--adm-accent)")
            }
          >
            <Plus size={12} /> Add FAQ
          </button>
        </div>

        {/* ── SEARCH BAR ── */}
        <div
          className="flex rounded-sm items-center gap-2.5 px-4 py-3 mb-5"
          style={{
            background: "var(--adm-bg-white)",
            border: "1px solid var(--adm-border)",
            boxShadow: "var(--adm-shadow-card)",
          }}
        >
          <Search
            size={14}
            style={{ color: "var(--adm-fg-faint)", flexShrink: 0 }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions or answers…"
            className="flex-1 bg-transparent outline-none font-sans text-[13px]"
            style={{ color: "var(--adm-fg)", border: "none" }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--adm-fg-faint)",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── LIST ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={22}
              className="animate-spin"
              style={{ color: "var(--adm-accent)" }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border)",
            }}
          >
            <MessageSquare
              size={32}
              style={{ color: "var(--adm-accent)", opacity: 0.3 }}
            />
            <p
              className="font-serif text-[15px] font-bold mt-4"
              style={{ color: "var(--adm-fg)" }}
            >
              {search ? "No FAQs match your search" : "No FAQs yet"}
            </p>
            <p
              className="font-sans text-[12px] mt-1"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              {search
                ? "Try a different search term."
                : "Add your first FAQ above."}
            </p>
          </div>
        ) : (
          <>
            {search && (
              <p
                className="font-sans text-[11px] mb-3"
                style={{ color: "var(--adm-fg-muted)" }}
              >
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "
                {search}"
              </p>
            )}
            <div className="flex flex-col gap-3">
              {filtered.map((item, idx) => (
                <FAQRow
                  key={item._id}
                  item={item}
                  index={idx}
                  total={filtered.length}
                  onEdit={openEdit}
                  onToggle={handleToggle}
                  onDelete={setConfirmDelete}
                  onReorder={handleReorder}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── MODALS ── */}
      {showForm && (
        <FAQFormModal
          editingItem={editingItem}
          saving={saving}
          onSave={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          title="Delete FAQ?"
          description={
            <>
              <strong style={{ color: "var(--adm-fg)" }}>
                "{confirmDelete.question}"
              </strong>{" "}
              will be permanently removed.
            </>
          }
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
