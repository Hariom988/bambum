"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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
  LogOut,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Upload,
  LayoutGrid,
  ArrowLeft,
  SlidersHorizontal,
  Boxes,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import CategoryManager from "./categoryManager";

// ─── Types

interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
  imageFiles?: File[];
}

interface Product {
  isActive: boolean;
  _id?: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  variants: ProductVariant[];
  stock: number; // ← new field, stored in same products document
  createdAt?: string;
}

type FormProduct = Omit<Product, "_id" | "createdAt">;

type ConfirmDialog = {
  type: "delete" | "toggle";
  productId: string;
  productName: string;
  currentActive?: boolean;
} | null;

type View = "products" | "add" | "categories";

// ─── Constants ───────────────────────────────────────────────────────────────

const EMPTY_PRODUCT: FormProduct = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  category: "",
  stock: 0, // ← default
  variants: [
    { colorName: "", colorHex: "#c8a97e", images: [], imageFiles: [] },
  ],
  isActive: true,
};

// ─── Stock badge helper ───────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 font-sans text-[9px] font-bold tracking-widest uppercase"
        style={{
          background: "rgba(192,57,43,0.1)",
          border: "1px solid rgba(192,57,43,0.25)",
          color: "#c0392b",
        }}
      >
        <AlertTriangle size={9} /> Out of Stock
      </span>
    );
  }
  if (stock <= 10) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 font-sans text-[9px] font-bold tracking-widest uppercase"
        style={{
          background: "rgba(230,126,34,0.1)",
          border: "1px solid rgba(230,126,34,0.25)",
          color: "#e67e22",
        }}
      >
        <TrendingDown size={9} /> Low: {stock}
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 font-sans text-[9px] font-bold tracking-widest uppercase"
      style={{
        background: "rgba(39,174,96,0.08)",
        border: "1px solid rgba(39,174,96,0.2)",
        color: "#27ae60",
      }}
    >
      <Boxes size={9} /> {stock} in stock
    </span>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const FormSection = ({
  title,
  children,
  headerRight,
}: {
  title: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}) => (
  <div className="adm-card mb-4 overflow-hidden">
    <div
      className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-b"
      style={{
        background: "var(--adm-bg-soft)",
        borderColor: "var(--adm-border-soft)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <span
          className="font-sans text-[10px] font-bold tracking-[0.14em] uppercase"
          style={{ color: "var(--adm-fg)" }}
        >
          {title}
        </span>
      </div>
      {headerRight}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label
    className="block font-sans text-[10px] font-bold tracking-[0.12em] uppercase mb-1.5"
    style={{ color: "var(--adm-fg-muted)" }}
  >
    {children}
  </label>
);

const inputCls =
  "w-full px-3.5 py-2.5 border font-sans text-[13px] outline-none transition-all duration-150 adm-input";

// ─── ProductRow (desktop) ─────────────────────────────────────────────────────

const ProductRow = ({
  product,
  onEdit,
  activeProducts,
  setConfirmDialog,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  activeProducts: Record<string, boolean>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<ConfirmDialog>>;
}) => {
  const isActive = activeProducts[product._id!] !== false;
  const firstImage = product.variants[0]?.images[0];
  const stock = product.stock ?? 0;

  return (
    <div
      className="adm-table-row grid gap-3 px-4 py-3 items-center border-b"
      style={{
        // Added stock column (110px) after price
        gridTemplateColumns: "60px 1fr 120px 100px 70px 110px 60px 100px 60px",
        borderColor: "var(--adm-border-soft)",
      }}
    >
      <div
        className="w-12 h-14 border overflow-hidden shrink-0"
        style={{
          borderColor: "var(--adm-border)",
          background: "var(--adm-bg-input)",
        }}
      >
        {firstImage && (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div>
        <div
          className="font-bold text-[13px]"
          style={{ color: "var(--adm-fg)" }}
        >
          {product.name}
        </div>
        <div
          className="font-sans text-[10px] mt-0.5"
          style={{ color: "var(--adm-fg-muted)" }}
        >
          /{product.slug}
        </div>
      </div>
      <div
        className="font-sans text-[11px] font-semibold tracking-wide"
        style={{ color: "var(--adm-fg-muted)" }}
      >
        {product.category}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {product.variants.map((v, i) => (
          <div
            key={i}
            title={v.colorName}
            className="w-4 h-4 rounded-full border-2 shrink-0"
            style={{ background: v.colorHex, borderColor: "var(--adm-border)" }}
          />
        ))}
      </div>
      <div className="font-bold text-[13px]" style={{ color: "var(--adm-fg)" }}>
        ₹{product.price}
      </div>
      {/* ── Stock cell ── */}
      <div>
        <StockBadge stock={stock} />
      </div>
      <button
        className="adm-btn-ghost flex items-center justify-center gap-1.5 px-2.5 py-1.5"
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
        className="adm-toggle-btn flex items-center gap-1.5 px-2.5 py-1.5 whitespace-nowrap"
        data-active={isActive}
      >
        <div
          className="adm-toggle-track w-7 h-3.5 rounded-full relative shrink-0"
          data-active={isActive}
        >
          <div
            className="adm-toggle-thumb absolute top-0.5 rounded-full w-2.5 h-2.5 bg-white"
            data-active={isActive}
          />
        </div>
        {isActive ? "Active" : "Inactive"}
      </button>
      <button
        className="adm-btn-danger flex items-center justify-center p-1.5"
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

// ─── MobileProductCard ────────────────────────────────────────────────────────

const MobileProductCard = ({
  product,
  onEdit,
  activeProducts,
  setConfirmDialog,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  activeProducts: Record<string, boolean>;
  setConfirmDialog: React.Dispatch<React.SetStateAction<ConfirmDialog>>;
}) => {
  const isActive = activeProducts[product._id!] !== false;
  const firstImage = product.variants[0]?.images[0];
  const stock = product.stock ?? 0;

  return (
    <div className="adm-card overflow-hidden adm-card-enter">
      <div
        className="h-0.5 opacity-40"
        style={{ background: "var(--adm-accent)" }}
      />
      <div className="flex gap-3 p-3">
        <div
          className="w-16 h-20 shrink-0 border overflow-hidden"
          style={{
            borderColor: "var(--adm-border)",
            background: "var(--adm-bg-input)",
          }}
        >
          {firstImage ? (
            <img
              src={firstImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package
                size={18}
                style={{ color: "var(--adm-accent)", opacity: 0.5 }}
              />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-serif font-bold text-sm leading-tight"
            style={{ color: "var(--adm-fg)" }}
          >
            {product.name}
          </div>
          <div
            className="font-sans text-[9px] font-bold tracking-[0.14em] uppercase mt-0.5"
            style={{ color: "var(--adm-accent)" }}
          >
            {product.category}
          </div>
          <div
            className="font-sans text-[10px] mt-0.5"
            style={{ color: "var(--adm-fg-muted)" }}
          >
            /{product.slug}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {product.variants.map((v, i) => (
              <div
                key={i}
                title={v.colorName}
                className="w-3.5 h-3.5 rounded-full border-2"
                style={{
                  background: v.colorHex,
                  borderColor: "var(--adm-border)",
                }}
              />
            ))}
          </div>
          {/* Stock badge on mobile */}
          <div className="mt-1.5">
            <StockBadge stock={stock} />
          </div>
        </div>
        <div className="flex flex-col items-end justify-between shrink-0">
          <div
            className="font-serif font-bold text-base"
            style={{ color: "var(--adm-fg)" }}
          >
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
            className="adm-toggle-btn flex items-center gap-1 px-2 py-1"
            data-active={isActive}
          >
            <div
              className="adm-toggle-track w-5 h-2.5 rounded-full relative shrink-0"
              data-active={isActive}
            >
              <div
                className="adm-toggle-thumb absolute top-0.5 rounded-full w-1.5 h-1.5 bg-white"
                data-active={isActive}
              />
            </div>
            {isActive ? "Live" : "Off"}
          </button>
        </div>
      </div>
      <div
        className="flex border-t"
        style={{ borderColor: "var(--adm-border-soft)" }}
      >
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 font-sans text-[10px] font-bold tracking-widest uppercase border-r adm-btn-row"
          style={{ borderColor: "var(--adm-border-soft)" }}
          onClick={() => onEdit(product)}
        >
          <Edit3 size={11} /> Edit Product
        </button>
        <button
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 font-sans text-[10px] font-bold tracking-widest uppercase adm-btn-danger-ghost"
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormProduct>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [time, setTime] = useState("");
  const [activeProducts, setActiveProducts] = useState<Record<string, boolean>>(
    {},
  );
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] =
    useState<string>("all");

  const fetchDbCategories = useCallback(async () => {
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

  useEffect(() => {
    fetchDbCategories();
  }, [fetchDbCategories]);

  const filteredProducts =
    activeCategoryFilter === "all"
      ? products
      : products.filter((p) => p.category === activeCategoryFilter);

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

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      slug: f.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  }, [form.name]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const d = await res.json();
        const list: Product[] = d.products || [];
        setProducts(list);
        const activeMap: Record<string, boolean> = {};
        list.forEach((p) => {
          activeMap[p._id!] = p.isActive !== false;
        });
        setActiveProducts(activeMap);
      }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAdd = useCallback(() => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setView("add");
  }, []);

  const openEdit = useCallback((p: Product) => {
    setEditingProduct(p);
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
      })),
      isActive: p.isActive,
    });
    setView("add");
  }, []);

  const cancel = useCallback(() => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setView("products");
  }, []);

  const addVariant = useCallback(
    () =>
      setForm((f) => ({
        ...f,
        variants: [
          ...f.variants,
          { colorName: "", colorHex: "#c8a97e", images: [], imageFiles: [] },
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

      const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        return data.url;
      };

      try {
        const cloudinaryUrls = await Promise.all(
          arr.map((file) => uploadFile(file)),
        );
        setForm((f) => {
          const v = [...f.variants];
          if (!v[vi]) return f;
          const existingImages = (v[vi].images || []).filter(
            (img) => !img.startsWith("blob:"),
          );
          const blobImages = (v[vi].images || []).filter((img) =>
            img.startsWith("blob:"),
          );
          blobImages.forEach((url) => URL.revokeObjectURL(url));
          v[vi] = {
            ...v[vi],
            images: [...existingImages, ...cloudinaryUrls],
            imageFiles: [],
          };
          return { ...f, variants: v };
        });
        setToast({
          type: "success",
          msg: `${arr.length} image(s) uploaded successfully.`,
        });
      } catch {
        setForm((f) => {
          const v = [...f.variants];
          if (!v[vi]) return f;
          v[vi] = {
            ...v[vi],
            images: (v[vi].images || []).filter(
              (img) => !img.startsWith("blob:"),
            ),
            imageFiles: [],
          };
          return { ...f, variants: v };
        });
        previews.forEach((url) => URL.revokeObjectURL(url));
        setToast({
          type: "error",
          msg: "Image upload failed. Please try again.",
        });
      }
    },
    [],
  );

  const removeImg = useCallback(
    (vi: number, ii: number) =>
      setForm((f) => {
        const v = [...f.variants];
        if (!v[vi]) return f;
        const removedImage = v[vi].images[ii];
        if (removedImage && removedImage.startsWith("blob:"))
          URL.revokeObjectURL(removedImage);
        v[vi] = {
          ...v[vi],
          images: v[vi].images.filter((_, index) => index !== ii),
          imageFiles: [],
        };
        return { ...f, variants: v };
      }),
    [],
  );

  const handleSave = useCallback(async () => {
    if (!form.name || !form.category || form.price <= 0) {
      setToast({
        type: "error",
        msg: "Name, category and price are required.",
      });
      return;
    }
    const hasBlobUrls = form.variants.some((v) =>
      v.images.some((img) => img.startsWith("blob:")),
    );
    if (hasBlobUrls) {
      setToast({
        type: "error",
        msg: "Images are still uploading. Please wait and try again.",
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
  }, [form, editingProduct, fetchProducts, cancel]);

  const handleDelete = useCallback(
    async (id: string) => {
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
    },
    [editingProduct, fetchProducts, cancel],
  );

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

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const categoryCount = (cat: string) =>
    products.filter((p) => p.category === cat).length;

  // ── Stock summary stats ────────────────────────────────────────────────────
  const totalStock = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
  const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;
  const lowStock = products.filter(
    (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 10,
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .adm-card {
          background: var(--adm-bg-white);
          border: 1px solid var(--adm-border);
          box-shadow: var(--adm-shadow-card);
        }
        .adm-input {
          background: var(--adm-bg-input);
          border-color: var(--adm-border);
          color: var(--adm-fg);
        }
        .adm-input::placeholder { color: var(--adm-fg-faint); }
        .adm-input:focus {
          border-color: var(--adm-accent);
          background: var(--adm-bg-white);
        }
        .adm-btn-primary {
          background: var(--adm-accent); color: #fff; border: none;
          cursor: pointer; font-family: sans-serif; font-size: 10px;
          font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;
        }
        .adm-btn-primary:hover:not(:disabled) {
          background: var(--adm-accent-hover); transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(184,148,94,0.25);
        }
        .adm-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .adm-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .adm-btn-ghost {
          border: 1px solid var(--adm-border); background: transparent;
          color: var(--adm-fg-muted); cursor: pointer; font-family: sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; transition: border-color 0.15s, color 0.15s, transform 0.12s;
        }
        .adm-btn-ghost:hover { border-color: var(--adm-accent); color: var(--adm-accent); transform: translateY(-1px); }
        .adm-btn-ghost:active { transform: translateY(0); }
        .adm-btn-danger {
          border: 1px solid var(--adm-border); background: transparent;
          color: var(--adm-fg-muted); cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s, transform 0.12s;
        }
        .adm-btn-danger:hover {
          border-color: var(--adm-danger); color: var(--adm-danger);
          background: var(--adm-bg-danger-lt); transform: translateY(-1px);
        }
        .adm-btn-danger-ghost {
          background: transparent; color: var(--adm-fg-muted); cursor: pointer;
          transition: background 0.15s, color 0.15s; font-family: sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
        }
        .adm-btn-danger-ghost:hover { background: var(--adm-bg-danger-lt); color: var(--adm-danger); }
        .adm-btn-row {
          background: transparent; color: var(--adm-fg-muted); border: none;
          cursor: pointer; transition: background 0.15s, color 0.15s;
        }
        .adm-btn-row:hover { background: var(--adm-bg-active); color: var(--adm-accent); }
        .adm-toggle-btn {
          border: 1px solid var(--adm-border); background: rgba(0,0,0,0.03);
          color: var(--adm-fg-muted); cursor: pointer; font-family: sans-serif;
          font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          transition: border-color 0.2s, background 0.2s, color 0.2s;
        }
        .adm-toggle-btn[data-active="true"] {
          border-color: var(--adm-accent-border-md); background: var(--adm-bg-active); color: var(--adm-accent);
        }
        .adm-toggle-track { background: #ccc; transition: background 0.2s; }
        .adm-toggle-track[data-active="true"] { background: var(--adm-accent); }
        .adm-toggle-thumb { left: 2px; transition: left 0.2s; }
        .adm-toggle-thumb[data-active="true"] { left: 14px; }
        .adm-nav-item {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 10px 20px; background: transparent; border: none;
          border-right: 2px solid transparent; color: var(--adm-fg-muted);
          cursor: pointer; font-family: sans-serif; font-size: 13px;
          font-weight: 600; text-align: left;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .adm-nav-item:hover { background: var(--adm-bg-hover); color: var(--adm-fg); }
        .adm-nav-item[data-active="true"] {
          background: var(--adm-bg-active); color: var(--adm-fg); border-right-color: var(--adm-accent);
        }
        .adm-cat-item {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 8px 20px 8px 28px; background: transparent;
          border: none; border-right: 2px solid transparent; color: var(--adm-fg-muted);
          cursor: pointer; font-family: sans-serif; font-size: 12px; font-weight: 500;
          text-align: left; transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .adm-cat-item:hover { background: var(--adm-bg-hover); color: var(--adm-fg); }
        .adm-cat-item[data-active="true"] {
          background: var(--adm-bg-active); color: var(--adm-accent);
          border-right-color: var(--adm-accent); font-weight: 600;
        }
        .adm-table-row { background: var(--adm-bg-white); transition: background 0.15s; }
        .adm-table-row:hover { background: var(--adm-bg-hover); }
        @keyframes admCardIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .adm-card-enter { animation: admCardIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .adm-card-enter:nth-child(1) { animation-delay: 0.03s; }
        .adm-card-enter:nth-child(2) { animation-delay: 0.07s; }
        .adm-card-enter:nth-child(3) { animation-delay: 0.11s; }
        .adm-card-enter:nth-child(4) { animation-delay: 0.15s; }
        .adm-card-enter:nth-child(5) { animation-delay: 0.19s; }
        .adm-card-enter:nth-child(n+6) { animation-delay: 0.22s; }
        @keyframes admRowIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .adm-table-row { animation: admRowIn 0.25s cubic-bezier(0.22,1,0.36,1) both; }
        .adm-table-row:nth-child(1) { animation-delay: 0.04s; }
        .adm-table-row:nth-child(2) { animation-delay: 0.08s; }
        .adm-table-row:nth-child(3) { animation-delay: 0.12s; }
        .adm-table-row:nth-child(n+4) { animation-delay: 0.15s; }
        .adm-pill {
          flex-shrink: 0; padding: 5px 14px; border: 1px solid var(--adm-border);
          background: var(--adm-bg-white); color: var(--adm-fg-muted);
          font-family: sans-serif; font-size: 11px; font-weight: 600;
          white-space: nowrap; cursor: pointer; border-radius: 999px;
          transition: border-color 0.15s, background 0.15s, color 0.15s, transform 0.12s;
        }
        .adm-pill:hover { border-color: var(--adm-accent); color: var(--adm-accent); }
        .adm-pill:active { transform: scale(0.96); }
        .adm-pill[data-active="true"] { background: var(--adm-accent); border-color: var(--adm-accent); color: #fff; }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .adm-toast { animation: toastIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes admFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes admModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .adm-backdrop { animation: admFadeIn 0.2s ease both; }
        .adm-modal    { animation: admModalIn 0.25s cubic-bezier(0.22,1,0.36,1) both; }
        @keyframes admViewIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .adm-view { animation: admViewIn 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .adm-section-label {
          padding: 12px 20px 4px; font-family: sans-serif; font-size: 9px;
          font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--adm-fg-muted);
        }

        /* Stock number input spinner remove */
        .adm-stock-input::-webkit-inner-spin-button,
        .adm-stock-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .adm-stock-input { -moz-appearance: textfield; }

        /* Stock stepper buttons */
        .stock-stepper-btn {
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--adm-border); background: var(--adm-bg-soft);
          cursor: pointer; font-size: 16px; font-weight: 700; color: var(--adm-fg-muted);
          transition: background 0.15s, border-color 0.15s, color 0.15s; user-select: none;
          flex-shrink: 0;
        }
        .stock-stepper-btn:hover { background: var(--adm-bg-active); border-color: var(--adm-accent); color: var(--adm-accent); }
        .stock-stepper-btn:active { transform: scale(0.95); }
      `}</style>

      <div
        className="font-serif min-h-screen"
        style={{ background: "var(--adm-bg)", color: "var(--adm-fg)" }}
      >
        {/* ── Header ── */}
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
              className="adm-btn-ghost flex items-center gap-1.5 px-2.5 py-1.5 font-sans text-[11px]"
              onClick={() => router.push("/admin/dashboard")}
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
              Inventory
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
              className="adm-btn-ghost flex items-center gap-1.5 px-3 py-1.5 font-sans text-[10px]"
              onClick={handleLogout}
              style={{
                transition: "border-color 0.15s, color 0.15s, background 0.15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--adm-danger-border)";
                el.style.color = "var(--adm-danger)";
                el.style.background = "var(--adm-bg-danger-lt)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "var(--adm-border)";
                el.style.color = "var(--adm-fg-muted)";
                el.style.background = "transparent";
              }}
            >
              <LogOut size={11} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex" style={{ height: "calc(100vh - 60px)" }}>
          {/* Desktop Sidebar */}
          <aside
            className="hidden md:flex flex-col sticky overflow-y-auto"
            style={{
              width: 260,
              flexShrink: 0,
              top: 60,
              height: "calc(100vh - 60px)",
              background: "var(--adm-bg-white)",
              borderRight: "1px solid var(--adm-border)",
            }}
          >
            <div
              className="px-5 py-5 pb-4"
              style={{ borderBottom: "1px solid var(--adm-border-soft)" }}
            >
              <div
                className="font-sans text-[9px] font-bold tracking-widest uppercase mb-1"
                style={{ color: "var(--adm-accent)" }}
              >
                Bambumm Admin
              </div>
              <div
                className="font-serif text-[18px] font-bold"
                style={{ color: "var(--adm-fg)" }}
              >
                Inventory
              </div>
            </div>

            {/* ── Stock summary in sidebar ── */}
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid var(--adm-border-soft)" }}
            >
              <p
                className="font-sans text-[9px] font-bold tracking-[0.16em] uppercase mb-2"
                style={{ color: "var(--adm-fg-muted)" }}
              >
                Stock Overview
              </p>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className="font-sans text-[11px]"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    Total units
                  </span>
                  <span
                    className="font-sans text-[11px] font-bold"
                    style={{ color: "var(--adm-fg)" }}
                  >
                    {totalStock}
                  </span>
                </div>
                {outOfStock > 0 && (
                  <div className="flex items-center justify-between">
                    <span
                      className="font-sans text-[11px] flex items-center gap-1"
                      style={{ color: "#c0392b" }}
                    >
                      <AlertTriangle size={10} /> Out of stock
                    </span>
                    <span
                      className="font-sans text-[11px] font-bold"
                      style={{ color: "#c0392b" }}
                    >
                      {outOfStock}
                    </span>
                  </div>
                )}
                {lowStock > 0 && (
                  <div className="flex items-center justify-between">
                    <span
                      className="font-sans text-[11px] flex items-center gap-1"
                      style={{ color: "#e67e22" }}
                    >
                      <TrendingDown size={10} /> Low stock
                    </span>
                    <span
                      className="font-sans text-[11px] font-bold"
                      style={{ color: "#e67e22" }}
                    >
                      {lowStock}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <nav className="py-2">
              <button
                className="adm-nav-item"
                data-active={view === "add" && !editingProduct}
                onClick={openAdd}
              >
                <Plus size={15} /> Add Product
              </button>
              <button
                className="adm-nav-item"
                data-active={
                  view === "products" && activeCategoryFilter === "all"
                }
                onClick={() => {
                  setView("products");
                  setEditingProduct(null);
                  setActiveCategoryFilter("all");
                }}
              >
                <LayoutGrid size={15} /> All Products
                <span
                  className="ml-auto font-sans text-[9px] font-bold px-1.5 py-0.5"
                  style={{
                    background: "var(--adm-bg-accent-md)",
                    border: "1px solid var(--adm-accent-border)",
                    color: "var(--adm-accent)",
                  }}
                >
                  {products.length}
                </span>
              </button>
              <button
                className="adm-nav-item"
                data-active={view === "categories"}
                onClick={() => {
                  setView("categories");
                  setEditingProduct(null);
                }}
              >
                <Tag size={15} /> Categories
              </button>
            </nav>

            {view === "products" && dbCategories.length > 0 && (
              <>
                <div
                  className="h-px mx-4"
                  style={{ background: "var(--adm-border-soft)" }}
                />
                <div className="adm-section-label">Filter by Category</div>
                <div className="pb-3">
                  <button
                    className="adm-cat-item"
                    data-active={activeCategoryFilter === "all"}
                    onClick={() => setActiveCategoryFilter("all")}
                  >
                    <span>All</span>
                    <span
                      className="font-sans text-[9px] font-bold px-1.5 py-0.5"
                      style={{
                        background:
                          activeCategoryFilter === "all"
                            ? "var(--adm-bg-accent-md)"
                            : "transparent",
                        border: "1px solid var(--adm-accent-border)",
                        color: "var(--adm-accent)",
                      }}
                    >
                      {products.length}
                    </span>
                  </button>
                  {dbCategories.map((cat) => {
                    const count = categoryCount(cat);
                    if (count === 0) return null;
                    return (
                      <button
                        key={cat}
                        className="adm-cat-item"
                        data-active={activeCategoryFilter === cat}
                        onClick={() => setActiveCategoryFilter(cat)}
                      >
                        <span className="truncate">{cat}</span>
                        <span
                          className="font-sans text-[9px] font-bold px-1.5 py-0.5 shrink-0 ml-1"
                          style={{
                            background:
                              activeCategoryFilter === cat
                                ? "var(--adm-bg-accent-md)"
                                : "transparent",
                            border: "1px solid var(--adm-accent-border)",
                            color: "var(--adm-accent)",
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {/* ══ PRODUCTS VIEW ══ */}
            {view === "products" && (
              <div className="adm-view">
                <div
                  className="hidden md:flex items-center justify-between px-8 py-6 border-b"
                  style={{ borderColor: "var(--adm-border-soft)" }}
                >
                  <div>
                    <div
                      className="font-serif text-[22px] font-bold"
                      style={{ color: "var(--adm-fg)" }}
                    >
                      {activeCategoryFilter === "all"
                        ? "All Products"
                        : activeCategoryFilter}
                    </div>
                    <div
                      className="font-sans text-[12px] mt-0.5"
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      {filteredProducts.length} product
                      {filteredProducts.length !== 1 ? "s" : ""}
                      {activeCategoryFilter !== "all" && " in this category"}
                    </div>
                  </div>
                </div>

                <div
                  className="md:hidden flex items-center justify-between px-4 py-3 border-b"
                  style={{ borderColor: "var(--adm-border-soft)" }}
                >
                  <div>
                    <div
                      className="font-serif text-lg font-bold"
                      style={{ color: "var(--adm-fg)" }}
                    >
                      All Products
                    </div>
                    <div
                      className="font-sans text-[11px] mt-0.5"
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      {filteredProducts.length} item
                      {filteredProducts.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <button
                    className="adm-btn-primary flex items-center gap-1.5 px-4 py-2"
                    onClick={openAdd}
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>

                {dbCategories.length > 0 && (
                  <div
                    className="md:hidden flex items-center gap-2 px-4 py-3 overflow-x-auto border-b"
                    style={{
                      borderColor: "var(--adm-border-soft)",
                      background: "var(--adm-bg-soft)",
                    }}
                  >
                    <SlidersHorizontal
                      size={13}
                      style={{ color: "var(--adm-fg-muted)", flexShrink: 0 }}
                    />
                    <button
                      className="adm-pill"
                      data-active={activeCategoryFilter === "all"}
                      onClick={() => setActiveCategoryFilter("all")}
                    >
                      All ({products.length})
                    </button>
                    {dbCategories.map((cat) => {
                      const count = categoryCount(cat);
                      if (count === 0) return null;
                      return (
                        <button
                          key={cat}
                          className="adm-pill"
                          data-active={activeCategoryFilter === cat}
                          onClick={() => setActiveCategoryFilter(cat)}
                        >
                          {cat} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}

                {loading ? (
                  <div
                    className="flex items-center justify-center gap-2.5 py-20 font-sans text-[13px]"
                    style={{ color: "var(--adm-fg-muted)" }}
                  >
                    <Loader2 size={18} className="animate-spin" /> Loading
                    inventory…
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
                    <div
                      className="w-14 h-14 flex items-center justify-center mb-4"
                      style={{
                        background: "var(--adm-bg-accent-lt)",
                        border: "1px solid var(--adm-accent-border)",
                        color: "var(--adm-accent)",
                      }}
                    >
                      <Package size={22} />
                    </div>
                    <div
                      className="font-serif text-[16px] font-bold mb-1.5"
                      style={{ color: "var(--adm-fg)" }}
                    >
                      {activeCategoryFilter === "all"
                        ? "No products yet"
                        : `No products in "${activeCategoryFilter}"`}
                    </div>
                    <div
                      className="font-sans text-[13px] mb-5"
                      style={{ color: "var(--adm-fg-muted)" }}
                    >
                      {activeCategoryFilter === "all"
                        ? "Add your first product to get started."
                        : "Try a different category or add a new product."}
                    </div>
                    {activeCategoryFilter === "all" && (
                      <button
                        className="adm-btn-primary flex items-center gap-1.5 px-4 py-2.5"
                        onClick={openAdd}
                      >
                        <Plus size={13} /> Add Product
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Desktop table */}
                    <div className="hidden md:block px-8 py-4">
                      <div
                        className="grid gap-3 px-4 py-2 font-sans text-[10px] font-bold tracking-[0.14em] uppercase border-b mb-1"
                        style={{
                          gridTemplateColumns:
                            "60px 1fr 120px 100px 70px 110px 60px 100px 60px",
                          color: "var(--adm-fg-muted)",
                          borderColor: "var(--adm-border)",
                        }}
                      >
                        <span>Image</span>
                        <span>Product Name</span>
                        <span>Category</span>
                        <span>Colours</span>
                        <span>Price</span>
                        <span>Stock</span>
                        <span>Edit</span>
                        <span>Active</span>
                        <span>Delete</span>
                      </div>
                      {filteredProducts.map((product) => (
                        <ProductRow
                          key={product._id}
                          product={product}
                          onEdit={openEdit}
                          activeProducts={activeProducts}
                          setConfirmDialog={setConfirmDialog}
                        />
                      ))}
                    </div>

                    {/* Mobile cards */}
                    <div className="md:hidden px-4 py-4 pb-24 flex flex-col gap-3">
                      {filteredProducts.map((product) => (
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
              </div>
            )}

            {/* ══ CATEGORIES VIEW ══ */}
            {view === "categories" && (
              <div className="adm-view">
                <CategoryManager
                  key="category-manager"
                  onCategoriesChange={fetchDbCategories}
                />
              </div>
            )}

            {/* ══ FORM VIEW ══ */}
            {view === "add" && (
              <div className="adm-view max-w-4xl px-8 py-7 md:pb-16 pb-24">
                <div
                  className="flex items-center gap-2 mb-5 font-sans text-[11px]"
                  style={{ color: "var(--adm-fg-muted)" }}
                >
                  <button
                    className="flex items-center gap-1 font-sans text-[11px] bg-transparent border-none cursor-pointer p-0 transition-colors duration-150"
                    style={{ color: "var(--adm-fg-muted)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--adm-accent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--adm-fg-muted)")
                    }
                    onClick={cancel}
                  >
                    <ArrowLeft size={12} /> All Products
                  </button>
                  <span>/</span>
                  <span style={{ color: "var(--adm-fg)" }}>
                    {editingProduct ? "Edit" : "New Product"}
                  </span>
                </div>

                <div
                  className="font-serif text-[22px] font-bold mb-6"
                  style={{ color: "var(--adm-fg)" }}
                >
                  {editingProduct ? editingProduct.name : "Add to Inventory"}
                </div>

                {/* Basic Info — now includes stock */}
                <FormSection title="Basic Info">
                  <div className="mb-4">
                    <FieldLabel>Product Name *</FieldLabel>
                    <input
                      className={inputCls}
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder=""
                    />
                  </div>

                  {/* Price + Category row */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <FieldLabel>Price (₹) *</FieldLabel>
                      <div className="relative">
                        <span
                          className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-[13px] font-bold"
                          style={{ color: "var(--adm-accent)" }}
                        >
                          ₹
                        </span>
                        <input
                          className={`${inputCls} pl-7`}
                          type="number"
                          value={form.price || ""}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              price: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Category *</FieldLabel>
                      <select
                        className={`${inputCls} appearance-none`}
                        value={form.category}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, category: e.target.value }))
                        }
                      >
                        <option value="">Select…</option>
                        {dbCategories.length === 0 ? (
                          <option value="" disabled>
                            No categories — add via Categories tab
                          </option>
                        ) : (
                          dbCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  {/* ── Stock field ── */}
                  <div>
                    <FieldLabel>Stock Quantity</FieldLabel>
                    <div
                      className="flex items-stretch gap-0"
                      style={{
                        border: "1px solid var(--adm-border)",
                        background: "var(--adm-bg-input)",
                      }}
                    >
                      {/* Decrement */}
                      <button
                        type="button"
                        className="stock-stepper-btn"
                        style={{
                          borderRight: "1px solid var(--adm-border)",
                          borderLeft: "none",
                          borderTop: "none",
                          borderBottom: "none",
                        }}
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            stock: Math.max(0, f.stock - 1),
                          }))
                        }
                        tabIndex={-1}
                      >
                        −
                      </button>
                      {/* Input */}
                      <input
                        type="number"
                        min={0}
                        className="adm-stock-input flex-1 bg-transparent outline-none font-sans text-[14px] font-bold text-center"
                        style={{
                          color: "var(--adm-fg)",
                          padding: "10px 8px",
                          border: "none",
                        }}
                        value={form.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setForm((f) => ({
                            ...f,
                            stock: isNaN(val) || val < 0 ? 0 : val,
                          }));
                        }}
                      />
                      {/* Increment */}
                      <button
                        type="button"
                        className="stock-stepper-btn"
                        style={{
                          borderLeft: "1px solid var(--adm-border)",
                          borderRight: "none",
                          borderTop: "none",
                          borderBottom: "none",
                        }}
                        onClick={() =>
                          setForm((f) => ({ ...f, stock: f.stock + 1 }))
                        }
                        tabIndex={-1}
                      >
                        +
                      </button>
                    </div>
                    {/* Stock status hint */}
                    <div className="flex items-center gap-2 mt-2">
                      <StockBadge stock={form.stock} />
                      {form.stock > 0 && form.stock <= 10 && (
                        <span
                          className="font-sans text-[10px]"
                          style={{ color: "var(--adm-fg-muted)" }}
                        >
                          Consider restocking soon
                        </span>
                      )}
                      {form.stock === 0 && (
                        <span
                          className="font-sans text-[10px]"
                          style={{ color: "#c0392b" }}
                        >
                          Product will appear as out of stock on the storefront
                        </span>
                      )}
                    </div>
                  </div>
                </FormSection>

                {/* Description */}
                <FormSection title="Description">
                  <textarea
                    className={`${inputCls} resize-none leading-relaxed`}
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Describe your product…"
                  />
                </FormSection>

                {/* Variants */}
                <FormSection
                  title="Colour Variants"
                  headerRight={
                    <button
                      className="adm-btn-ghost flex items-center gap-1.5 px-3 py-1.5"
                      style={{ borderColor: "var(--adm-accent-border)" }}
                      onClick={addVariant}
                    >
                      <Plus size={10} /> Add Variant
                    </button>
                  }
                >
                  {form.variants.map((variant, vi) => (
                    <div
                      key={vi}
                      className="mb-3 last:mb-0 overflow-hidden"
                      style={{ border: "1px solid var(--adm-border)" }}
                    >
                      <div
                        className="flex items-center gap-2.5 px-3.5 py-2.5 border-b"
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
                          className="w-8 h-8 border-2 cursor-pointer rounded-sm shrink-0 p-0"
                          style={{ borderColor: "var(--adm-border)" }}
                        />
                        <input
                          type="text"
                          className="flex-1 bg-transparent border-none outline-none font-sans text-[13px] font-semibold"
                          style={{ color: "var(--adm-fg)" }}
                          value={variant.colorName}
                          onChange={(e) =>
                            updateVariant(vi, "colorName", e.target.value)
                          }
                          placeholder="Colour name (e.g. Black)"
                        />
                        {form.variants.length > 1 && (
                          <button
                            className="w-6 h-6 flex items-center justify-center bg-transparent border-none cursor-pointer transition-colors duration-150"
                            style={{ color: "var(--adm-fg-faint)" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color =
                                "var(--adm-danger)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color =
                                "var(--adm-fg-faint)")
                            }
                            onClick={() => removeVariant(vi)}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                      <div className="p-3.5">
                        <div
                          className="font-sans text-[9px] font-bold tracking-[0.16em] uppercase mb-2.5"
                          style={{ color: "var(--adm-fg-muted)" }}
                        >
                          Images
                        </div>
                        {variant.images.length > 0 && (
                          <div className="grid grid-cols-5 gap-2 mb-2.5">
                            {variant.images.map((img, ii) =>
                              img ? (
                                <div
                                  key={ii}
                                  className="relative aspect-square overflow-hidden group"
                                  style={{
                                    border: "1px solid var(--adm-border)",
                                  }}
                                >
                                  <img
                                    src={img}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    className="absolute top-0.5 right-0.5 w-4 h-4 text-white flex items-center justify-center border-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                    style={{
                                      background: "rgba(192,57,43,0.9)",
                                    }}
                                    onClick={() => removeImg(vi, ii)}
                                  >
                                    <X size={9} />
                                  </button>
                                </div>
                              ) : null,
                            )}
                          </div>
                        )}
                        <div
                          className="flex flex-col items-center justify-center gap-2 py-6 px-3 border-2 border-dashed cursor-pointer transition-all duration-200"
                          style={{ borderColor: "var(--adm-border)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--adm-accent)";
                            e.currentTarget.style.background =
                              "var(--adm-bg-hover)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--adm-border)";
                            e.currentTarget.style.background = "transparent";
                          }}
                          onClick={() => fileInputRefs.current[vi]?.click()}
                        >
                          <div
                            className="w-9 h-9 flex items-center justify-center"
                            style={{
                              background: "var(--adm-bg-accent-lt)",
                              border: "1px solid var(--adm-accent-border)",
                              color: "var(--adm-accent)",
                            }}
                          >
                            <Upload size={14} />
                          </div>
                          <span
                            className="font-sans text-[12px] font-semibold"
                            style={{ color: "var(--adm-fg-muted)" }}
                          >
                            Click to upload images
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
                          onChange={(e) =>
                            handleImageUpload(vi, e.target.files)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </FormSection>

                {/* Actions */}
                <div
                  className="p-5"
                  style={{
                    background: "var(--adm-bg-white)",
                    border: "1px solid var(--adm-border)",
                  }}
                >
                  {editingProduct && (
                    <button
                      className="flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-sans text-[10px] font-bold tracking-widest uppercase mb-3.5 p-0 transition-opacity duration-150 hover:opacity-70"
                      style={{ color: "var(--adm-danger)" }}
                      onClick={() =>
                        setConfirmDialog({
                          type: "delete",
                          productId: editingProduct._id!,
                          productName: editingProduct.name,
                        })
                      }
                    >
                      <Trash2 size={11} /> Delete this product
                    </button>
                  )}
                  <div className="flex gap-2.5">
                    <button
                      className="adm-btn-ghost flex-1 py-3 font-sans text-[11px]"
                      onClick={cancel}
                    >
                      Cancel
                    </button>
                    <button
                      className="adm-btn-primary flex flex-[1.5] items-center justify-center gap-2 py-3 font-sans text-[11px]"
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
            )}
          </main>
        </div>

        {/* ── Mobile Bottom Nav ── */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex"
          style={{
            height: 56,
            background: "var(--adm-bg-white)",
            borderTop: "1px solid var(--adm-border)",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          }}
        >
          {[
            {
              label: "Add",
              icon: <Plus size={18} />,
              action: openAdd,
              active: view === "add" && !editingProduct,
            },
            {
              label: "Products",
              icon: <LayoutGrid size={18} />,
              action: () => {
                setView("products");
                setEditingProduct(null);
              },
              active: view === "products",
            },
            {
              label: "Categories",
              icon: <Tag size={18} />,
              action: () => {
                setView("categories");
                setEditingProduct(null);
              },
              active: view === "categories",
            },
            {
              label: "Back",
              icon: <ChevronLeft size={18} />,
              action: () => router.push("/admin/dashboard"),
              active: false,
            },
          ].map(({ label, icon, action, active }) => (
            <button
              key={label}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 bg-transparent border-none cursor-pointer font-sans text-[9px] font-bold tracking-widest uppercase border-t-2 transition-all duration-150"
              style={{
                color: active ? "var(--adm-accent)" : "var(--adm-fg-muted)",
                borderColor: active ? "var(--adm-accent)" : "transparent",
              }}
              onClick={action}
            >
              {icon} {label}
            </button>
          ))}
        </nav>

        {/* ── Toast ── */}
        {toast && (
          <div
            className="adm-toast fixed bottom-6 right-6 z-999 flex items-center gap-2.5 px-4 py-3"
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
              className="font-sans text-[13px] font-semibold"
              style={{ color: "var(--adm-fg)" }}
            >
              {toast.msg}
            </span>
          </div>
        )}

        {/* ── Confirm Dialog ── */}
        {confirmDialog && (
          <div
            className="adm-backdrop fixed inset-0 z-1000 flex items-center justify-center p-5"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <div
              className="adm-modal p-7 max-w-90 w-full"
              style={{
                background: "var(--adm-bg-white)",
                border: "1px solid var(--adm-border)",
                boxShadow: "var(--adm-shadow-modal)",
              }}
            >
              <h3
                className="font-serif text-[16px] font-bold mb-2"
                style={{ color: "var(--adm-fg)" }}
              >
                {confirmDialog.type === "delete"
                  ? "Delete Product?"
                  : confirmDialog.currentActive
                    ? "Deactivate Product?"
                    : "Activate Product?"}
              </h3>
              <p
                className="font-sans text-[13px] leading-relaxed mb-5"
                style={{ color: "var(--adm-fg-muted)" }}
              >
                {confirmDialog.type === "delete"
                  ? `Permanently delete "${confirmDialog.productName}"? This cannot be undone.`
                  : `${confirmDialog.currentActive ? "Deactivate" : "Activate"} "${confirmDialog.productName}"?`}
              </p>
              <div className="flex gap-2.5">
                <button
                  className="adm-btn-ghost flex-1 py-2.5 font-sans text-[11px]"
                  onClick={() => setConfirmDialog(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-[1.5] py-2.5 border-none cursor-pointer font-sans text-[11px] font-bold tracking-widest uppercase text-white transition-opacity duration-150 hover:opacity-90"
                  style={{
                    background:
                      confirmDialog.type === "delete"
                        ? "var(--adm-danger)"
                        : "var(--adm-accent)",
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
      </div>
    </>
  );
}
