"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Image from "next/image";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import ProductCard from "@/components/productCard";
import { FilterSearch } from "@/components/filterSearch";
import Link from "next/link";
import menBanner from "@/public/productPage/menBanner.jpeg";
import womenBanner from "@/public/productPage/womenBanner.jpeg";
import AccessoriesBanner from "@/public/productPage/accessoriesBanner.jpeg";
import MobileAccessoriesImage from "@/public/productPage/mobileAcessoriesBanner.jpeg";
import MobileMenImage from "@/public/productPage/mobileMenBanner.jpeg";
import MobileWomenImage from "@/public/productPage/mobileWomenBanner.jpeg";
interface ProductSize {
  size: string;
  stock: number;
}
interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
  sizes?: ProductSize[];
}
interface Product {
  _id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  gender?: string;
  variants: ProductVariant[];
}

type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";
const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevance",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Name: A-Z",
};

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    filterType: "gender" | "category";
    filterValue: string;
    tagline: string;
    description: string;
    features: string[];
    desktopBannerImage: string;
    mobileBannerImage: string;
    overlayColor: string;
  }
> = {
  men: {
    label: "Men's Underwear",
    filterType: "gender",
    filterValue: "Men",
    tagline: "Next-Level Comfort",
    description:
      "Engineered with ultra-soft bamboo fabric for unmatched comfort, all day, every day.",
    features: ["SUPER SOFT", "MOISTURE WICKING", "PERFECT FIT"],
    desktopBannerImage: menBanner.src,
    mobileBannerImage: MobileMenImage.src,
    overlayColor: "rgba(8, 24, 22, 0.55)",
  },
  women: {
    label: "Women's Accessories",
    filterType: "gender",
    filterValue: "Women",
    tagline: "Effortless Elegance",
    description:
      "Designed for the modern woman breathable, soft, and sustainably made from bamboo.",
    features: ["SUPER SOFT", "MOISTURE WICKING", "PERFECT FIT"],
    desktopBannerImage: womenBanner.src,
    mobileBannerImage: MobileWomenImage.src,
    overlayColor: "rgba(28, 10, 6, 0.52)",
  },
  accessories: {
    label: "Accessories",
    filterType: "gender",
    filterValue: "Accessories",
    tagline: "Complete Your Look",
    description:
      "Sustainably crafted accessories that complement every outfit.",
    features: ["SUPER SOFT", "MOISTURE WICKING", "PERFECT FIT"],
    desktopBannerImage: AccessoriesBanner.src,
    mobileBannerImage: MobileAccessoriesImage.src,
    overlayColor: "rgba(8, 20, 8, 0.52)",
  },
};

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{ borderBottom: "1px solid var(--nav-border)" }}
      className="py-4"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <span
          className="text-[0.7rem] font-bold tracking-[0.14em] uppercase"
          style={{ color: "var(--nav-fg)" }}
        >
          {title}
        </span>
        {open ? (
          <ChevronUp size={13} style={{ color: "var(--nav-fg-muted)" }} />
        ) : (
          <ChevronDown size={13} style={{ color: "var(--nav-fg-muted)" }} />
        )}
      </button>
      {open && <div className="pt-3">{children}</div>}
    </div>
  );
}

function CheckRow({
  label,
  checked,
  count,
  onChange,
}: {
  label: string;
  checked: boolean;
  count?: number;
  onChange: () => void;
}) {
  return (
    <label
      className="flex items-center justify-between gap-2 cursor-pointer py-0.5"
      onClick={onChange}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-4 h-4 flex items-center justify-center shrink-0 transition-all duration-150"
          style={{
            border: checked ? "none" : "1.5px solid var(--nav-border)",
            background: checked ? "var(--brand-teal)" : "#fff",
            borderRadius: "3px",
          }}
        >
          {checked && (
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path
                d="M1 3.5L3.5 6L8 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span
          className="text-[0.82rem] transition-colors duration-150"
          style={{
            color: checked ? "var(--nav-fg)" : "var(--nav-fg-muted)",
            fontWeight: checked ? 600 : 400,
          }}
        >
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span
          className="text-[0.65rem] font-bold"
          style={{ color: "var(--nav-fg-muted)" }}
        >
          {count}
        </span>
      )}
    </label>
  );
}

