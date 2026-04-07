"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Package,
  X,
  ChevronLeft,
  Upload,
  Trash2,
  Save,
  Loader2,
  ImagePlus,
  Tag,
  DollarSign,
  FileText,
  Layers,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  Edit3,
  Eye,
} from "lucide-react";

interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
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
  variants: [{ colorName: "", colorHex: "#c8a97e", images: [""] }],
};

export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "add">("products");
  const [form, setForm] =
    useState<Omit<Product, "_id" | "createdAt">>(EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [time, setTime] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

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

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Auto-generate slug from name
  useEffect(() => {
    setForm((f) => ({
      ...f,
      slug: f.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    }));
  }, [form.name]);

  const openAddPanel = () => {
    setForm(EMPTY_PRODUCT);
    setSelectedProduct(null);
    setPanelOpen(true);
    setActiveTab("add");
  };

  const openEditPanel = (product: Product) => {
    setSelectedProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      category: product.category,
      variants: product.variants,
    });
    setPanelOpen(true);
    setActiveTab("add");
  };

  const closePanel = () => {
    setPanelOpen(false);
    setTimeout(() => {
      setSelectedProduct(null);
      setForm(EMPTY_PRODUCT);
    }, 300);
    if (activeTab === "add" && !selectedProduct) setActiveTab("products");
  };

  // Variant helpers
  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [
        ...f.variants,
        { colorName: "", colorHex: "#c8a97e", images: [""] },
      ],
    }));

  const removeVariant = (i: number) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, idx) => idx !== i),
    }));

  const updateVariant = (
    i: number,
    field: keyof ProductVariant,
    value: string | string[],
  ) =>
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], [field]: value };
      return { ...f, variants };
    });

  const addImageToVariant = (i: number) =>
    setForm((f) => {
      const variants = [...f.variants];
      variants[i] = { ...variants[i], images: [...variants[i].images, ""] };
      return { ...f, variants };
    });

  const updateImageInVariant = (vi: number, ii: number, value: string) =>
    setForm((f) => {
      const variants = [...f.variants];
      const images = [...variants[vi].images];
      images[ii] = value;
      variants[vi] = { ...variants[vi], images };
      return { ...f, variants };
    });

  const removeImageFromVariant = (vi: number, ii: number) =>
    setForm((f) => {
      const variants = [...f.variants];
      variants[vi] = {
        ...variants[vi],
        images: variants[vi].images.filter((_, idx) => idx !== ii),
      };
      return { ...f, variants };
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
      const body = selectedProduct
        ? { ...form, _id: selectedProduct._id }
        : form;
      const res = await fetch("/api/admin/inventory", {
        method: selectedProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setToast({
          type: "success",
          msg: selectedProduct ? "Product updated!" : "Product added!",
        });
        await fetchProducts();
        closePanel();
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
        if (selectedProduct?._id === id) closePanel();
      }
    } catch {}
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div
      className="min-h-screen bg-[#f5f0e8] flex flex-col"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-50 h-16 bg-[#f5f0e8] border-b border-[#e0d8cc] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-1.5 text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors text-xs font-semibold tracking-wide uppercase"
          >
            <ChevronLeft size={14} />
            Dashboard
          </button>
          <div className="w-px h-5 bg-[#e0d8cc]" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(200,169,126,0.12)] border border-[rgba(200,169,126,0.3)] text-[#c8a97e] text-[0.6rem] tracking-[0.18em] uppercase font-semibold">
            <ShieldCheck size={10} />
            Inventory
          </div>
        </div>
        <div className="flex items-center gap-4">
          {time && (
            <div className="hidden sm:flex items-center gap-1.5 text-[0.7rem] text-[#6b6b6b] tracking-wide">
              <Clock size={12} />
              {time}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e0d8cc] text-[#6b6b6b] text-[0.65rem] tracking-[0.16em] uppercase hover:border-red-400 hover:text-red-500 transition-all duration-200"
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── LEFT SIDEBAR ── */}
        <aside className="w-64 shrink-0 bg-white border-r border-[#e0d8cc] flex flex-col h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
          {/* Sidebar header */}
          <div className="px-5 pt-6 pb-4 border-b border-[#e0d8cc]">
            <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-[#c8a97e] mb-1">
              Bambumm Admin
            </p>
            <h2
              className="text-lg font-bold text-[#1a1a1a]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Inventory
            </h2>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-3">
            <button
              onClick={() => {
                setActiveTab("products");
                setPanelOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all duration-150 ${activeTab === "products" && !panelOpen ? "bg-[rgba(200,169,126,0.12)] text-[#1a1a1a] border-r-2 border-[#c8a97e]" : "text-[#6b6b6b] hover:bg-[rgba(200,169,126,0.06)] hover:text-[#1a1a1a]"}`}
            >
              <Package
                size={16}
                className={
                  activeTab === "products" && !panelOpen ? "text-[#c8a97e]" : ""
                }
              />
              All Products
              <span className="ml-auto text-[0.6rem] font-bold px-1.5 py-0.5 bg-[rgba(200,169,126,0.15)] text-[#c8a97e] border border-[rgba(200,169,126,0.2)]">
                {products.length}
              </span>
            </button>

            <button
              onClick={openAddPanel}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-all duration-150 ${panelOpen && !selectedProduct ? "bg-[rgba(200,169,126,0.12)] text-[#1a1a1a] border-r-2 border-[#c8a97e]" : "text-[#6b6b6b] hover:bg-[rgba(200,169,126,0.06)] hover:text-[#1a1a1a]"}`}
            >
              <Plus
                size={16}
                className={
                  panelOpen && !selectedProduct ? "text-[#c8a97e]" : ""
                }
              />
              Add Product
            </button>
          </nav>

          {/* Product list in sidebar */}
          <div className="border-t border-[#e0d8cc] flex-1 overflow-y-auto">
            <p className="px-5 pt-4 pb-2 text-[0.6rem] font-bold tracking-[0.18em] uppercase text-[#6b6b6b]">
              Products
            </p>
            {loading ? (
              <div className="px-5 py-4 flex items-center gap-2 text-[#6b6b6b] text-xs">
                <Loader2 size={13} className="animate-spin" /> Loading...
              </div>
            ) : products.length === 0 ? (
              <p className="px-5 py-4 text-xs text-[#6b6b6b]">
                No products yet.
              </p>
            ) : (
              products.map((p) => (
                <button
                  key={p._id}
                  onClick={() => openEditPanel(p)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-150 group ${selectedProduct?._id === p._id ? "bg-[rgba(200,169,126,0.12)] border-r-2 border-[#c8a97e]" : "hover:bg-[rgba(200,169,126,0.05)]"}`}
                >
                  <div className="w-8 h-8 shrink-0 bg-[#f5f0e8] border border-[#e0d8cc] flex items-center justify-center">
                    <Package size={13} className="text-[#c8a97e]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1a1a1a] truncate">
                      {p.name}
                    </p>
                    <p className="text-[0.6rem] text-[#6b6b6b]">
                      ₹{p.price} · {p.variants.length} variant
                      {p.variants.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Products grid view */}
          <div
            className={`transition-all duration-300 ${panelOpen ? "mr-[600px]" : ""}`}
          >
            <div className="p-8">
              {/* Page header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1
                    className="text-2xl font-bold text-[#1a1a1a]"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {activeTab === "products" ? "All Products" : "Inventory"}
                  </h1>
                  <p className="text-sm text-[#6b6b6b] mt-0.5">
                    {products.length} product{products.length !== 1 ? "s" : ""}{" "}
                    in inventory
                  </p>
                </div>
                <button
                  onClick={openAddPanel}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#c8a97e] text-white text-xs font-bold tracking-[0.14em] uppercase hover:bg-[#a8845a] transition-colors duration-200"
                >
                  <Plus size={14} />
                  Add Product
                </button>
              </div>

              {/* Products grid */}
              {loading ? (
                <div className="flex items-center justify-center py-24 text-[#6b6b6b]">
                  <Loader2 size={24} className="animate-spin mr-3" />
                  Loading inventory...
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 bg-[rgba(200,169,126,0.1)] border border-[#e0d8cc] flex items-center justify-center mb-4">
                    <Package size={24} className="text-[#c8a97e]" />
                  </div>
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-1">
                    No products yet
                  </h3>
                  <p className="text-sm text-[#6b6b6b] mb-5">
                    Add your first product to get started.
                  </p>
                  <button
                    onClick={openAddPanel}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#c8a97e] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#a8845a] transition-colors"
                  >
                    <Plus size={14} /> Add Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className={`bg-white border transition-all duration-200 group ${selectedProduct?._id === product._id ? "border-[#c8a97e] shadow-[0_4px_20px_rgba(200,169,126,0.15)]" : "border-[#e0d8cc] hover:border-[#c8a97e] hover:shadow-[0_4px_20px_rgba(200,169,126,0.1)]"}`}
                    >
                      {/* Card top accent */}
                      <div className="h-0.5 bg-[#c8a97e] opacity-40" />

                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3
                              className="font-bold text-[#1a1a1a] text-sm"
                              style={{ fontFamily: "Georgia, serif" }}
                            >
                              {product.name}
                            </h3>
                            <span className="text-[0.6rem] font-bold tracking-[0.14em] uppercase text-[#c8a97e]">
                              {product.category}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className="text-lg font-bold text-[#1a1a1a]"
                              style={{ fontFamily: "Georgia, serif" }}
                            >
                              ₹{product.price}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-[#6b6b6b] leading-relaxed line-clamp-2 mb-4">
                          {product.description || "No description."}
                        </p>

                        {/* Variants */}
                        <div className="flex items-center gap-1.5 mb-4">
                          {product.variants.map((v, i) => (
                            <div
                              key={i}
                              title={v.colorName}
                              className="w-5 h-5 rounded-full border-2 border-[#e0d8cc]"
                              style={{ background: v.colorHex }}
                            />
                          ))}
                          <span className="text-[0.6rem] text-[#6b6b6b] ml-1">
                            {product.variants.length} colour
                            {product.variants.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-3 border-t border-[#e0d8cc]">
                          <button
                            onClick={() => openEditPanel(product)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[0.65rem] font-bold tracking-[0.12em] uppercase border border-[#e0d8cc] text-[#6b6b6b] hover:border-[#c8a97e] hover:text-[#c8a97e] transition-all duration-150"
                          >
                            <Edit3 size={11} /> Edit
                          </button>
                          <button
                            onClick={() =>
                              product._id && handleDelete(product._id)
                            }
                            className="flex items-center justify-center gap-1.5 px-3 py-2 text-[0.65rem] font-bold tracking-[0.12em] uppercase border border-[#e0d8cc] text-[#6b6b6b] hover:border-red-400 hover:text-red-500 transition-all duration-150"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── SLIDE-IN PANEL ── */}
        <div
          ref={panelRef}
          className={`fixed top-16 right-0 bottom-0 w-[600px] bg-white border-l border-[#e0d8cc] shadow-[-8px_0_40px_rgba(0,0,0,0.08)] flex flex-col z-40 transition-transform duration-300 ease-in-out ${panelOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-[#e0d8cc] shrink-0 bg-white">
            <div>
              <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase text-[#c8a97e] mb-0.5">
                {selectedProduct ? "Edit Product" : "New Product"}
              </p>
              <h2
                className="text-base font-bold text-[#1a1a1a]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {selectedProduct ? selectedProduct.name : "Add to Inventory"}
              </h2>
            </div>
            <button
              onClick={closePanel}
              className="w-8 h-8 flex items-center justify-center border border-[#e0d8cc] text-[#6b6b6b] hover:border-[#c8a97e] hover:text-[#c8a97e] transition-all"
            >
              <X size={15} />
            </button>
          </div>

          {/* Panel body — scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            {/* Basic Info */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 flex items-center justify-center bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.2)]">
                  <Tag size={11} className="text-[#c8a97e]" />
                </div>
                <h3 className="text-xs font-bold tracking-[0.14em] uppercase text-[#1a1a1a]">
                  Basic Info
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[0.65rem] font-bold tracking-[0.14em] uppercase text-[#6b6b6b] mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. Classic Brief"
                    className="w-full px-4 py-2.5 border border-[#e0d8cc] bg-[#faf7f2] text-sm text-[#1a1a1a] focus:outline-none focus:border-[#c8a97e] placeholder:text-[#b0a898] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[0.65rem] font-bold tracking-[0.14em] uppercase text-[#6b6b6b] mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, slug: e.target.value }))
                    }
                    placeholder="auto-generated"
                    className="w-full px-4 py-2.5 border border-[#e0d8cc] bg-[#faf7f2] text-sm text-[#6b6b6b] focus:outline-none focus:border-[#c8a97e] placeholder:text-[#b0a898] transition-colors font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.65rem] font-bold tracking-[0.14em] uppercase text-[#6b6b6b] mb-1.5">
                      Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c8a97e] text-sm font-bold">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={form.price || ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            price: Number(e.target.value),
                          }))
                        }
                        placeholder="0"
                        className="w-full pl-7 pr-4 py-2.5 border border-[#e0d8cc] bg-[#faf7f2] text-sm text-[#1a1a1a] focus:outline-none focus:border-[#c8a97e] placeholder:text-[#b0a898] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-bold tracking-[0.14em] uppercase text-[#6b6b6b] mb-1.5">
                      Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-[#e0d8cc] bg-[#faf7f2] text-sm text-[#1a1a1a] focus:outline-none focus:border-[#c8a97e] transition-colors appearance-none"
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
              </div>
            </section>

            {/* Description */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 flex items-center justify-center bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.2)]">
                  <FileText size={11} className="text-[#c8a97e]" />
                </div>
                <h3 className="text-xs font-bold tracking-[0.14em] uppercase text-[#1a1a1a]">
                  Description
                </h3>
              </div>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Describe your product — fabric, comfort, use case…"
                rows={3}
                className="w-full px-4 py-3 border border-[#e0d8cc] bg-[#faf7f2] text-sm text-[#1a1a1a] resize-none focus:outline-none focus:border-[#c8a97e] placeholder:text-[#b0a898] leading-relaxed transition-colors"
              />
            </section>

            {/* Variants */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center bg-[rgba(200,169,126,0.1)] border border-[rgba(200,169,126,0.2)]">
                    <Layers size={11} className="text-[#c8a97e]" />
                  </div>
                  <h3 className="text-xs font-bold tracking-[0.14em] uppercase text-[#1a1a1a]">
                    Colour Variants
                  </h3>
                </div>
                <button
                  onClick={addVariant}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[rgba(200,169,126,0.3)] text-[#c8a97e] text-[0.65rem] font-bold tracking-[0.12em] uppercase hover:bg-[rgba(200,169,126,0.08)] transition-colors"
                >
                  <Plus size={11} /> Add Variant
                </button>
              </div>

              <div className="space-y-4">
                {form.variants.map((variant, vi) => (
                  <div
                    key={vi}
                    className="border border-[#e0d8cc] bg-[#faf7f2]"
                  >
                    {/* Variant header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e0d8cc] bg-white">
                      <input
                        type="color"
                        value={variant.colorHex}
                        onChange={(e) =>
                          updateVariant(vi, "colorHex", e.target.value)
                        }
                        className="w-8 h-8 border-2 border-[#e0d8cc] cursor-pointer rounded-sm"
                        title="Pick colour"
                      />
                      <input
                        type="text"
                        value={variant.colorName}
                        onChange={(e) =>
                          updateVariant(vi, "colorName", e.target.value)
                        }
                        placeholder="Colour name (e.g. Black)"
                        className="flex-1 bg-transparent text-sm text-[#1a1a1a] focus:outline-none placeholder:text-[#b0a898] font-semibold"
                      />
                      {form.variants.length > 1 && (
                        <button
                          onClick={() => removeVariant(vi)}
                          className="w-6 h-6 flex items-center justify-center text-[#b0a898] hover:text-red-500 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    {/* Images */}
                    <div className="px-4 py-3">
                      <p className="text-[0.6rem] font-bold tracking-[0.16em] uppercase text-[#6b6b6b] mb-2.5">
                        Image Paths
                      </p>
                      <div className="space-y-2">
                        {variant.images.map((img, ii) => (
                          <div key={ii} className="flex items-center gap-2">
                            <div className="flex items-center flex-1 border border-[#e0d8cc] bg-white">
                              <span className="px-2.5 text-[#c8a97e]">
                                <ImagePlus size={12} />
                              </span>
                              <input
                                type="text"
                                value={img}
                                onChange={(e) =>
                                  updateImageInVariant(vi, ii, e.target.value)
                                }
                                placeholder="/product/image.JPG"
                                className="flex-1 py-2 pr-3 bg-transparent text-xs text-[#1a1a1a] focus:outline-none placeholder:text-[#b0a898] font-mono"
                              />
                            </div>
                            {variant.images.length > 1 && (
                              <button
                                onClick={() => removeImageFromVariant(vi, ii)}
                                className="w-7 h-7 flex items-center justify-center border border-[#e0d8cc] text-[#b0a898] hover:text-red-500 hover:border-red-300 transition-all"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addImageToVariant(vi)}
                        className="mt-2 flex items-center gap-1.5 text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#c8a97e] hover:text-[#a8845a] transition-colors"
                      >
                        <Plus size={10} /> Add image path
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom spacer */}
            <div className="h-4" />
          </div>

          {/* Panel footer — save actions */}
          <div className="px-8 py-5 border-t border-[#e0d8cc] bg-white shrink-0">
            {selectedProduct && (
              <button
                onClick={() =>
                  selectedProduct._id && handleDelete(selectedProduct._id)
                }
                className="flex items-center gap-1.5 text-[0.65rem] font-bold tracking-[0.12em] uppercase text-red-400 hover:text-red-600 transition-colors mb-4"
              >
                <Trash2 size={11} /> Delete this product
              </button>
            )}
            <div className="flex gap-3">
              <button
                onClick={closePanel}
                className="flex-1 py-3 border border-[#e0d8cc] text-[#6b6b6b] text-xs font-bold tracking-[0.14em] uppercase hover:border-[#c8a97e] hover:text-[#1a1a1a] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-[#c8a97e] text-white text-xs font-bold tracking-[0.14em] uppercase hover:bg-[#a8845a] transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                {saving
                  ? "Saving…"
                  : selectedProduct
                    ? "Update Product"
                    : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 border shadow-lg transition-all duration-300 ${toast.type === "success" ? "bg-white border-[#c8a97e]" : "bg-white border-red-400"}`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={15} className="text-[#c8a97e] shrink-0" />
          ) : (
            <AlertCircle size={15} className="text-red-500 shrink-0" />
          )}
          <p className="text-sm font-semibold text-[#1a1a1a]">{toast.msg}</p>
        </div>
      )}
    </div>
  );
}
