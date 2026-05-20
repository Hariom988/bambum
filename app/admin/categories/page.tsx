"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit3,
  Tag,
  Save,
  X,
} from "lucide-react";

// ─── Types

interface Category {
  _id: string;
  name: string;
  createdAt?: string;
}

type Toast = { type: "success" | "error"; msg: string } | null;

type ConfirmDelete = { id: string; name: string } | null;

// ─── CategoryManager

interface CategoryManagerProps {
  onCategoriesChange?: () => void;
}

export default function CategoryManager({
  onCategoriesChange,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete>(null);

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // ── Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Fetch
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/category");
      if (res.ok) {
        const d = await res.json();
        setCategories(d.categories || []);
      }
    } catch {
      setToast({ type: "error", msg: "Failed to load categories." });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── Add
  const handleAdd = useCallback(async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const d = await res.json();
      if (res.ok) {
        setToast({ type: "success", msg: `"${newName.trim()}" added.` });
        setNewName("");
        fetchCategories();
        onCategoriesChange?.();
      } else {
        setToast({ type: "error", msg: d.error || "Failed to add." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  }, [newName, fetchCategories]);

  // ── Edit save
  const handleEditSave = useCallback(async () => {
    if (!editingId || !editingName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: editingId, name: editingName.trim() }),
      });
      const d = await res.json();
      if (res.ok) {
        setToast({ type: "success", msg: "Category updated." });
        setEditingId(null);
        setEditingName("");
        fetchCategories();
        onCategoriesChange?.();
      } else {
        setToast({ type: "error", msg: d.error || "Failed to update." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  }, [editingId, editingName, fetchCategories]);

  // ── Delete
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/admin/category?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setToast({ type: "success", msg: "Category deleted." });
          fetchCategories();
          onCategoriesChange?.();
        }
      } catch {
        setToast({ type: "error", msg: "Failed to delete." });
      }
      setConfirmDelete(null);
    },
    [fetchCategories],
  );

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    setEditingName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // ── Render
  return (
    <div className="max-w-full px-2 py-7 md:pb-16 pb-24">
      {/* ── ADD FORM ── */}
      <div
        className="border mb-5 overflow-hidden"
        style={{
          background: "var(--adm-bg-white)",
          borderColor: "var(--adm-border)",
          boxShadow: "var(--adm-shadow-card)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-5 py-3.5 border-b"
          style={{
            background: "var(--adm-bg-soft)",
            borderColor: "var(--adm-border-soft)",
          }}
        >
          <div
            className="w-6 h-6 shrink-0 flex items-center justify-center"
            style={{
              background: "var(--adm-bg-accent-lt)",
              border: "1px solid var(--adm-accent-border)",
              color: "var(--adm-accent)",
            }}
          >
            <Plus size={11} />
          </div>
          <span
            className="font-sans text-[10px] font-bold tracking-[0.14em] uppercase"
            style={{ color: "var(--adm-fg)" }}
          >
            Add New Category
          </span>
        </div>

        <div className="p-5 flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder=""
              className="w-full pl-9 pr-5 py-2.5 border font-sans text-[13px] outline-none transition-all duration-150"
              style={{
                borderColor: "var(--adm-border)",
                background: "var(--adm-bg-input)",
                color: "var(--adm-fg)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--adm-accent)";
                e.currentTarget.style.background = "var(--adm-bg-white)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--adm-border)";
                e.currentTarget.style.background = "var(--adm-bg-input)";
              }}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 border-none cursor-pointer font-sans text-[10px] font-bold tracking-widest uppercase text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shrink-0"
            style={{ background: "var(--adm-accent)" }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled)
                e.currentTarget.style.background = "var(--adm-accent-hover)";
            }}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--adm-accent)")
            }
          >
            {saving ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Plus size={11} />
            )}
            Add
          </button>
        </div>
      </div>

      {/* ── CATEGORY LIST ── */}
      <div
        className="border overflow-hidden"
        style={{
          background: "var(--adm-bg-white)",
          borderColor: "var(--adm-border)",
          boxShadow: "var(--adm-shadow-card)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-b"
          style={{
            background: "var(--adm-bg-soft)",
            borderColor: "var(--adm-border-soft)",
          }}
        >
          <span
            className="font-sans text-[10px] font-bold tracking-[0.14em] uppercase"
            style={{ color: "var(--adm-fg)" }}
          >
            All Categories
          </span>
          <span
            className="font-sans text-[9px] font-bold px-1.5 py-0.5"
            style={{
              background: "var(--adm-bg-accent-md)",
              border: "1px solid var(--adm-accent-border)",
              color: "var(--adm-accent)",
            }}
          >
            {categories.length}
          </span>
        </div>

        {/* Body */}
        {loading ? (
          <div
            className="flex items-center justify-center gap-2.5 py-14 font-sans text-[13px]"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
            <div
              className="w-12 h-12 flex items-center justify-center mb-3"
              style={{
                background: "var(--adm-bg-accent-lt)",
                border: "1px solid var(--adm-accent-border)",
                color: "var(--adm-accent)",
              }}
            >
              <Tag size={18} />
            </div>
            <div
              className="font-serif text-[15px] font-bold mb-1"
              style={{ color: "var(--adm-fg)" }}
            >
              No categories yet
            </div>
            <div
              className="font-sans text-[12px]"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Add your first category above.
            </div>
          </div>
        ) : (
          <div>
            {categories.map((cat, idx) => (
              <div
                key={cat._id}
                className="flex items-center gap-3 px-5 py-3 transition-colors duration-150 border-b last:border-b-0"
                style={{ borderColor: "var(--adm-border-soft)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--adm-bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Index */}
                <span
                  className="font-sans text-[10px] font-bold w-5 shrink-0 tabular-nums"
                  style={{ color: "var(--adm-fg-faint)" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                {/* Name / Edit input */}
                {editingId === cat._id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    className="flex-1 px-3 py-1.5 border font-sans text-[13px] outline-none"
                    style={{
                      borderColor: "var(--adm-accent)",
                      background: "var(--adm-bg-white)",
                      color: "var(--adm-fg)",
                    }}
                  />
                ) : (
                  <span
                    className="flex-1 font-sans text-[13px] font-semibold"
                    style={{ color: "var(--adm-fg)" }}
                  >
                    {cat.name}
                  </span>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {editingId === cat._id ? (
                    <>
                      <button
                        onClick={handleEditSave}
                        disabled={saving}
                        className="flex items-center gap-1 px-3 py-1.5 border-none cursor-pointer font-sans text-[9px] font-bold tracking-widest uppercase text-white disabled:opacity-50 transition-colors duration-150"
                        style={{ background: "var(--adm-accent)" }}
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled)
                            e.currentTarget.style.background =
                              "var(--adm-accent-hover)";
                        }}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            "var(--adm-accent)")
                        }
                      >
                        {saving ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <Save size={10} />
                        )}
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center justify-center p-1.5 border cursor-pointer transition-all duration-150"
                        style={{
                          borderColor: "var(--adm-border)",
                          color: "var(--adm-fg-muted)",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--adm-accent)";
                          e.currentTarget.style.color = "var(--adm-accent)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--adm-border)";
                          e.currentTarget.style.color = "var(--adm-fg-muted)";
                        }}
                      >
                        <X size={11} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        className="flex items-center gap-1 px-2.5 py-1.5 border font-sans text-[9px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-150"
                        style={{
                          borderColor: "var(--adm-border)",
                          color: "var(--adm-fg-muted)",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--adm-accent)";
                          e.currentTarget.style.color = "var(--adm-accent)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--adm-border)";
                          e.currentTarget.style.color = "var(--adm-fg-muted)";
                        }}
                      >
                        <Edit3 size={10} /> Edit
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({ id: cat._id, name: cat.name })
                        }
                        className="flex items-center justify-center p-1.5 border cursor-pointer transition-all duration-150"
                        style={{
                          borderColor: "var(--adm-border)",
                          color: "var(--adm-fg-muted)",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--adm-danger)";
                          e.currentTarget.style.color = "var(--adm-danger)";
                          e.currentTarget.style.background =
                            "var(--adm-bg-danger-lt)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--adm-border)";
                          e.currentTarget.style.color = "var(--adm-fg-muted)";
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <Trash2 size={11} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[999] flex items-center gap-2.5 px-4 py-3 border animate-[toastIn_0.3s_ease]"
          style={{
            background: "var(--adm-bg-white)",
            borderColor:
              toast.type === "success"
                ? "var(--adm-accent)"
                : "var(--adm-danger)",
            boxShadow: "var(--adm-shadow-toast)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2
              size={15}
              className="shrink-0"
              style={{ color: "var(--adm-accent)" }}
            />
          ) : (
            <AlertCircle
              size={15}
              className="shrink-0"
              style={{ color: "var(--adm-danger)" }}
            />
          )}
          <span
            className="font-sans text-[13px] font-semibold"
            style={{ color: "var(--adm-fg)" }}
          >
            {toast.msg}
          </span>
        </div>
      )}

      {/* ── Confirm Delete Dialog ── */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-5"
          style={{ background: "var(--adm-overlay)" }}
        >
          <div
            className="p-7 max-w-sm w-full border"
            style={{
              background: "var(--adm-bg-white)",
              borderColor: "var(--adm-border)",
              boxShadow: "var(--adm-shadow-modal)",
            }}
          >
            <h3
              className="font-serif text-[16px] font-bold mb-2"
              style={{ color: "var(--adm-fg)" }}
            >
              Delete Category?
            </h3>
            <p
              className="font-sans text-[13px] leading-relaxed mb-1"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--adm-fg)" }}>
                "{confirmDelete.name}"
              </strong>
              ?
            </p>
            <p
              className="font-sans text-[11px] mb-5"
              style={{ color: "var(--adm-fg-faint)" }}
            >
              Products already assigned this category won't be affected, but it
              will no longer appear in the dropdown.
            </p>
            <div className="flex gap-2.5">
              <button
                className="flex-1 py-2.5 border bg-transparent cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase transition-all duration-150"
                style={{
                  borderColor: "var(--adm-border)",
                  color: "var(--adm-fg-muted)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--adm-accent)";
                  e.currentTarget.style.color = "var(--adm-fg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--adm-border)";
                  e.currentTarget.style.color = "var(--adm-fg-muted)";
                }}
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="flex-[1.5] py-2.5 border-none cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-white transition-opacity duration-150"
                style={{ background: "var(--adm-danger)" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                onClick={() => handleDelete(confirmDelete.id)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
