"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Package,
  X,
  ChevronLeft,
  Trash2,
  Save,
  Loader2,
  Tag,
  FileText,
  Layers,
  LogOut,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Upload,
  LayoutGrid,
  ArrowLeft,
} from "lucide-react";

interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
  imageFiles?: File[];
}

interface Product {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  variants: ProductVariant[];
  createdAt?: string;
}

const CATEGORIES = [
  "Men's Brief",
  "Men's Trunk",
  "Men's Boxer",
  "Women's Panty",
  "Women's Bra",
  "Accessories",
  "Other",
];

const EMPTY_PRODUCT: Omit<Product, "_id" | "createdAt"> = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  category: "",
  variants: [
    { colorName: "", colorHex: "#c8a97e", images: [""], imageFiles: [] },
  ],
};

type View = "products" | "add" | "edit";
const FormSection = ({
  icon,
  title,
  children,
  headerRight,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) => (
  <div className="bg-white border border-[#e8e0d5] mb-4 overflow-hidden">
    <div className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-b border-[#f0ebe3] bg-[#fdfaf7]">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 shrink-0 bg-[rgba(184,148,94,0.1)] border border-[rgba(184,148,94,0.2)] flex items-center justify-center text-[#b8945e]">
          {icon}
        </div>
        <span className="font-sans text-[10px] font-bold tracking-[0.14em] uppercase text-[#1c1813]">
          {title}
        </span>
      </div>
      {headerRight}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-[#7a7068] mb-1.5">
    {children}
  </label>
);

const inputCls =
  "w-full px-3.5 py-2.5 border border-[#e8e0d5] bg-[#f7f3ee] font-sans text-[13px] text-[#1c1813] outline-none transition-all duration-150 placeholder-[#bdb5a8] focus:border-[#b8945e] focus:bg-white";
const ProductRow = ({
  product,
  onEdit,
  onDelete,
  activeProducts,
  setConfirmDialog,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  activeProducts: Record<string, boolean>;
  setConfirmDialog: React.Dispatch<
    React.SetStateAction<{
      type: "delete" | "toggle";
      productId: string;
      productName: string;
      currentActive?: boolean;
    } | null>
  >;
}) => {
  const isActive = activeProducts[product._id!] !== false;
  const firstImage = product.variants[0]?.images[0];

  return (
    <div
      className="grid gap-3 px-4 py-3 items-center border-b border-[#f0ebe3] bg-white hover:bg-[rgba(184,148,94,0.04)] transition-colors duration-150"
      style={{
        gridTemplateColumns: "60px 1fr 140px 120px 80px 60px 100px 60px",
      }}
    >
      <div className="w-12 h-14 border border-[#e8e0d5] overflow-hidden shrink-0 bg-[#f7f3ee]">
        {firstImage && (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div>
        <div className="font-bold text-[13px] text-[#1c1813]">
          {product.name}
        </div>
        <div className="font-sans text-[10px] text-[#7a7068] mt-0.5">
          /{product.slug}
        </div>
      </div>
      <div className="font-sans text-[11px] text-[#7a7068] font-semibold tracking-wide">
        {product.category}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {product.variants.map((v, i) => (
          <div
            key={i}
            title={v.colorName}
            className="w-4 h-4 rounded-full border-2 border-[#e8e0d5] shrink-0"
            style={{ background: v.colorHex }}
          />
        ))}
      </div>
      <div className="font-bold text-[13px] text-[#1c1813]">
        ₹{product.price}
      </div>
      <button
        className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 border border-[#e8e0d5] font-sans text-[10px] font-bold tracking-widest uppercase text-[#7a7068] hover:border-[#b8945e] hover:text-[#b8945e] transition-all duration-150"
        onClick={() => onEdit(product)}
      >
        <Edit3 size={11} /> Edit
      </button>
      <button
        onClick={() =>
          setConfirmDialog({
            type: "toggle",
            productId: product._id!,
            productName: product.name,
            currentActive: isActive,
          })
        }
        className="flex items-center gap-1.5 px-2.5 py-1.5 border font-sans text-[9px] font-bold tracking-widest uppercase transition-all duration-150 whitespace-nowrap"
        style={{
          borderColor: isActive ? "rgba(184,148,94,0.35)" : "#e8e0d5",
          background: isActive ? "rgba(184,148,94,0.1)" : "rgba(0,0,0,0.03)",
          color: isActive ? "#b8945e" : "#7a7068",
        }}
      >
        <div
          className="w-7 h-3.5 rounded-full relative shrink-0 transition-colors duration-200"
          style={{ background: isActive ? "#b8945e" : "#ccc" }}
        >
          <div
            className="absolute top-0.5 rounded-full w-2.5 h-2.5 bg-white transition-all duration-200"
            style={{ left: isActive ? "14px" : "2px" }}
          />
        </div>
        {isActive ? "Active" : "Inactive"}
      </button>
      <button
        className="flex items-center justify-center p-1.5 border border-[#e8e0d5] text-[#7a7068] hover:border-[#c0392b] hover:text-[#c0392b] hover:bg-[rgba(192,57,43,0.08)] transition-all duration-150"
        onClick={() =>
          setConfirmDialog({
            type: "delete",
            productId: product._id!,
            productName: product.name,
          })
        }
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
};

// ─── MobileProductCard
const MobileProductCard = ({
  product,
  onEdit,
  activeProducts,
  setConfirmDialog,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  activeProducts: Record<string, boolean>;
  setConfirmDialog: React.Dispatch<
    React.SetStateAction<{
      type: "delete" | "toggle";
      productId: string;
      productName: string;
      currentActive?: boolean;
    } | null>
  >;
}) => {
  const isActive = activeProducts[product._id!] !== false;
  const firstImage = product.variants[0]?.images[0];

  return (
    <div className="bg-white border border-[#e8e0d5] overflow-hidden">
      <div className="h-0.5 bg-[#b8945e] opacity-40" />
      <div className="flex gap-3 p-3">
        <div className="w-16 h-20 shrink-0 border border-[#e8e0d5] overflow-hidden bg-[#f7f3ee]">
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={18} className="text-[#b8945e] opacity-50" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-serif font-bold text-sm text-[#1c1813] leading-tight">
            {product.name}
          </div>
          <div className="font-sans text-[9px] font-bold tracking-[0.14em] uppercase text-[#b8945e] mt-0.5">
            {product.category}
          </div>
          <div className="font-sans text-[10px] text-[#7a7068] mt-0.5">
            /{product.slug}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            {product.variants.map((v, i) => (
              <div
                key={i}
                title={v.colorName}
                className="w-3.5 h-3.5 rounded-full border-2 border-[#e8e0d5]"
                style={{ background: v.colorHex }}
              />
            ))}
            <span className="font-sans text-[10px] text-[#7a7068] ml-1">
              {product.variants.length} colour
              {product.variants.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end justify-between shrink-0">
          <div className="font-serif font-bold text-base text-[#1c1813]">
            ₹{product.price}
          </div>
          <button
            onClick={() =>
              setConfirmDialog({
                type: "toggle",
                productId: product._id!,
                productName: product.name,
                currentActive: isActive,
              })
            }
            className="flex items-center gap-1 px-2 py-1 border font-sans text-[8px] font-bold tracking-widest uppercase transition-all duration-150"
            style={{
              borderColor: isActive ? "rgba(184,148,94,0.35)" : "#e8e0d5",
              background: isActive
                ? "rgba(184,148,94,0.1)"
                : "rgba(0,0,0,0.03)",
              color: isActive ? "#b8945e" : "#7a7068",
            }}
          >
            <div
              className="w-5 h-2.5 rounded-full relative shrink-0"
              style={{ background: isActive ? "#b8945e" : "#ccc" }}
            >
              <div
                className="absolute top-0.5 rounded-full w-1.5 h-1.5 bg-white transition-all duration-200"
                style={{ left: isActive ? "10px" : "2px" }}
              />
            </div>
            {isActive ? "Live" : "Off"}
          </button>
        </div>
      </div>
      <div className="flex border-t border-[#f0ebe3]">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 font-sans text-[10px] font-bold tracking-widest uppercase text-[#7a7068] hover:bg-[rgba(184,148,94,0.06)] hover:text-[#b8945e] transition-all duration-150 border-r border-[#f0ebe3]"
          onClick={() => onEdit(product)}
        >
          <Edit3 size={11} /> Edit Product
        </button>
        <button
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 font-sans text-[10px] font-bold tracking-widest uppercase text-[#7a7068] hover:bg-[rgba(192,57,43,0.06)] hover:text-[#c0392b] transition-all duration-150"
          onClick={() =>
            setConfirmDialog({
              type: "delete",
              productId: product._id!,
              productName: product.name,
            })
          }
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
};
export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] =
    useState<Omit<Product, "_id" | "createdAt">>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [time, setTime] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clock
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

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const d = await res.json();
        setProducts(d.products || []);
      }
    } catch {}
    setLoading(false);
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // slug auto-gen
  useEffect(() => {
    setForm((f) => ({
      ...f,
      slug: f.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  }, [form.name]);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setView("add");
  };
  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      category: p.category,
      variants: p.variants.map((v) => ({ ...v, imageFiles: [] })),
    });
    setView("add");
  };
  const cancel = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setView("products");
  };

  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [
        ...f.variants,
        { colorName: "", colorHex: "#c8a97e", images: [], imageFiles: [] },
      ],
    }));
  const removeVariant = (i: number) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, idx) => idx !== i),
    }));
  const updateVariant = (
    i: number,
    field: "colorName" | "colorHex",
    value: string,
  ) =>
    setForm((f) => {
      const v = [...f.variants];
      v[i] = { ...v[i], [field]: value };
      return { ...f, variants: v };
    });

  const handleImageUpload = (vi: number, files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    Promise.all(
      arr.map(
        (f) =>
          new Promise<string>((res) => {
            const r = new FileReader();
            r.onload = () => res(r.result as string);
            r.readAsDataURL(f);
          }),
      ),
    ).then((b64s) => {
      setForm((f) => {
        const v = [...f.variants];
        v[vi] = {
          ...v[vi],
          images: [...v[vi].images, ...b64s],
          imageFiles: [...(v[vi].imageFiles || []), ...arr],
        };
        return { ...f, variants: v };
      });
    });
  };

  const removeImg = (vi: number, ii: number) =>
    setForm((f) => {
      const v = [...f.variants];
      v[vi] = {
        ...v[vi],
        images: v[vi].images.filter((_, i) => i !== ii),
        imageFiles: (v[vi].imageFiles || []).filter((_, i) => i !== ii),
      };
      return { ...f, variants: v };
    });

  const handleSave = async () => {
    if (!form.name || !form.category || form.price <= 0) {
      setToast({
        type: "error",
        msg: "Name, category and price are required.",
      });
      return;
    }
    setSaving(true);
    try {
      const body = editingProduct ? { ...form, _id: editingProduct._id } : form;
      const res = await fetch("/api/admin/inventory", {
        method: editingProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setToast({
          type: "success",
          msg: editingProduct ? "Product updated!" : "Product added!",
        });
        await fetchProducts();
        cancel();
      } else {
        const d = await res.json();
        setToast({ type: "error", msg: d.error || "Failed to save." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/inventory?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setToast({ type: "success", msg: "Product deleted." });
        fetchProducts();
        if (editingProduct?._id === id) cancel();
      }
    } catch {}
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const [activeProducts, setActiveProducts] = useState<Record<string, boolean>>(
    {},
  );
  const toggleActive = (id: string) => {
    setActiveProducts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [confirmDialog, setConfirmDialog] = useState<{
    type: "delete" | "toggle";
    productId: string;
    productName: string;
    currentActive?: boolean;
  } | null>(null);

  const handleConfirmAction = () => {
    if (!confirmDialog) return;
    if (confirmDialog.type === "delete") {
      handleDelete(confirmDialog.productId);
    } else {
      toggleActive(confirmDialog.productId);
    }
    setConfirmDialog(null);
  };
  // ─── Form View
  const FormView = () => (
    <div className="max-w-7xl px-8 py-7 md:pb-16 pb-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 font-sans text-[11px] text-[#7a7068]">
        <button
          onClick={cancel}
          className="flex items-center gap-1 text-[#7a7068] hover:text-[#b8945e] transition-colors duration-150 bg-transparent border-none cursor-pointer p-0 font-sans text-[11px]"
        >
          <ArrowLeft size={12} /> All Products
        </button>
        <span>/</span>
        <span className="text-[#1c1813]">
          {editingProduct ? "Edit" : "New Product"}
        </span>
      </div>

      <div className="font-serif text-[22px] font-bold mb-6 text-[#1c1813]">
        {editingProduct ? editingProduct.name : "Add to Inventory"}
      </div>

      {/* Basic Info */}
      <FormSection icon={<Tag size={11} />} title="Basic Info">
        <div className="mb-4">
          <Label>Product Name *</Label>
          <input
            className={inputCls}
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Classic Brief"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Price (₹) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-[13px] font-bold text-[#b8945e]">
                ₹
              </span>
              <input
                className={`${inputCls} pl-7`}
                type="number"
                value={form.price || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: Number(e.target.value) }))
                }
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <Label>Category *</Label>
            <select
              className={`${inputCls} appearance-none`}
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
            >
              <option value="">Select…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      {/* Description */}
      <FormSection icon={<FileText size={11} />} title="Description">
        <textarea
          className={`${inputCls} resize-none leading-relaxed`}
          rows={3}
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          placeholder="Describe your product — fabric, comfort, use case…"
        />
      </FormSection>

      {/* Variants */}
      <FormSection
        icon={<Layers size={11} />}
        title="Colour Variants"
        headerRight={
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[rgba(184,148,94,0.3)] bg-transparent cursor-pointer font-sans text-[10px] font-bold tracking-widest uppercase text-[#b8945e] hover:bg-[rgba(184,148,94,0.1)] transition-all duration-150"
            onClick={addVariant}
          >
            <Plus size={10} /> Add Variant
          </button>
        }
      >
        {form.variants.map((variant, vi) => (
          <div
            key={vi}
            className="border border-[#e8e0d5] mb-3 last:mb-0 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-[#fdfaf7] border-b border-[#f0ebe3]">
              <input
                type="color"
                value={variant.colorHex}
                onChange={(e) => updateVariant(vi, "colorHex", e.target.value)}
                className="w-8 h-8 border-2 border-[#e8e0d5] cursor-pointer rounded-sm shrink-0 p-0"
              />
              <input
                type="text"
                className="flex-1 bg-transparent border-none outline-none font-sans text-[13px] font-semibold text-[#1c1813] placeholder-[#bdb5a8]"
                value={variant.colorName}
                onChange={(e) => updateVariant(vi, "colorName", e.target.value)}
                placeholder="Colour name (e.g. Black)"
              />
              {form.variants.length > 1 && (
                <button
                  className="w-6 h-6 flex items-center justify-center bg-transparent border-none cursor-pointer text-[#bdb5a8] hover:text-[#c0392b] transition-colors duration-150"
                  onClick={() => removeVariant(vi)}
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="p-3.5">
              <div className="font-sans text-[9px] font-bold tracking-[0.16em] uppercase text-[#7a7068] mb-2.5">
                Images
              </div>
              {variant.images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-2.5">
                  {variant.images.map((img, ii) => (
                    <div
                      key={ii}
                      className="relative aspect-square border border-[#e8e0d5] overflow-hidden group"
                    >
                      {/* <img
                        src={img}
                        alt="preview"
                        className="w-full h-full object-cover"
                      /> */}
                      <button
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-[rgba(192,57,43,0.9)] text-white flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        onClick={() => removeImg(vi, ii)}
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div
                className="flex flex-col items-center justify-center gap-2 py-6 px-3 border-2 border-dashed border-[#e8e0d5] cursor-pointer hover:border-[#b8945e] hover:bg-[rgba(184,148,94,0.04)] transition-all duration-200"
                onClick={() => fileInputRefs.current[vi]?.click()}
              >
                <div className="w-9 h-9 bg-[rgba(184,148,94,0.1)] border border-[rgba(184,148,94,0.2)] flex items-center justify-center text-[#b8945e]">
                  <Upload size={14} />
                </div>
                <span className="font-sans text-[12px] font-semibold text-[#7a7068]">
                  Click to upload images
                </span>
                <span className="font-sans text-[10px] text-[#bdb5a8]">
                  JPG, PNG, WEBP · Multiple allowed
                </span>
              </div>
              <input
                ref={(el) => {
                  fileInputRefs.current[vi] = el;
                }}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(vi, e.target.files)}
              />
            </div>
          </div>
        ))}
      </FormSection>

      {/* Actions */}
      <div className="bg-white border border-[#e8e0d5] p-5">
        {editingProduct && (
          <button
            className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-sans text-[10px] font-bold tracking-widest uppercase text-[#c0392b] mb-3.5 p-0 hover:opacity-70 transition-opacity duration-150"
            onClick={() =>
              editingProduct._id && handleDelete(editingProduct._id)
            }
          >
            <Trash2 size={11} /> Delete this product
          </button>
        )}
        <div className="flex gap-2.5">
          <button
            className="flex-1 py-3 border border-[#e8e0d5] bg-transparent cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-[#7a7068] hover:border-[#b8945e] hover:text-[#1c1813] transition-all duration-150"
            onClick={cancel}
          >
            Cancel
          </button>
          <button
            className="flex-[1.5] flex items-center justify-center gap-2 py-3 bg-[#b8945e] border-none cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-white hover:bg-[#9a7a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} />
            )}
            {saving
              ? "Saving…"
              : editingProduct
                ? "Update Product"
                : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Products View
  const ProductsView = () => (
    <>
      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between px-8 py-7 pb-5 border-b border-[#f0ebe3]">
        <div>
          <div className="font-serif text-[22px] font-bold text-[#1c1813]">
            All Products
          </div>
          <div className="font-sans text-[12px] text-[#7a7068] mt-0.5">
            {products.length} product{products.length !== 1 ? "s" : ""} in
            inventory
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 border-b border-[#f0ebe3]">
        <div>
          <div className="font-serif text-lg font-bold text-[#1c1813]">
            All Products
          </div>
          <div className="font-sans text-[11px] text-[#7a7068] mt-0.5">
            {products.length} item{products.length !== 1 ? "s" : ""}
          </div>
        </div>
        <button
          className="flex items-center gap-1.5 px-4 py-2 bg-[#b8945e] border-none cursor-pointer font-sans text-[10px] font-bold tracking-widest uppercase text-white hover:bg-[#9a7a4a] transition-colors duration-150"
          onClick={openAdd}
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2.5 py-20 font-sans text-[13px] text-[#7a7068]">
          <Loader2 size={18} className="animate-spin" /> Loading inventory…
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <div className="w-14 h-14 bg-[rgba(184,148,94,0.1)] border border-[rgba(184,148,94,0.2)] flex items-center justify-center text-[#b8945e] mb-4">
            <Package size={22} />
          </div>
          <div className="font-serif text-[16px] font-bold mb-1.5">
            No products yet
          </div>
          <div className="font-sans text-[13px] text-[#7a7068] mb-5">
            Add your first product to get started.
          </div>
          <button
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#b8945e] border-none cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-white hover:bg-[#9a7a4a] transition-colors duration-150"
            onClick={openAdd}
          >
            <Plus size={13} /> Add Product
          </button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block px-8 py-4">
            <div
              className="grid gap-3 px-4 py-2 font-sans text-[10px] font-bold tracking-[0.14em] uppercase text-[#7a7068] border-b border-[#e8e0d5] mb-1"
              style={{
                gridTemplateColumns:
                  "60px 1fr 140px 120px 80px 60px 100px 60px",
              }}
            >
              <span>Image</span>
              <span>Product Name</span>
              <span>Category</span>
              <span>Colours</span>
              <span>Price</span>
              <span>Edit</span>
              <span>Active</span>
              <span>Delete</span>
            </div>
            {products.map((product) => (
              <ProductRow
                key={product._id}
                product={product}
                onEdit={openEdit}
                onDelete={handleDelete}
                activeProducts={activeProducts}
                setConfirmDialog={setConfirmDialog}
              />
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden px-4 py-4 pb-24 flex flex-col gap-3">
            {products.map((product) => (
              <MobileProductCard
                key={product._id}
                product={product}
                onEdit={openEdit}
                activeProducts={activeProducts}
                setConfirmDialog={setConfirmDialog}
              />
            ))}
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="font-serif bg-[#f7f3ee] min-h-screen text-[#1c1813]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 h-15 bg-white border-b border-[#e8e0d5] flex items-center justify-between px-5 shadow-[0_1px_0_#e8e0d5]">
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 font-sans text-[11px] font-bold tracking-widest uppercase text-[#7a7068] bg-transparent border-none cursor-pointer px-2.5 py-1.5 hover:text-[#1c1813] transition-colors duration-150"
            onClick={() => router.push("/admin/dashboard")}
          >
            <ChevronLeft size={13} />{" "}
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="w-px h-5 bg-[#e8e0d5]" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(184,148,94,0.1)] border border-[rgba(184,148,94,0.25)] font-sans text-[10px] font-bold tracking-[0.14em] uppercase text-[#b8945e]">
            <ShieldCheck size={10} /> Inventory
          </div>
        </div>
        <div className="flex items-center gap-4">
          {time && (
            <span className="hidden sm:block font-sans text-[11px] text-[#7a7068] tracking-[0.04em]">
              {time}
            </span>
          )}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e8e0d5] bg-transparent cursor-pointer font-sans text-[10px] font-bold tracking-[0.12em] uppercase text-[#7a7068] hover:border-[#c0392b] hover:text-[#c0392b] hover:bg-[rgba(192,57,43,0.08)] transition-all duration-150"
            onClick={handleLogout}
          >
            <LogOut size={11} />{" "}
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex" style={{ height: "calc(100vh - 60px)" }}>
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-65 shrink-0 bg-white border-r border-[#e8e0d5] flex-col sticky top-15 h-[calc(100vh-60px)] overflow-y-auto">
          <div className="px-5 py-5 pb-4 border-b border-[#f0ebe3]">
            <div className="font-sans text-[9px] font-bold tracking-widest uppercase text-[#b8945e] mb-1">
              Bambumm Admin
            </div>
            <div className="font-serif text-[18px] font-bold text-[#1c1813]">
              Inventory
            </div>
          </div>

          <nav className="py-3">
            <button
              className={`flex items-center gap-2.5 w-full px-5 py-2.5 bg-transparent border-none cursor-pointer font-sans text-[13px] font-semibold text-left transition-all duration-150 border-r-2 ${view === "add" && !editingProduct ? "bg-[rgba(184,148,94,0.1)] text-[#1c1813] border-[#b8945e]" : "text-[#7a7068] border-transparent hover:bg-[rgba(184,148,94,0.06)] hover:text-[#1c1813]"}`}
              onClick={openAdd}
            >
              <Plus size={15} /> Add Product
            </button>
            <button
              className={`flex items-center gap-2.5 w-full px-5 py-2.5 bg-transparent border-none cursor-pointer font-sans text-[13px] font-semibold text-left transition-all duration-150 border-r-2 ${view === "products" ? "bg-[rgba(184,148,94,0.1)] text-[#1c1813] border-[#b8945e]" : "text-[#7a7068] border-transparent hover:bg-[rgba(184,148,94,0.06)] hover:text-[#1c1813]"}`}
              onClick={() => {
                setView("products");
                setEditingProduct(null);
              }}
            >
              <LayoutGrid size={15} /> All Products
              <span className="ml-auto font-sans text-[9px] font-bold px-1.5 py-0.5 bg-[rgba(184,148,94,0.15)] border border-[rgba(184,148,94,0.25)] text-[#b8945e]">
                {products.length}
              </span>
            </button>
          </nav>

          <div className="h-px bg-[#f0ebe3] my-1" />
          <div className="px-5 py-3 pb-1.5 font-sans text-[9px] font-bold tracking-[0.18em] uppercase text-[#7a7068]">
            Products
          </div>

          {loading ? (
            <div className="px-5 py-3 font-sans text-[12px] text-[#7a7068] flex items-center gap-2">
              <Loader2 size={12} className="animate-spin" /> Loading…
            </div>
          ) : products.length === 0 ? (
            <div className="px-5 py-3 font-sans text-[12px] text-[#7a7068]">
              No products yet.
            </div>
          ) : (
            products.map((p) => (
              <button
                key={p._id}
                className={`flex items-center gap-2.5 w-full px-5 py-2 bg-transparent border-none cursor-pointer text-left transition-all duration-150 border-r-2 ${editingProduct?._id === p._id ? "bg-[rgba(184,148,94,0.1)] border-[#b8945e]" : "border-transparent hover:bg-[rgba(184,148,94,0.06)]"}`}
                onClick={() => openEdit(p)}
              >
                <div className="w-8 h-8 shrink-0 bg-[#f7f3ee] border border-[#e8e0d5] flex items-center justify-center text-[#b8945e]">
                  <Package size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-[12px] font-semibold text-[#1c1813] truncate">
                    {p.name}
                  </div>
                  <div className="font-sans text-[10px] text-[#7a7068]">
                    ₹{p.price} · {p.variants.length} variant
                    {p.variants.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </button>
            ))
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {view === "products" && <ProductsView />}
          {view === "add" && (
            <div className="md:px-0 px-0">
              <FormView />
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-white border-t border-[#e8e0d5] flex shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <button
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 bg-transparent border-none cursor-pointer font-sans text-[9px] font-bold tracking-widest uppercase transition-all duration-150 border-t-2 ${view === "add" && !editingProduct ? "text-[#b8945e] border-[#b8945e]" : "text-[#7a7068] border-transparent"}`}
          onClick={openAdd}
        >
          <Plus size={18} /> Add
        </button>
        <button
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 bg-transparent border-none cursor-pointer font-sans text-[9px] font-bold tracking-widest uppercase transition-all duration-150 border-t-2 ${view === "products" ? "text-[#b8945e] border-[#b8945e]" : "text-[#7a7068] border-transparent"}`}
          onClick={() => {
            setView("products");
            setEditingProduct(null);
          }}
        >
          <LayoutGrid size={18} /> Products
        </button>
        <button
          className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-transparent border-none cursor-pointer font-sans text-[9px] font-bold tracking-widest uppercase text-[#7a7068] border-t-2 border-transparent transition-all duration-150"
          onClick={() => router.push("/admin/dashboard")}
        >
          <ChevronLeft size={18} /> Back
        </button>
      </nav>

      {/* ── Toast ── */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-999 flex items-center gap-2.5 px-4 py-3 bg-white border shadow-[0_4px_24px_rgba(0,0,0,0.10)] animate-[toastIn_0.3s_ease]"
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

      {/* ── Confirm Dialog ── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-1000 bg-black/40 flex items-center justify-center p-5">
          <div className="bg-white border border-[#e8e0d5] p-7 max-w-90 w-full shadow-[0_8px_40px_rgba(0,0,0,0.15)]">
            <h3 className="font-serif text-[16px] font-bold mb-2 text-[#1c1813]">
              {confirmDialog.type === "delete"
                ? "Delete Product?"
                : confirmDialog.currentActive
                  ? "Deactivate Product?"
                  : "Activate Product?"}
            </h3>
            <p className="font-sans text-[13px] text-[#7a7068] leading-relaxed mb-5">
              {confirmDialog.type === "delete"
                ? `Are you sure you want to permanently delete "${confirmDialog.productName}"? This cannot be undone.`
                : `${confirmDialog.currentActive ? "Deactivate" : "Activate"} "${confirmDialog.productName}"?`}
            </p>
            <div className="flex gap-2.5">
              <button
                className="flex-1 py-2.5 border border-[#e8e0d5] bg-transparent cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-[#7a7068] hover:border-[#b8945e] hover:text-[#1c1813] transition-all duration-150"
                onClick={() => setConfirmDialog(null)}
              >
                Cancel
              </button>
              <button
                className="flex-[1.5] py-2.5 border-none cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-white hover:opacity-90 transition-opacity duration-150"
                style={{
                  background:
                    confirmDialog.type === "delete" ? "#c0392b" : "#b8945e",
                }}
                onClick={handleConfirmAction}
              >
                {confirmDialog.type === "delete"
                  ? "Yes, Delete"
                  : confirmDialog.currentActive
                    ? "Yes, Deactivate"
                    : "Yes, Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* keyframe for toast */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