interface FiltersPanelProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  allProductCategories: string[];
  selectedCategories: string[];
  toggleCategory: (v: string) => void;
  allSizes: string[];
  selectedSizes: string[];
  toggleSize: (v: string) => void;
  allColors: [string, string][];
  selectedColors: string[];
  toggleColor: (v: string) => void;
  minPrice: string;
  maxPrice: string;
  onMinPrice: (v: string) => void;
  onMaxPrice: (v: string) => void;
  onClearPrice: () => void;
  activeFilterCount: number;
  clearFilters: () => void;
  products: Product[];
}

function FiltersPanel({
  searchQuery,
  onSearchChange,
  allProductCategories,
  selectedCategories,
  toggleCategory,
  allSizes,
  selectedSizes,
  toggleSize,
  allColors,
  selectedColors,
  toggleColor,
  minPrice,
  maxPrice,
  onMinPrice,
  onMaxPrice,
  onClearPrice,
  activeFilterCount,
  clearFilters,
  products,
}: FiltersPanelProps) {
  const sizeLabel = (s: string) =>
    s === "Small"
      ? "S"
      : s === "Medium"
        ? "M"
        : s === "Large"
          ? "L"
          : s === "Extra Large"
            ? "XL"
            : s;

  return (
    <div>
      <FilterSearch value={searchQuery} onChange={onSearchChange} />

      {allProductCategories.length > 0 && (
        <FilterSection title="Category">
          <div className="flex flex-col gap-2">
            {allProductCategories.map((cat) => (
              <CheckRow
                key={cat}
                label={cat}
                checked={selectedCategories.includes(cat)}
                count={products.filter((p) => p.category === cat).length}
                onChange={() => toggleCategory(cat)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* ── Size ── */}
      {allSizes.length > 0 && (
        <FilterSection title="Size" defaultOpen={true}>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  title={size}
                  onClick={() => toggleSize(size)}
                  className="transition-all duration-150"
                  style={{
                    minWidth: 36,
                    padding: "6px 10px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    borderRadius: "6px",
                    border: active
                      ? "1.5px solid var(--brand-teal)"
                      : "1.5px solid var(--nav-border)",
                    background: active ? "var(--brand-teal)" : "#fff",
                    color: active ? "#fff" : "var(--nav-fg)",
                    cursor: "pointer",
                  }}
                >
                  {sizeLabel(size)}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {allColors.length > 0 && (
        <FilterSection title="Colour" defaultOpen={true}>
          <div className="flex flex-wrap gap-2.5">
            {allColors.map(([name, hex]) => {
              const active = selectedColors.includes(name);
              return (
                <div key={name} className="relative group">
                  <button
                    onClick={() => toggleColor(name)}
                    title={name}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: hex,
                      border: active
                        ? "2px solid var(--brand-teal)"
                        : "2px solid rgba(0,0,0,0.12)",
                      outline: active ? "2px solid var(--brand-teal)" : "none",
                      outlineOffset: 2,
                      cursor: "pointer",
                      padding: 0,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "var(--brand-teal)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "rgba(0,0,0,0.12)";
                    }}
                  />
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded text-[10px] font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-10"
                    style={{ background: "var(--nav-fg)", color: "#fff" }}
                  >
                    {name}
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: "4px solid transparent",
                        borderRight: "4px solid transparent",
                        borderTop: "4px solid var(--nav-fg)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {selectedColors.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedColors.map((c) => (
                <span
                  key={c}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(25,99,94,0.08)",
                    color: "var(--brand-teal)",
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </FilterSection>
      )}

      {/* ── Price Range ── */}
      <FilterSection title="Price Range" defaultOpen={true}>
        <div className="flex items-center gap-2">
          {[
            { ph: "Min", val: minPrice, set: onMinPrice },
            { ph: "Max", val: maxPrice, set: onMaxPrice },
          ].map(({ ph, val, set }) => (
            <div
              key={ph}
              className="flex items-center gap-1.5 flex-1"
              style={{
                border: "1px solid var(--nav-border)",
                borderRadius: "6px",
                padding: "6px 10px",
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                ₹
              </span>
              <input
                type="number"
                placeholder={ph}
                value={val}
                onChange={(e) => set(e.target.value)}
                min={0}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: "0.8rem",
                  color: "var(--nav-fg)",
                  fontFamily: "var(--nav-font-ui)",
                }}
              />
            </div>
          ))}
        </div>
        {(minPrice || maxPrice) && (
          <button
            onClick={onClearPrice}
            className="mt-2 text-[10px] font-bold"
            style={{
              color: "var(--brand-teal)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Clear price
          </button>
        )}
      </FilterSection>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="mt-4 w-full py-2 text-[0.7rem] font-bold tracking-[0.12em] uppercase transition-all duration-150"
          style={{
            border: "1px solid var(--nav-border)",
            color: "var(--nav-fg-muted)",
            background: "transparent",
            cursor: "pointer",
            borderRadius: "6px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "var(--brand-teal)";
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--brand-teal)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor =
              "var(--nav-border)";
            (e.currentTarget as HTMLButtonElement).style.color =
              "var(--nav-fg-muted)";
          }}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-2xl overflow-hidden"
      style={{ background: "#fff", border: "1px solid var(--nav-border)" }}
    >
      <div style={{ aspectRatio: "3/4", background: "var(--nav-border)" }} />
      <div
        className="p-3 flex flex-col gap-2"
        style={{ background: "#dce8e5" }}
      >
        <div
          className="h-3 rounded w-3/4"
          style={{ background: "var(--nav-border)" }}
        />
        <div
          className="h-3 rounded w-1/2"
          style={{ background: "var(--nav-border)" }}
        />
        <div
          className="h-9 rounded-xl mt-2"
          style={{ background: "var(--nav-border)" }}
        />
      </div>
    </div>
  );
}

function CategoryBanner({
  config,
  productCount,
  loading,
}: {
  config: (typeof CATEGORY_CONFIG)[string];
  productCount: number;
  loading: boolean;
}) {
  return (
    <div
      className="relative mt-3 w-full overflow-hidden"
      style={{
        height: "clamp(350px, 48vw, 500px)",
      }}
    >
      <div className="hidden sm:block">
        <Image
          src={config.desktopBannerImage}
          alt={`${config.label} collection`}
          fill
          priority
          sizes="0vw sm:100vw"
          className="object-cover sm:object-center"
          style={{ zIndex: 0 }}
        />
      </div>
      <div className="block sm:hidden">
        <Image
          src={config.mobileBannerImage}
          alt={`${config.label} collection`}
          fill
          priority
          sizes="100vw sm:0vw"
          className="block sm:hidden object-cover sm:object-center"
          style={{ zIndex: 0 }}
        />
      </div>
      {/* ── Text content — sits above image and overlay ── */}
      <div className=" hidden sm:flex absolute inset-0 z-10  items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16">
          <div className="max-w-[700px]">
            {/* Tagline */}
            <p className="mb-4 text-[12px] md:text-[14px] font-semibold uppercase tracking-[0.25em] text-[#262018BF]">
              {config.tagline}
            </p>

            {/* Heading */}
            <h1 className="text-[#2E2722] uppercase font-bold leading-[0.9] tracking-[-0.03em] text-xl md:text-[64px] lg:text-6xl max-w-[700px]">
              {config.label}
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-[480px] text-[#2E2722BF] text-[18px] md:text-[20px] leading-[1.5] font-medium">
              {config.description}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-3">
              {config.features?.map((feature) => (
                <span
                  key={feature}
                  className="
        text-[14px]
        md:text-[18px]
        font-semibold
        uppercase
        tracking-[0.02em]
        text-[#262018]
      "
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const router = useRouter();

  const categoryKey = category.toLowerCase();
  const config = CATEGORY_CONFIG[categoryKey];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [sort, setSort] = useState<SortOption>("relevance");
  const [sortDropOpen, setSortDropOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!config) return;
    setLoading(true);
    setProducts([]);

    const param =
      config.filterType === "gender"
        ? `gender=${encodeURIComponent(config.filterValue)}`
        : `category=${encodeURIComponent(config.filterValue)}`;

    fetch(`/api/products?${param}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryKey]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setSortDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Unknown category slug → graceful 404 page ───────────────────────────────
  if (!config) {
    return (
      <main
        className="min-h-screen flex flex-col items-center justify-center text-center px-4"
        style={{
          background: "var(--brand-background-page)",
          paddingTop: "var(--nav-height)",
          fontFamily: "var(--nav-font-ui)",
          color: "var(--nav-fg)",
        }}
      >
        <h1
          className="text-4xl font-bold uppercase tracking-widest mb-4"
          style={{ fontFamily: "var(--nav-font)" }}
        >
          Category Not Found
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--nav-fg-muted)" }}>
          The category &quot;{category}&quot; does not exist.
        </p>
        <Link
          href="/products"
          className="px-6 py-3 text-[0.72rem] font-bold tracking-widest uppercase rounded-lg"
          style={{
            background: "var(--brand-teal)",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          Browse All Products
        </Link>
      </main>
    );
  }

  // ── Derived filter options — all sourced from actual fetched product data ───

  // allProductCategories = unique p.category values from inventory
  // e.g. ["Briefs", "Hoodies", "Trunks"] — dynamically populated, zero hardcoding
  const allProductCategories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products],
  );

  const allSizes = useMemo(() => {
    const order = ["Small", "Medium", "Large", "Extra Large", "XXL"];
    const set = new Set<string>();
    products.forEach((p) =>
      p.variants.forEach((v) => v.sizes?.forEach((s) => set.add(s.size))),
    );
    return [...set].sort((a, b) => {
      const ai = order.indexOf(a),
        bi = order.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [products]);

  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) =>
      p.variants.forEach((v) => {
        if (!map.has(v.colorName)) map.set(v.colorName, v.colorHex);
      }),
    );
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  // ── Toggles ─────────────────────────────────────────────────────────────────
  const toggleCategory = useCallback(
    (val: string) =>
      setSelectedCategories((prev) =>
        prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
      ),
    [],
  );
  const toggleSize = useCallback(
    (val: string) =>
      setSelectedSizes((prev) =>
        prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
      ),
    [],
  );
  const toggleColor = useCallback(
    (val: string) =>
      setSelectedColors((prev) =>
        prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
      ),
    [],
  );
  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
    setSort("relevance");
  }, []);

  const activeFilterCount =
    selectedCategories.length +
    selectedSizes.length +
    selectedColors.length +
    (minPrice || maxPrice ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // ── Client-side filter + sort ───────────────────────────────────────────────
  // Gender/category already handled server-side by the API.
  // Only secondary filters (category, size, colour, price, search) applied here.
  const filtered = useMemo(() => {
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;

    let list = products.filter((p) => {
      if (selectedCategories.length && !selectedCategories.includes(p.category))
        return false;
      if (
        selectedColors.length &&
        !p.variants.some((v) => selectedColors.includes(v.colorName))
      )
        return false;
      if (
        selectedSizes.length &&
        !p.variants.some((v) =>
          v.sizes?.some((s) => selectedSizes.includes(s.size) && s.stock > 0),
        )
      )
        return false;
      if (min !== null && p.price < min) return false;
      if (max !== null && p.price > max) return false;
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });

    if (sort === "price-asc")
      list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc")
      list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "name-asc")
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [
    products,
    selectedCategories,
    selectedSizes,
    selectedColors,
    minPrice,
    maxPrice,
    searchQuery,
    sort,
  ]);

  const handleNavigate = useCallback(
    (slug: string) => {
      sessionStorage.setItem("pl_scroll", String(window.scrollY));
      router.push(`/products/${slug}`);
    },
    [router],
  );

  const filtersPanelProps: FiltersPanelProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    allProductCategories,
    selectedCategories,
    toggleCategory,
    allSizes,
    selectedSizes,
    toggleSize,
    allColors,
    selectedColors,
    toggleColor,
    minPrice,
    maxPrice,
    onMinPrice: setMinPrice,
    onMaxPrice: setMaxPrice,
    onClearPrice: () => {
      setMinPrice("");
      setMaxPrice("");
    },
    activeFilterCount,
    clearFilters,
    products,
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-22px); } to { opacity:1; transform:translateX(0); } }
        .cp-sidebar { animation: slideInLeft 0.42s cubic-bezier(0.22,1,0.36,1) both; }
        .cp-card-item { opacity:0; animation: fadeUp 0.38s cubic-bezier(0.22,1,0.36,1) forwards; }
        .cp-card-item:nth-child(1)  { animation-delay:0.03s; }
        .cp-card-item:nth-child(2)  { animation-delay:0.07s; }
        .cp-card-item:nth-child(3)  { animation-delay:0.11s; }
        .cp-card-item:nth-child(4)  { animation-delay:0.15s; }
        .cp-card-item:nth-child(n+5){ animation-delay:0.17s; }
        @keyframes drawerIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }
        @keyframes backdropIn { from { opacity:0; } to { opacity:1; } }
        .cp-drawer { animation: drawerIn 0.26s cubic-bezier(0.32,0,0.67,0) both; }
        .cp-backdrop { animation: backdropIn 0.2s ease both; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        input[type=number] { -moz-appearance:textfield; }
      `}</style>

      <main
        className="min-h-screen"
        style={{
          background: "var(--brand-background-page)",
          paddingTop: "var(--nav-height)",
          fontFamily: "var(--nav-font-ui)",
          color: "var(--nav-fg)",
        }}
      >
        {/* ══ Banner — real image background, text overlay ══ */}
        <CategoryBanner
          config={config}
          productCount={filtered.length}
          loading={loading}
        />

        {/* ══ Toolbar ══ */}
        <div
          className="border-b px-4 md:px-8 py-3"
          style={{ borderColor: "var(--nav-border)", background: "#fff" }}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <span
              className="text-[0.75rem] font-semibold"
              style={{ color: "var(--nav-fg-muted)" }}
            >
              {loading
                ? "Loading…"
                : `${filtered.length} Result${filtered.length !== 1 ? "s" : ""}`}
            </span>

            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setSortDropOpen((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 text-[0.72rem] font-semibold tracking-wide transition-colors duration-150"
                  style={{
                    border: "1px solid var(--nav-border)",
                    background: sortDropOpen ? "var(--brand-teal)" : "#fff",
                    color: sortDropOpen ? "#fff" : "var(--nav-fg)",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}
                >
                  Sort: {SORT_LABELS[sort]}
                  <ChevronDown size={13} />
                </button>
                {sortDropOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 py-1"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--nav-border)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      borderRadius: "8px",
                      zIndex: 9999,
                    }}
                  >
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSort(key);
                          setSortDropOpen(false);
                        }}
                        className="flex w-full text-left px-4 py-2.5 text-[0.78rem] transition-colors duration-100"
                        style={{
                          color:
                            sort === key
                              ? "var(--brand-teal)"
                              : "var(--nav-fg)",
                          fontWeight: sort === key ? 700 : 400,
                          background:
                            sort === key
                              ? "rgba(25,99,94,0.06)"
                              : "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(25,99,94,0.06)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            sort === key
                              ? "rgba(25,99,94,0.06)"
                              : "transparent")
                        }
                      >
                        {SORT_LABELS[key]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile filter button */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-4 py-2 text-[0.72rem] font-bold tracking-widest uppercase"
                style={{
                  border: "1px solid var(--nav-border)",
                  background:
                    activeFilterCount > 0 ? "var(--brand-teal)" : "#fff",
                  color: activeFilterCount > 0 ? "#fff" : "var(--nav-fg)",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                <SlidersHorizontal size={13} />
                Filter
                {activeFilterCount > 0 && (
                  <span
                    className="ml-0.5 w-4 h-4 rounded-full text-[0.6rem] font-black flex items-center justify-center"
                    style={{ background: "#fff", color: "var(--brand-teal)" }}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active filter pills */}
            {activeFilterCount > 0 && (
              <div className="w-full flex flex-wrap items-center gap-2 pt-1">
                <span
                  className="text-[0.65rem] font-bold tracking-[0.14em] uppercase"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Active:
                </span>
                {[
                  ...selectedCategories,
                  ...selectedSizes,
                  ...selectedColors,
                ].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      if (selectedCategories.includes(val)) toggleCategory(val);
                      else if (selectedSizes.includes(val)) toggleSize(val);
                      else toggleColor(val);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[0.68rem] font-semibold"
                    style={{
                      background: "rgba(25,99,94,0.08)",
                      border: "1px solid var(--brand-teal)",
                      color: "var(--brand-teal)",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {val} <X size={10} />
                  </button>
                ))}
                {(minPrice || maxPrice) && (
                  <button
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[0.68rem] font-semibold"
                    style={{
                      background: "rgba(25,99,94,0.08)",
                      border: "1px solid var(--brand-teal)",
                      color: "var(--brand-teal)",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ₹{minPrice || "0"}–₹{maxPrice || "∞"} <X size={10} />
                  </button>
                )}
                <button
                  onClick={clearFilters}
                  style={{
                    color: "var(--nav-fg-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    textDecoration: "underline",
                  }}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ══ Content: sidebar + grid ══ */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex gap-8">
          {/* Desktop sidebar */}
          <aside
            className="cp-sidebar hidden md:block shrink-0 sticky h-fit"
            style={{ width: 248, top: "calc(var(--nav-height) + 16px)" }}
          >
            <div
              className="rounded-xl py-1 overflow-hidden"
              style={{
                background: "#fff",
                border: "1px solid var(--nav-border)",
                boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid var(--nav-border)" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[0.7rem] font-bold tracking-[0.16em] uppercase"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    Filter Products
                  </span>
                  {activeFilterCount > 0 && (
                    <span
                      className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(25,99,94,0.1)",
                        color: "var(--brand-teal)",
                      }}
                    >
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
              </div>
              <div className="px-4">
                <FiltersPanel {...filtersPanelProps} />
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-16 h-16 flex items-center justify-center mb-5"
                  style={{
                    background: "rgba(25,99,94,0.08)",
                    border: "1px solid var(--nav-border)",
                    borderRadius: "12px",
                  }}
                >
                  <Search
                    size={24}
                    style={{ color: "var(--brand-teal)", opacity: 0.6 }}
                  />
                </div>
                <h3
                  className="text-lg font-bold uppercase tracking-widest mb-2"
                  style={{
                    fontFamily: "var(--nav-font)",
                    color: "var(--nav-fg)",
                  }}
                >
                  No products found
                </h3>
                <p
                  className="text-sm mb-6"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  Try adjusting your filters or{" "}
                  <Link
                    href="/products"
                    style={{ color: "var(--brand-teal)", fontWeight: 600 }}
                  >
                    browse all products
                  </Link>
                  .
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 text-[0.72rem] font-bold tracking-[0.12em] uppercase rounded-lg"
                    style={{
                      background: "var(--brand-teal)",
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div
                key={`${selectedCategories.join()}-${selectedSizes.join()}-${selectedColors.join()}-${sort}-${searchQuery}-${minPrice}-${maxPrice}`}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
              >
                {filtered.map((product) => (
                  <div key={product._id} className="cp-card-item">
                    <ProductCard
                      product={product as any}
                      onNavigate={handleNavigate}
                    />
                  </div>
                ))}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <p
                className="text-center text-[0.65rem] tracking-widest uppercase mt-8"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Showing {filtered.length} of {products.length} products
              </p>
            )}
          </div>
        </div>

        {/* ══ Mobile filter drawer ══ */}
        {mobileFiltersOpen && (
          <>
            <div
              className="cp-backdrop fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.4)" }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div
              className="cp-drawer fixed top-0 left-0 bottom-0 z-50 flex flex-col"
              style={{
                width: "min(320px, 88vw)",
                background: "var(--nav-bg)",
                borderRight: "1px solid var(--nav-border)",
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{
                  borderBottom: "1px solid var(--nav-border)",
                  background: "#fff",
                  height: "var(--nav-height)",
                }}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    size={15}
                    style={{ color: "var(--brand-teal)" }}
                  />
                  <span
                    className="text-[0.8rem] font-bold tracking-[0.12em] uppercase"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    Filter
                  </span>
                  {activeFilterCount > 0 && (
                    <span
                      className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(25,99,94,0.1)",
                        color: "var(--brand-teal)",
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--nav-fg-muted)",
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <FiltersPanel {...filtersPanelProps} />
              </div>
              <div
                className="shrink-0 p-4"
                style={{
                  borderTop: "1px solid var(--nav-border)",
                  background: "#fff",
                }}
              >
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 text-[0.75rem] font-bold tracking-[0.14em] uppercase rounded-lg"
                  style={{
                    background: "var(--brand-teal)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Apply · {filtered.length} result
                  {filtered.length !== 1 ? "s" : ""}
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="w-full mt-2 py-2 text-[0.7rem] font-bold tracking-widest uppercase rounded-lg"
                    style={{
                      border: "1px solid var(--nav-border)",
                      color: "var(--nav-fg-muted)",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    Reset All
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
