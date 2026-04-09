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
  FolderOpen,
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

  // Add form
  const [newName, setNewName] = useState("");

  // Inline edit
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
    <div className="max-w-3xl px-8 py-7 md:pb-16 pb-24">
      {/* Page title */}
      <div className="mb-6">
        <div className="font-serif text-[22px] font-bold text-[#1c1813]">
          Categories
        </div>
        <div className="font-sans text-[12px] text-[#7a7068] mt-0.5">
          Manage product categories stored in your database. Changes reflect
          immediately in the Add / Edit product form.
        </div>
      </div>

      {/* ── ADD FORM ── */}
      <div className="bg-white border border-[#e8e0d5] mb-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#f0ebe3] bg-[#fdfaf7]">
          <div className="w-6 h-6 shrink-0 bg-[rgba(184,148,94,0.1)] border border-[rgba(184,148,94,0.2)] flex items-center justify-center text-[#b8945e]">
            <Plus size={11} />
          </div>
          <span className="font-sans text-[10px] font-bold tracking-[0.14em] uppercase text-[#1c1813]">
            Add New Category
          </span>
        </div>

        <div className="p-5 flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Tag size={13} className="text-[#b8945e]" />
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="e.g. Men's Brief, Women's Bra…"
              className="w-full pl-9 pr-4 py-2.5 border border-[#e8e0d5] bg-[#f7f3ee] font-sans text-[13px] text-[#1c1813] outline-none transition-all duration-150 placeholder-[#bdb5a8] focus:border-[#b8945e] focus:bg-white"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-[#b8945e] border-none cursor-pointer font-sans text-[10px] font-bold tracking-widest uppercase text-white hover:bg-[#9a7a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shrink-0"
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
      <div className="bg-white border border-[#e8e0d5] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-b border-[#f0ebe3] bg-[#fdfaf7]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 shrink-0 bg-[rgba(184,148,94,0.1)] border border-[rgba(184,148,94,0.2)] flex items-center justify-center text-[#b8945e]">
              <FolderOpen size={11} />
            </div>
            <span className="font-sans text-[10px] font-bold tracking-[0.14em] uppercase text-[#1c1813]">
              All Categories
            </span>
          </div>
          <span className="font-sans text-[9px] font-bold px-1.5 py-0.5 bg-[rgba(184,148,94,0.15)] border border-[rgba(184,148,94,0.25)] text-[#b8945e]">
            {categories.length}
          </span>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center gap-2.5 py-14 font-sans text-[13px] text-[#7a7068]">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-5 text-center">
            <div className="w-12 h-12 bg-[rgba(184,148,94,0.1)] border border-[rgba(184,148,94,0.2)] flex items-center justify-center text-[#b8945e] mb-3">
              <Tag size={18} />
            </div>
            <div className="font-serif text-[15px] font-bold mb-1 text-[#1c1813]">
              No categories yet
            </div>
            <div className="font-sans text-[12px] text-[#7a7068]">
              Add your first category above.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#f0ebe3]">
            {categories.map((cat, idx) => (
              <div
                key={cat._id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-[rgba(184,148,94,0.03)] transition-colors duration-150 group"
              >
                {/* Index */}
                <span className="font-sans text-[10px] font-bold text-[#bdb5a8] w-5 shrink-0 tabular-nums">
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
                    className="flex-1 px-3 py-1.5 border border-[#b8945e] bg-white font-sans text-[13px] text-[#1c1813] outline-none"
                  />
                ) : (
                  <span className="flex-1 font-sans text-[13px] font-semibold text-[#1c1813]">
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
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#b8945e] border-none cursor-pointer font-sans text-[9px] font-bold tracking-widest uppercase text-white hover:bg-[#9a7a4a] disabled:opacity-50 transition-colors duration-150"
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
                        className="flex items-center justify-center p-1.5 border border-[#e8e0d5] text-[#7a7068] hover:border-[#b8945e] hover:text-[#b8945e] transition-all duration-150 cursor-pointer"
                      >
                        <X size={11} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(cat)}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-[#e8e0d5] font-sans text-[9px] font-bold tracking-widest uppercase text-[#7a7068] hover:border-[#b8945e] hover:text-[#b8945e] transition-all duration-150 cursor-pointer opacity-0 group-hover:opacity-100"
                      >
                        <Edit3 size={10} /> Edit
                      </button>
                      <button
                        onClick={() =>
                          setConfirmDelete({ id: cat._id, name: cat.name })
                        }
                        className="flex items-center justify-center p-1.5 border border-[#e8e0d5] text-[#7a7068] hover:border-[#c0392b] hover:text-[#c0392b] hover:bg-[rgba(192,57,43,0.08)] transition-all duration-150 cursor-pointer opacity-0 group-hover:opacity-100"
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

        {/* Footer note */}
        {categories.length > 0 && (
          <div className="px-5 py-3 border-t border-[#f0ebe3] bg-[#fdfaf7]">
            <p className="font-sans text-[10px] text-[#bdb5a8]">
              Hover over a row to reveal edit and delete actions. These
              categories appear in the product form dropdown.
            </p>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[999] flex items-center gap-2.5 px-4 py-3 bg-white border shadow-[0_4px_24px_rgba(0,0,0,0.10)] animate-[toastIn_0.3s_ease]"
          style={{
            borderColor: toast.type === "success" ? "#b8945e" : "#c0392b",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={15} className="text-[#b8945e] shrink-0" />
          ) : (
            <AlertCircle size={15} className="text-[#c0392b] shrink-0" />
          )}
          <span className="font-sans text-[13px] font-semibold text-[#1c1813]">
            {toast.msg}
          </span>
        </div>
      )}

      {/* ── Confirm Delete Dialog ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center p-5">
          <div className="bg-white border border-[#e8e0d5] p-7 max-w-[340px] w-full shadow-[0_8px_40px_rgba(0,0,0,0.15)]">
            <h3 className="font-serif text-[16px] font-bold mb-2 text-[#1c1813]">
              Delete Category?
            </h3>
            <p className="font-sans text-[13px] text-[#7a7068] leading-relaxed mb-1">
              Are you sure you want to delete{" "}
              <strong className="text-[#1c1813]">"{confirmDelete.name}"</strong>
              ?
            </p>
            <p className="font-sans text-[11px] text-[#bdb5a8] mb-5">
              Products already assigned this category won't be affected, but it
              will no longer appear in the dropdown.
            </p>
            <div className="flex gap-2.5">
              <button
                className="flex-1 py-2.5 border border-[#e8e0d5] bg-transparent cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-[#7a7068] hover:border-[#b8945e] hover:text-[#1c1813] transition-all duration-150"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="flex-[1.5] py-2.5 bg-[#c0392b] border-none cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-white hover:opacity-90 transition-opacity duration-150"
                onClick={() => handleDelete(confirmDelete.id)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
