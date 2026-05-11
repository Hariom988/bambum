"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Package,
  X,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Upload,
  ArrowLeft,
  Boxes,
  TrendingDown,
  AlertTriangle,
  Search,
  Eye,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductSize {
  size: string;
  stock: number;
}

interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
  imageFiles?: File[];
  sizes: ProductSize[];
}

interface Product {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  variants: ProductVariant[];
  stock: number;
  isActive: boolean;
  createdAt?: string;
}

type FormProduct = Omit<Product, "_id" | "createdAt">;

type ConfirmDialog = {
  type: "delete" | "toggle";
  productId: string;
  productName: string;
  currentActive?: boolean;
} | null;

type PageView = "list" | "view" | "form";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_SIZES: ProductSize[] = [
  { size: "Small", stock: 0 },
  { size: "Medium", stock: 0 },
  { size: "Large", stock: 0 },
  { size: "Extra Large", stock: 0 },
  { size: "XXL", stock: 0 },
];

const EMPTY_FORM: FormProduct = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  category: "",
  stock: 0,
  variants: [
    {
      colorName: "",
      colorHex: "#19635e",
      images: [],
      imageFiles: [],
      sizes: [...DEFAULT_SIZES],
    },
  ],
  isActive: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-sm"
        style={{
          background: "var(--adm-bg-danger-lt)",
          border: "1px solid var(--adm-danger-border)",
          color: "var(--adm-danger)",
        }}
      >
        <AlertTriangle size={8} /> Out of Stock
      </span>
    );
  if (stock <= 10)
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-sm"
        style={{
          background: "rgba(230,126,34,0.08)",
          border: "1px solid rgba(230,126,34,0.25)",
          color: "#e67e22",
        }}
      >
        <TrendingDown size={8} /> Low: {stock}
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase rounded-sm"
      style={{
        background: "rgba(39,174,96,0.08)",
        border: "1px solid rgba(39,174,96,0.2)",
        color: "#27ae60",
      }}
    >
      <Boxes size={8} /> {stock} in stock
    </span>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onView,
  onEdit,
  onDelete,
  onToggle,
  isActive,
}: {
  product: Product;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isActive: boolean;
}) {
  const firstImage = product.variants[0]?.images[0];

  return (
    <div
      className="flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg rounded-sm"
      style={{
        background: "var(--adm-bg-white)",
        border: "1px solid var(--adm-border-soft)",
        boxShadow: "var(--adm-shadow-card)",
      }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{ aspectRatio: "3/4", background: "var(--adm-bg-input)" }}
      >
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={32} style={{ color: "var(--adm-fg-faint)" }} />
          </div>
        )}
        {/* Active badge */}
        <div className="absolute top-2 right-2">
          <span
            className="text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-sm"
            style={{
              background: isActive
                ? "rgba(39,174,96,0.9)"
                : "rgba(192,57,43,0.85)",
              color: "#fff",
            }}
          >
            {isActive ? "Live" : "Off"}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        <p
          className="text-[0.6rem] font-bold tracking-[0.14em] uppercase"
          style={{ color: "var(--adm-accent)" }}
        >
          {product.category}
        </p>
        <h3
          className="text-[0.8125rem] font-bold leading-tight line-clamp-1"
          style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
        >
          {product.name}
        </h3>
        <p
          className="text-[0.75rem] font-bold"
          style={{ color: "var(--adm-fg)" }}
        >
          ₹{product.price.toLocaleString("en-IN")}
        </p>

        {/* Color swatches */}
        <div className="flex items-center gap-1 flex-wrap">
          {product.variants.map((v, i) => (
            <div
              key={i}
              title={v.colorName}
              className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
              style={{
                background: v.colorHex,
                borderColor: "var(--adm-border)",
              }}
            />
          ))}
        </div>

        <StockBadge stock={product.stock ?? 0} />
      </div>

      {/* Actions */}
      <div
        className="flex border-t"
        style={{ borderColor: "var(--adm-border-soft)" }}
      >
        <button
          onClick={onView}
          className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 py-2.5 text-[0.625rem] font-bold tracking-widest uppercase transition-colors duration-150 border-r"
          style={{
            background: "var(--adm-bg-white)",
            color: "var(--adm-fg-muted)",
            borderColor: "var(--adm-border-soft)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--adm-bg-active)";
            e.currentTarget.style.color = "var(--adm-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--adm-bg-white)";
            e.currentTarget.style.color = "var(--adm-fg-muted)";
          }}
        >
          <Eye size={11} /> View
        </button>
        <button
          onClick={onEdit}
          className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 py-2.5 text-[0.625rem] font-bold tracking-widest uppercase transition-colors duration-150 border-r"
          style={{
            background: "var(--adm-bg-white)",
            color: "var(--adm-fg-muted)",
            borderColor: "var(--adm-border-soft)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--adm-bg-active)";
            e.currentTarget.style.color = "var(--adm-accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--adm-bg-white)";
            e.currentTarget.style.color = "var(--adm-fg-muted)";
          }}
        >
          <Edit3 size={11} /> Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center px-3 py-2.5 cursor-pointer transition-colors duration-150"
          style={{
            background: "var(--adm-bg-white)",
            color: "var(--adm-fg-faint)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--adm-bg-danger-lt)";
            e.currentTarget.style.color = "var(--adm-danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--adm-bg-white)";
            e.currentTarget.style.color = "var(--adm-fg-faint)";
          }}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── View Mode ────────────────────────────────────────────────────────────────

function ProductView({
  product,
  onEdit,
  onBack,
}: {
  product: Product;
  onEdit: () => void;
  onBack: () => void;
}) {
  const [activeVariant, setActiveVariant] = useState(0);
  const variant = product.variants[activeVariant];

  return (
    <div className="max-w-full px-6 py-6">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 mb-5 text-[0.7rem]"
        style={{ color: "var(--adm-fg-muted)" }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 transition-colors duration-150 text-[0.7rem]"
          style={{ color: "var(--adm-fg-muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--adm-accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--adm-fg-muted)")
          }
        >
          <ArrowLeft size={12} /> Products
        </button>
        <span>/</span>
        <span style={{ color: "var(--adm-fg)" }}>{product.name}</span>
      </div>

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-[1.4rem] font-bold"
            style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
          >
            {product.name}
          </h1>
          <p
            className="text-[0.75rem] mt-1"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            /{product.slug}
          </p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-5 py-2.5 text-[0.65rem] font-bold tracking-[0.14em] uppercase flex-shrink-0 transition-colors duration-150 rounded-sm"
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
          <Edit3 size={12} /> Edit Product
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Left */}
        <div className="flex flex-col gap-4">
          {/* Basic Info */}
          <div
            className="rounded-sm p-5"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border-soft)",
            }}
          >
            <p
              className="text-[0.6rem] font-bold tracking-[0.16em] uppercase mb-4"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Basic Information
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: "Category", value: product.category },
                {
                  label: "Price",
                  value: `₹${product.price.toLocaleString("en-IN")}`,
                },
                {
                  label: "Status",
                  value: product.isActive ? "Active" : "Inactive",
                },
                { label: "Total Stock", value: String(product.stock ?? 0) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p
                    className="text-[0.6rem] font-bold tracking-widest uppercase mb-0.5"
                    style={{ color: "var(--adm-fg-faint)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-[0.8125rem] font-semibold"
                    style={{ color: "var(--adm-fg)" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
            {product.description && (
              <div
                className="mt-4 pt-4"
                style={{ borderTop: "1px solid var(--adm-border-soft)" }}
              >
                <p
                  className="text-[0.6rem] font-bold tracking-widest uppercase mb-1.5"
                  style={{ color: "var(--adm-fg-faint)" }}
                >
                  Description
                </p>
                <p
                  className="text-[0.8125rem] leading-relaxed"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* Variants */}
          <div
            className="rounded-sm p-5"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border-soft)",
            }}
          >
            <p
              className="text-[0.6rem] font-bold tracking-[0.16em] uppercase mb-3"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Colour Variants
            </p>
            {/* Swatch picker */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {product.variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setActiveVariant(i)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-[0.6rem] font-semibold rounded-sm transition-all duration-150"
                  style={{
                    background:
                      activeVariant === i
                        ? "var(--adm-bg-active)"
                        : "var(--adm-bg-soft)",
                    border: `1px solid ${activeVariant === i ? "var(--adm-accent-border)" : "var(--adm-border-soft)"}`,
                    color:
                      activeVariant === i
                        ? "var(--adm-accent)"
                        : "var(--adm-fg-muted)",
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                    style={{ background: v.colorHex }}
                  />
                  {v.colorName || `Variant ${i + 1}`}
                </button>
              ))}
            </div>

            {/* Images */}
            {variant?.images?.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {variant.images.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-square overflow-hidden rounded-sm"
                    style={{ border: "1px solid var(--adm-border)" }}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Sizes */}
            {variant?.sizes?.length > 0 && (
              <div>
                <p
                  className="text-[0.6rem] font-bold tracking-widest uppercase mb-2"
                  style={{ color: "var(--adm-fg-faint)" }}
                >
                  Stock by Size — {variant.colorName || "this colour"}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {variant.sizes.map((sz) => (
                    <div
                      key={sz.size}
                      className="flex flex-col items-center gap-1 py-2 px-1 rounded-sm"
                      style={{
                        background:
                          sz.stock === 0
                            ? "var(--adm-bg-danger-lt)"
                            : "var(--adm-bg-soft)",
                        border: `1px solid ${sz.stock === 0 ? "var(--adm-danger-border)" : "var(--adm-border-soft)"}`,
                      }}
                    >
                      <span
                        className="text-[0.55rem] font-bold tracking-widest uppercase"
                        style={{ color: "var(--adm-fg-muted)" }}
                      >
                        {sz.size}
                      </span>
                      <span
                        className="text-[0.875rem] font-bold"
                        style={{
                          color:
                            sz.stock === 0
                              ? "var(--adm-danger)"
                              : "var(--adm-fg)",
                        }}
                      >
                        {sz.stock}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-sm p-4"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border-soft)",
            }}
          >
            <p
              className="text-[0.6rem] font-bold tracking-[0.16em] uppercase mb-3"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Product Status
            </p>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-sm"
              style={{
                background: product.isActive
                  ? "rgba(39,174,96,0.08)"
                  : "var(--adm-bg-danger-lt)",
                border: `1px solid ${product.isActive ? "rgba(39,174,96,0.2)" : "var(--adm-danger-border)"}`,
              }}
            >
              {product.isActive ? (
                <ToggleRight size={14} style={{ color: "#27ae60" }} />
              ) : (
                <ToggleLeft size={14} style={{ color: "var(--adm-danger)" }} />
              )}
              <span
                className="text-[0.75rem] font-semibold"
                style={{
                  color: product.isActive ? "#27ae60" : "var(--adm-danger)",
                }}
              >
                {product.isActive
                  ? "Active — visible to customers"
                  : "Inactive — hidden from store"}
              </span>
            </div>
          </div>

          <div
            className="rounded-sm p-4"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border-soft)",
            }}
          >
            <p
              className="text-[0.6rem] font-bold tracking-[0.16em] uppercase mb-3"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              Stock Summary
            </p>
            <StockBadge stock={product.stock ?? 0} />
            <div className="mt-3 flex flex-col gap-1.5">
              {product.variants.map((v, i) => {
                const total = v.sizes?.reduce((s, sz) => s + sz.stock, 0) ?? 0;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-[0.7rem]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: v.colorHex }}
                      />
                      <span style={{ color: "var(--adm-fg-muted)" }}>
                        {v.colorName || `Variant ${i + 1}`}
                      </span>
                    </div>
                    <span
                      className="font-bold"
                      style={{ color: "var(--adm-fg)" }}
                    >
                      {total}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function ProductForm({
  form,
  setForm,
  editingProduct,
  saving,
  dbCategories,
  onSave,
  onCancel,
  onDelete,
  fileInputRefs,
  handleImageUpload,
  removeImg,
  addVariant,
  removeVariant,
  updateVariant,
  updateVariantSizeStock,
}: {
  form: FormProduct;
  setForm: React.Dispatch<React.SetStateAction<FormProduct>>;
  editingProduct: Product | null;
  saving: boolean;
  dbCategories: string[];
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  fileInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleImageUpload: (vi: number, files: FileList | null) => Promise<void>;
  removeImg: (vi: number, ii: number) => void;
  addVariant: () => void;
  removeVariant: (i: number) => void;
  updateVariant: (
    i: number,
    field: "colorName" | "colorHex",
    value: string,
  ) => void;
  updateVariantSizeStock: (vi: number, si: number, stock: number) => void;
}) {
  const inputCls =
    "w-full px-3.5 py-2.5 text-[0.8125rem] outline-none transition-all duration-150 rounded-sm";

  return (
    <div className="max-w-full px-6 py-6">
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2 mb-5 text-[0.7rem]"
        style={{ color: "var(--adm-fg-muted)" }}
      >
        <button
          onClick={onCancel}
          className="flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 text-[0.7rem] transition-colors duration-150"
          style={{ color: "var(--adm-fg-muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--adm-accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--adm-fg-muted)")
          }
        >
          <ArrowLeft size={12} /> Products
        </button>
        <span>/</span>
        <span style={{ color: "var(--adm-fg)" }}>
          {editingProduct ? "Edit Product" : "Add New Product"}
        </span>
      </div>

      <div className="mb-6">
        <h1
          className="text-[1.4rem] font-bold"
          style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
        >
          {editingProduct ? "Edit Product" : "Add New Product"}
        </h1>
        <p
          className="text-[0.75rem] mt-1"
          style={{ color: "var(--adm-fg-muted)" }}
        >
          {editingProduct
            ? "Update your product details below."
            : "Create a new product for your store"}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-4">
          {/* Basic Information */}
          <div
            className="rounded-sm overflow-hidden"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border-soft)",
            }}
          >
            <div
              className="px-5 py-3 border-b"
              style={{
                background: "var(--adm-bg-soft)",
                borderColor: "var(--adm-border-soft)",
              }}
            >
              <p
                className="text-[0.6rem] font-bold tracking-[0.16em] uppercase"
                style={{ color: "var(--adm-fg)" }}
              >
                Basic Information
              </p>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {/* Product Name */}
              <div>
                <label
                  className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Product Name *
                </label>
                <input
                  className={inputCls}
                  style={{
                    background: "var(--adm-bg-input)",
                    border: "1px solid var(--adm-border)",
                    color: "var(--adm-fg)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--adm-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--adm-border)")
                  }
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. Men's Bamboo Trunk"
                />
              </div>

              {/* SKU + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    SKU *
                  </label>
                  <input
                    className={inputCls}
                    style={{
                      background: "var(--adm-bg-input)",
                      border: "1px solid var(--adm-border)",
                      color: "var(--adm-fg)",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "var(--adm-accent)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "var(--adm-border)")
                    }
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    placeholder="auto-generated"
                  />
                </div>
                <div>
                  <label
                    className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      className={`${inputCls} appearance-none pr-8`}
                      style={{
                        background: "var(--adm-bg-input)",
                        border: "1px solid var(--adm-border)",
                        color: "var(--adm-fg)",
                        cursor: "pointer",
                      }}
                      onFocus={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--adm-accent)")
                      }
                      onBlur={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--adm-border)")
                      }
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                    >
                      <option value="">Select Category</option>
                      {dbCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--adm-fg-muted)" }}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Description
                </label>
                <textarea
                  className={`${inputCls} resize-none leading-relaxed`}
                  style={{
                    background: "var(--adm-bg-input)",
                    border: "1px solid var(--adm-border)",
                    color: "var(--adm-fg)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--adm-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--adm-border)")
                  }
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Describe your product…"
                />
              </div>

              {/* Size / Color / Material row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    Size
                  </label>
                  <div className="relative">
                    <select
                      className={`${inputCls} appearance-none pr-8`}
                      style={{
                        background: "var(--adm-bg-input)",
                        border: "1px solid var(--adm-border)",
                        color: "var(--adm-fg-muted)",
                        cursor: "pointer",
                      }}
                      defaultValue=""
                    >
                      <option value="">Select Size</option>
                      {DEFAULT_SIZES.map((s) => (
                        <option key={s.size} value={s.size}>
                          {s.size}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={12}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--adm-fg-muted)" }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    Color
                  </label>
                  <input
                    className={inputCls}
                    style={{
                      background: "var(--adm-bg-input)",
                      border: "1px solid var(--adm-border)",
                      color: "var(--adm-fg-muted)",
                    }}
                    type="text"
                    placeholder="e.g., Black, White"
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
                    className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    Material
                  </label>
                  <input
                    className={inputCls}
                    style={{
                      background: "var(--adm-bg-input)",
                      border: "1px solid var(--adm-border)",
                      color: "var(--adm-fg-muted)",
                    }}
                    type="text"
                    placeholder="e.g., Cotton, Silk"
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "var(--adm-accent)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "var(--adm-border)")
                    }
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label
                  className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Tags
                </label>
                <input
                  className={inputCls}
                  style={{
                    background: "var(--adm-bg-input)",
                    border: "1px solid var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                  }}
                  type="text"
                  placeholder="comma separated tags"
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--adm-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--adm-border)")
                  }
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div
            className="rounded-sm overflow-hidden"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border-soft)",
            }}
          >
            <div
              className="px-5 py-3 border-b"
              style={{
                background: "var(--adm-bg-soft)",
                borderColor: "var(--adm-border-soft)",
              }}
            >
              <p
                className="text-[0.6rem] font-bold tracking-[0.16em] uppercase"
                style={{ color: "var(--adm-fg)" }}
              >
                Pricing
              </p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Price *", key: "price", placeholder: "₹0.00" },
                  {
                    label: "Compare at Price *",
                    key: "comparePrice",
                    placeholder: "₹0.00",
                  },
                  {
                    label: "Cost per item",
                    key: "costPerItem",
                    placeholder: "₹0.00",
                  },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label
                      className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      {label}
                    </label>
                    <div className="relative">
                      <span
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.8125rem] font-bold"
                        style={{ color: "var(--adm-fg-faint)" }}
                      >
                        ₹
                      </span>
                      <input
                        className={`${inputCls} pl-7`}
                        style={{
                          background: "var(--adm-bg-input)",
                          border: "1px solid var(--adm-border)",
                          color: "var(--adm-fg)",
                        }}
                        onFocus={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--adm-accent)")
                        }
                        onBlur={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--adm-border)")
                        }
                        type="number"
                        min={0}
                        defaultValue={""}
                        value={key === "price" ? form.price || "" : ""}
                        placeholder="0.00"
                        onChange={
                          key === "price"
                            ? (e) =>
                                setForm((f) => ({
                                  ...f,
                                  price: Number(e.target.value),
                                }))
                            : undefined
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory (Stock per size/colour) */}
          <div
            className="rounded-sm overflow-hidden"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border-soft)",
            }}
          >
            <div
              className="px-5 py-3 border-b flex items-center justify-between"
              style={{
                background: "var(--adm-bg-soft)",
                borderColor: "var(--adm-border-soft)",
              }}
            >
              <p
                className="text-[0.6rem] font-bold tracking-[0.16em] uppercase"
                style={{ color: "var(--adm-fg)" }}
              >
                Inventory
              </p>
              <button
                onClick={addVariant}
                className="flex items-center gap-1 px-3 py-1 text-[0.6rem] font-bold tracking-widest uppercase rounded-sm transition-colors duration-150"
                style={{
                  background: "var(--adm-bg-accent-lt)",
                  border: "1px solid var(--adm-accent-border)",
                  color: "var(--adm-accent)",
                  cursor: "pointer",
                }}
              >
                <Plus size={9} /> Add Colour
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {/* Stock qty + low stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    Stock Quantity *
                  </label>
                  <input
                    className={inputCls}
                    style={{
                      background: "var(--adm-bg-input)",
                      border: "1px solid var(--adm-border)",
                      color: "var(--adm-fg)",
                    }}
                    type="number"
                    min={0}
                    value={form.stock || ""}
                    placeholder="0"
                    readOnly
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
                    className="block text-[0.6rem] font-bold tracking-[0.12em] uppercase mb-1.5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    Low Stock Threshold
                  </label>
                  <input
                    className={inputCls}
                    style={{
                      background: "var(--adm-bg-input)",
                      border: "1px solid var(--adm-border)",
                      color: "var(--adm-fg-muted)",
                    }}
                    type="number"
                    min={0}
                    defaultValue={10}
                    placeholder="10"
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "var(--adm-accent)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "var(--adm-border)")
                    }
                  />
                </div>
              </div>

              {/* Per-variant size stock */}
              {form.variants.map((variant, vi) => (
                <div
                  key={vi}
                  className="overflow-hidden rounded-sm"
                  style={{ border: "1px solid var(--adm-border)" }}
                >
                  {/* Variant header */}
                  <div
                    className="flex items-center gap-2.5 px-4 py-2.5 border-b"
                    style={{
                      background: "var(--adm-bg-soft)",
                      borderColor: "var(--adm-border-soft)",
                    }}
                  >
                    <input
                      type="color"
                      value={variant.colorHex}
                      onChange={(e) =>
                        updateVariant(vi, "colorHex", e.target.value)
                      }
                      className="w-7 h-7 rounded-sm cursor-pointer border-2 p-0 flex-shrink-0"
                      style={{ borderColor: "var(--adm-border)" }}
                    />
                    <input
                      type="text"
                      className="flex-1 bg-transparent border-none outline-none text-[0.8125rem] font-semibold"
                      style={{ color: "var(--adm-fg)" }}
                      value={variant.colorName}
                      onChange={(e) =>
                        updateVariant(vi, "colorName", e.target.value)
                      }
                      placeholder="Colour name (e.g. Black)"
                    />
                    {form.variants.length > 1 && (
                      <button
                        onClick={() => removeVariant(vi)}
                        className="w-5 h-5 flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors duration-150"
                        style={{ color: "var(--adm-fg-faint)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--adm-danger)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--adm-fg-faint)")
                        }
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Sizes */}
                  <div className="p-4">
                    <p
                      className="text-[0.55rem] font-bold tracking-[0.16em] uppercase mb-2.5"
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      Sizes & Stock
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {(variant.sizes?.length
                        ? variant.sizes
                        : DEFAULT_SIZES
                      ).map((sz, si) => (
                        <div key={sz.size} className="flex flex-col gap-1">
                          <label
                            className="text-[0.55rem] font-bold tracking-widest uppercase text-center"
                            style={{ color: "var(--adm-fg-muted)" }}
                          >
                            {sz.size === "Extra Large"
                              ? "XL"
                              : sz.size === "Small"
                                ? "S"
                                : sz.size === "Medium"
                                  ? "M"
                                  : sz.size === "Large"
                                    ? "L"
                                    : "XXL"}
                          </label>
                          <input
                            type="number"
                            min={0}
                            className="w-full py-1.5 text-center text-[0.8125rem] font-semibold outline-none transition-colors rounded-sm"
                            style={{
                              border: "1px solid var(--adm-border)",
                              background: "var(--adm-bg-white)",
                              color: "var(--adm-fg)",
                            }}
                            onFocus={(e) =>
                              (e.currentTarget.style.borderColor =
                                "var(--adm-accent)")
                            }
                            onBlur={(e) =>
                              (e.currentTarget.style.borderColor =
                                "var(--adm-border)")
                            }
                            value={sz.stock === 0 ? "" : sz.stock}
                            placeholder="0"
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              updateVariantSizeStock(
                                vi,
                                si,
                                isNaN(val) || val < 0 ? 0 : val,
                              );
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-4">
          {/* Variant Images (per colour) */}
          {form.variants.map((variant, vi) => (
            <div
              key={vi}
              className="rounded-sm overflow-hidden"
              style={{
                background: "var(--adm-bg-white)",
                border: "1px solid var(--adm-border-soft)",
              }}
            >
              <div
                className="px-4 py-3 border-b"
                style={{
                  background: "var(--adm-bg-soft)",
                  borderColor: "var(--adm-border-soft)",
                }}
              >
                <p
                  className="text-[0.6rem] font-bold tracking-[0.16em] uppercase"
                  style={{ color: "var(--adm-fg)" }}
                >
                  {variant.colorName
                    ? `${variant.colorName} Images`
                    : `Variant ${vi + 1} Images`}
                </p>
              </div>
              <div className="p-4">
                {/* Existing images */}
                {variant.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {variant.images.map((img, ii) =>
                      img ? (
                        <div
                          key={ii}
                          className="relative aspect-square overflow-hidden rounded-sm group"
                          style={{ border: "1px solid var(--adm-border)" }}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeImg(vi, ii)}
                            className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                            style={{
                              background: "rgba(192,57,43,0.9)",
                              color: "#fff",
                            }}
                          >
                            <X size={9} />
                          </button>
                        </div>
                      ) : null,
                    )}
                  </div>
                )}

                {/* Upload zone */}
                <div
                  className="flex flex-col items-center justify-center gap-2 py-8 px-3 border-2 border-dashed cursor-pointer transition-all duration-200 rounded-sm"
                  style={{ borderColor: "var(--adm-border)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-accent)";
                    e.currentTarget.style.background = "var(--adm-bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--adm-border)";
                    e.currentTarget.style.background = "transparent";
                  }}
                  onClick={() => fileInputRefs.current[vi]?.click()}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-sm"
                    style={{
                      background: "var(--adm-bg-accent-lt)",
                      border: "1px solid var(--adm-accent-border)",
                      color: "var(--adm-accent)",
                    }}
                  >
                    <Upload size={16} />
                  </div>
                  <p
                    className="text-[0.7rem] font-semibold text-center"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    Click to Upload images
                  </p>
                  <p
                    className="text-[0.6rem]"
                    style={{ color: "var(--adm-fg-faint)" }}
                  >
                    PNG, JPG up to 5MB each
                  </p>
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

          {/* Product Status */}
          <div
            className="rounded-sm overflow-hidden"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border-soft)",
            }}
          >
            <div
              className="px-4 py-3 border-b"
              style={{
                background: "var(--adm-bg-soft)",
                borderColor: "var(--adm-border-soft)",
              }}
            >
              <p
                className="text-[0.6rem] font-bold tracking-[0.16em] uppercase"
                style={{ color: "var(--adm-fg)" }}
              >
                Product Status
              </p>
            </div>
            <div className="p-4">
              <div className="relative">
                <select
                  className="w-full px-3.5 py-2.5 text-[0.8125rem] outline-none appearance-none rounded-sm pr-8"
                  style={{
                    background: "var(--adm-bg-input)",
                    border: "1px solid var(--adm-border)",
                    color: "var(--adm-fg)",
                    cursor: "pointer",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = "var(--adm-accent)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "var(--adm-border)")
                  }
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      isActive: e.target.value === "active",
                    }))
                  }
                >
                  <option value="active" className="cursor-pointer">
                    Active
                  </option>
                  <option value="inactive" className="cursor-pointer">
                    Inactive
                  </option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--adm-fg-muted)" }}
                />
              </div>
            </div>
          </div>

          {/* Save / Cancel */}
          <div
            className="rounded-sm p-4 flex flex-col gap-2.5"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border-soft)",
            }}
          >
            {editingProduct && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer text-[0.6rem] font-bold tracking-widest uppercase mb-1 p-0 transition-opacity duration-150 hover:opacity-70"
                style={{ color: "var(--adm-danger)" }}
              >
                <Trash2 size={10} /> Delete this product
              </button>
            )}
            <button
              onClick={onSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 text-[0.7rem] font-bold tracking-[0.14em] uppercase rounded-sm transition-colors duration-150"
              style={{
                background: "var(--adm-accent)",
                color: "#fff",
                border: "none",
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!saving)
                  e.currentTarget.style.background = "var(--adm-accent-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--adm-accent)";
              }}
            >
              {saving
                ? "Saving…"
                : editingProduct
                  ? "Update Product"
                  : "Add Product"}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2.5 text-[0.7rem] font-bold tracking-[0.14em] uppercase rounded-sm transition-colors duration-150"
              style={{
                background: "transparent",
                border: "1px solid var(--adm-border)",
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
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageView, setPageView] = useState<PageView>("list");
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormProduct>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [activeProducts, setActiveProducts] = useState<Record<string, boolean>>(
    {},
  );
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>(null);
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Auto-slug from name
  useEffect(() => {
    setForm((f) => ({
      ...f,
      slug: f.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  }, [form.name]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/category");
      if (res.ok) {
        const d = await res.json();
        setDbCategories(
          (d.categories || []).map((c: { name: string }) => c.name),
        );
      }
    } catch {}
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const d = await res.json();
        const list: Product[] = d.products || [];
        setProducts(list);
        const map: Record<string, boolean> = {};
        list.forEach((p) => {
          map[p._id!] = p.isActive !== false;
        });
        setActiveProducts(map);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Filtered + searched products
  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // ── Navigation helpers ────────────────────────────────────────────────────

  const openView = useCallback((p: Product) => {
    setViewingProduct(p);
    setEditingProduct(null);
    setPageView("view");
  }, []);

  const openEdit = useCallback((p: Product) => {
    setEditingProduct(p);
    setViewingProduct(null);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      category: p.category,
      stock: p.stock ?? 0,
      variants: p.variants.map((v) => ({
        ...v,
        images: v.images.filter(Boolean),
        imageFiles: [],
        sizes: v.sizes?.length ? v.sizes : [...DEFAULT_SIZES],
      })),
      isActive: p.isActive,
    });
    setPageView("form");
  }, []);

  const openAdd = useCallback(() => {
    setEditingProduct(null);
    setViewingProduct(null);
    setForm(EMPTY_FORM);
    setPageView("form");
  }, []);

  const goBack = useCallback(() => {
    setPageView("list");
    setEditingProduct(null);
    setViewingProduct(null);
  }, []);

  // ── Stock helpers ─────────────────────────────────────────────────────────

  const updateVariantSizeStock = useCallback(
    (vi: number, si: number, stock: number) => {
      setForm((f) => {
        const v = [...f.variants];
        const newSizes = [...(v[vi].sizes || DEFAULT_SIZES)];
        newSizes[si] = { ...newSizes[si], stock };
        v[vi] = { ...v[vi], sizes: newSizes };
        const totalStock = v.reduce(
          (acc, curr) =>
            acc + (curr.sizes?.reduce((s, sz) => s + sz.stock, 0) || 0),
          0,
        );
        return { ...f, variants: v, stock: totalStock };
      });
    },
    [],
  );

  // ── Variant helpers ───────────────────────────────────────────────────────

  const addVariant = useCallback(
    () =>
      setForm((f) => ({
        ...f,
        variants: [
          ...f.variants,
          {
            colorName: "",
            colorHex: "#19635e",
            images: [],
            imageFiles: [],
            sizes: [...DEFAULT_SIZES],
          },
        ],
      })),
    [],
  );

  const removeVariant = useCallback(
    (i: number) =>
      setForm((f) => ({
        ...f,
        variants: f.variants.filter((_, idx) => idx !== i),
      })),
    [],
  );

  const updateVariant = useCallback(
    (i: number, field: "colorName" | "colorHex", value: string) =>
      setForm((f) => {
        const v = [...f.variants];
        v[i] = { ...v[i], [field]: value };
        return { ...f, variants: v };
      }),
    [],
  );

  // ── Image helpers ─────────────────────────────────────────────────────────

  const handleImageUpload = useCallback(
    async (vi: number, files: FileList | null) => {
      if (!files) return;
      const arr = Array.from(files);
      const previews = arr.map((f) => URL.createObjectURL(f));
      setForm((f) => {
        const v = [...f.variants];
        v[vi] = {
          ...v[vi],
          images: [...v[vi].images, ...previews],
          imageFiles: [...(v[vi].imageFiles || []), ...arr],
        };
        return { ...f, variants: v };
      });
      try {
        const urls = await Promise.all(
          arr.map(async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/admin/upload", {
              method: "POST",
              body: fd,
            });
            if (!res.ok) throw new Error("Upload failed");
            return (await res.json()).url as string;
          }),
        );
        setForm((f) => {
          const v = [...f.variants];
          if (!v[vi]) return f;
          const existing = v[vi].images.filter(
            (img) => !img.startsWith("blob:"),
          );
          v[vi].images
            .filter((img) => img.startsWith("blob:"))
            .forEach((u) => URL.revokeObjectURL(u));
          v[vi] = { ...v[vi], images: [...existing, ...urls], imageFiles: [] };
          return { ...f, variants: v };
        });
        setToast({ type: "success", msg: `${arr.length} image(s) uploaded.` });
      } catch {
        setForm((f) => {
          const v = [...f.variants];
          if (!v[vi]) return f;
          v[vi] = {
            ...v[vi],
            images: v[vi].images.filter((img) => !img.startsWith("blob:")),
            imageFiles: [],
          };
          return { ...f, variants: v };
        });
        previews.forEach((u) => URL.revokeObjectURL(u));
        setToast({ type: "error", msg: "Image upload failed." });
      }
    },
    [],
  );

  const removeImg = useCallback(
    (vi: number, ii: number) =>
      setForm((f) => {
        const v = [...f.variants];
        if (!v[vi]) return f;
        const removed = v[vi].images[ii];
        if (removed?.startsWith("blob:")) URL.revokeObjectURL(removed);
        v[vi] = {
          ...v[vi],
          images: v[vi].images.filter((_, idx) => idx !== ii),
          imageFiles: [],
        };
        return { ...f, variants: v };
      }),
    [],
  );

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!form.name || !form.category || form.price <= 0) {
      setToast({
        type: "error",
        msg: "Name, category and price are required.",
      });
      return;
    }
    if (
      form.variants.some((v) => v.images.some((img) => img.startsWith("blob:")))
    ) {
      setToast({ type: "error", msg: "Images still uploading. Please wait." });
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
        goBack();
      } else {
        const d = await res.json();
        setToast({ type: "error", msg: d.error || "Failed to save." });
      }
    } catch {
      setToast({ type: "error", msg: "Network error." });
    }
    setSaving(false);
  }, [form, editingProduct, fetchProducts, goBack]);

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/admin/inventory?id=${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setToast({ type: "success", msg: "Product deleted." });
          fetchProducts();
          if (editingProduct?._id === id || viewingProduct?._id === id)
            goBack();
        }
      } catch {}
    },
    [editingProduct, viewingProduct, fetchProducts, goBack],
  );

  // ── Toggle active ─────────────────────────────────────────────────────────

  const toggleActive = useCallback(
    async (id: string) => {
      const newVal = !activeProducts[id];
      setActiveProducts((prev) => ({ ...prev, [id]: newVal }));
      try {
        await fetch(`/api/admin/inventory?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: newVal }),
        });
      } catch {
        setActiveProducts((prev) => ({ ...prev, [id]: !newVal }));
        setToast({ type: "error", msg: "Failed to update status." });
      }
    },
    [activeProducts],
  );

  const handleConfirmAction = useCallback(() => {
    if (!confirmDialog) return;
    if (confirmDialog.type === "delete") handleDelete(confirmDialog.productId);
    else toggleActive(confirmDialog.productId);
    setConfirmDialog(null);
  }, [confirmDialog, handleDelete, toggleActive]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-enter { animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .card-enter:nth-child(1) { animation-delay: 0.03s; }
        .card-enter:nth-child(2) { animation-delay: 0.07s; }
        .card-enter:nth-child(3) { animation-delay: 0.11s; }
        .card-enter:nth-child(4) { animation-delay: 0.15s; }
        .card-enter:nth-child(5) { animation-delay: 0.18s; }
        .card-enter:nth-child(n+6) { animation-delay: 0.21s; }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .toast-enter { animation: toastIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes admFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes admModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .adm-backdrop { animation: admFadeIn 0.2s ease both; }
        .adm-modal    { animation: admModalIn 0.25s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      <div
        className="min-h-screen"
        style={{ fontFamily: "var(--nav-font-ui)", color: "var(--adm-fg)" }}
      >
        {/* ══ LIST VIEW ══ */}
        {pageView === "list" && (
          <div>
            {/* Page header */}
            <div
              className="flex items-center justify-between px-6 py-5 border-b"
              style={{
                background: "var(--adm-bg-white)",
                borderColor: "var(--adm-border-soft)",
              }}
            >
              <div>
                <h1
                  className="text-[1.25rem] font-bold"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--adm-fg)",
                  }}
                >
                  Products
                </h1>
                <p
                  className="text-[0.75rem] mt-0.5"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  Manage your product inventory
                </p>
              </div>
              <button
                onClick={openAdd}
                className="flex items-center gap-2 px-5 py-2.5 text-[0.7rem] font-bold tracking-[0.12em] uppercase rounded-sm transition-colors duration-150"
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
                <Plus size={13} /> Add Products
              </button>
            </div>

            {/* Search + Filters */}
            <div
              className="flex flex-wrap items-center gap-3 px-6 py-4 border-b"
              style={{
                background: "var(--adm-bg-white)",
                borderColor: "var(--adm-border-soft)",
              }}
            >
              {/* Search */}
              <div
                className="flex items-center gap-2 flex-1 min-w-[200px] px-3.5 py-2 rounded-sm"
                style={{
                  background: "var(--adm-bg-input)",
                  border: "1px solid var(--adm-border)",
                }}
              >
                <Search
                  size={13}
                  style={{ color: "var(--adm-fg-faint)", flexShrink: 0 }}
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search Product By Name......"
                  className="flex-1 bg-transparent border-none outline-none text-[0.8125rem]"
                  style={{ color: "var(--adm-fg)" }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="bg-transparent border-none cursor-pointer p-0"
                    style={{ color: "var(--adm-fg-faint)" }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category filter */}
              <div className="relative">
                <select
                  className="pl-3 pr-8 py-2 text-[0.75rem] font-semibold appearance-none rounded-sm cursor-pointer"
                  style={{
                    background: "var(--adm-bg-white)",
                    border: "1px solid var(--adm-border)",
                    color: "var(--adm-fg-muted)",
                  }}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {dbCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--adm-fg-muted)" }}
                />
              </div>

              {/* Filters placeholder */}
              <button
                className="flex items-center gap-2 px-4 py-2 text-[0.75rem] font-semibold rounded-sm transition-colors duration-150"
                style={{
                  background: "var(--adm-bg-white)",
                  border: "1px solid var(--adm-border)",
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
                <Search size={12} /> Filters
              </button>
            </div>

            {/* Cards grid */}
            <div className="px-6 py-6">
              {loading ? (
                <div
                  className="flex items-center justify-center gap-2.5 py-20 text-[0.8125rem]"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  <Loader2 size={18} className="animate-spin" /> Loading
                  inventory…
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p
                    className="text-[0.9rem] font-bold mb-1.5"
                    style={{
                      fontFamily: "var(--nav-font)",
                      color: "var(--adm-fg)",
                    }}
                  >
                    {search ? `No results for "${search}"` : "No products yet"}
                  </p>
                  <p
                    className="text-[0.8125rem] mb-5"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    {search
                      ? "Try a different search term."
                      : "Add your first product to get started."}
                  </p>
                  {!search && (
                    <button
                      onClick={openAdd}
                      className="flex items-center gap-2 px-5 py-2.5 text-[0.7rem] font-bold tracking-[0.12em] uppercase rounded-sm"
                      style={{
                        background: "var(--adm-accent)",
                        color: "#fff",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Plus size={12} /> Add Product
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredProducts.map((p) => (
                    <div key={p._id} className="card-enter">
                      <ProductCard
                        product={p}
                        isActive={activeProducts[p._id!] !== false}
                        onView={() => openView(p)}
                        onEdit={() => openEdit(p)}
                        onDelete={() =>
                          setConfirmDialog({
                            type: "delete",
                            productId: p._id!,
                            productName: p.name,
                          })
                        }
                        onToggle={() =>
                          setConfirmDialog({
                            type: "toggle",
                            productId: p._id!,
                            productName: p.name,
                            currentActive: activeProducts[p._id!] !== false,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ VIEW MODE ══ */}
        {pageView === "view" && viewingProduct && (
          <ProductView
            product={viewingProduct}
            onEdit={() => openEdit(viewingProduct)}
            onBack={goBack}
          />
        )}

        {/* ══ FORM VIEW ══ */}
        {pageView === "form" && (
          <ProductForm
            form={form}
            setForm={setForm}
            editingProduct={editingProduct}
            saving={saving}
            dbCategories={dbCategories}
            onSave={handleSave}
            onCancel={goBack}
            onDelete={() =>
              editingProduct &&
              setConfirmDialog({
                type: "delete",
                productId: editingProduct._id!,
                productName: editingProduct.name,
              })
            }
            fileInputRefs={fileInputRefs}
            handleImageUpload={handleImageUpload}
            removeImg={removeImg}
            addVariant={addVariant}
            removeVariant={removeVariant}
            updateVariant={updateVariant}
            updateVariantSizeStock={updateVariantSizeStock}
          />
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          className="toast-enter fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-sm"
          style={{
            background: "var(--adm-bg-white)",
            border: `1px solid ${toast.type === "success" ? "var(--adm-accent)" : "var(--adm-danger)"}`,
            boxShadow: "var(--adm-shadow-toast)",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2
              size={15}
              style={{ color: "var(--adm-accent)", flexShrink: 0 }}
            />
          ) : (
            <AlertCircle
              size={15}
              style={{ color: "var(--adm-danger)", flexShrink: 0 }}
            />
          )}
          <span
            className="text-[0.8125rem] font-semibold"
            style={{ color: "var(--adm-fg)" }}
          >
            {toast.msg}
          </span>
        </div>
      )}

      {/* ── Confirm Dialog ── */}
      {confirmDialog && (
        <div
          className="adm-backdrop fixed inset-0 z-50 flex items-center justify-center p-5"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <div
            className="adm-modal p-7 w-full max-w-sm rounded-sm"
            style={{
              background: "var(--adm-bg-white)",
              border: "1px solid var(--adm-border)",
              boxShadow: "var(--adm-shadow-modal)",
            }}
          >
            <h3
              className="text-[1rem] font-bold mb-2"
              style={{ fontFamily: "var(--nav-font)", color: "var(--adm-fg)" }}
            >
              {confirmDialog.type === "delete"
                ? "Delete Product?"
                : confirmDialog.currentActive
                  ? "Deactivate?"
                  : "Activate?"}
            </h3>
            <p
              className="text-[0.8125rem] leading-relaxed mb-5"
              style={{ color: "var(--adm-fg-muted)" }}
            >
              {confirmDialog.type === "delete"
                ? `Permanently delete "${confirmDialog.productName}"? This cannot be undone.`
                : `${confirmDialog.currentActive ? "Deactivate" : "Activate"} "${confirmDialog.productName}"?`}
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 text-[0.7rem] font-bold tracking-widest uppercase rounded-sm transition-colors duration-150"
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
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-[1.5] py-2.5 border-none text-[0.7rem] font-bold tracking-widest uppercase text-white rounded-sm cursor-pointer transition-opacity duration-150 hover:opacity-90"
                style={{
                  background:
                    confirmDialog.type === "delete"
                      ? "var(--adm-danger)"
                      : "var(--adm-accent)",
                }}
              >
                {confirmDialog.type === "delete"
                  ? "Yes, Delete"
                  : confirmDialog.currentActive
                    ? "Deactivate"
                    : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
