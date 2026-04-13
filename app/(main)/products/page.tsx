"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import ProductCard from "@/components/productCard";

interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
}

interface Product {
  _id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  variants: ProductVariant[];
}

type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevance",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Name: A-Z",
};

// Accordion filter section
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
    <div className="border-b border-[var(--nav-border)] py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-[0.7rem] font-bold tracking-[0.14em] uppercase text-[var(--nav-fg)]">
          {title}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-[var(--nav-fg-muted)]" />
        ) : (
          <ChevronDown size={14} className="text-[var(--nav-fg-muted)]" />
        )}
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? "400px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="pt-3">{children}</div>
      </div>
    </div>
  );
}

export function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [sortDropOpen, setSortDropOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Init from URL params
  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("q");
    if (cat) setSelectedCategories([cat]);
    if (q) setSearchQuery(q);
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        const list: Product[] = d.products || [];
        setProducts(list);
        if (list.length > 0) {
          const prices = list.map((p) => p.price);
          const max = Math.max(...prices);
          setMaxPrice(max);
          setPriceRange([0, max]);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Derived filter options
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const allColors = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) =>
      p.variants.forEach((v) => {
        if (!map.has(v.colorName)) map.set(v.colorName, v.colorHex);
      }),
    );
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  // Toggle helpers
  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const toggleColor = useCallback((color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setPriceRange([0, maxPrice]);
    setSearchQuery("");
    setSort("relevance");
  }, [maxPrice]);

  // Filtered + sorted products
  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (selectedCategories.length && !selectedCategories.includes(p.category))
        return false;
      if (
        selectedColors.length &&
        !p.variants.some((v) => selectedColors.includes(v.colorName))
      )
        return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (
        searchQuery &&
        !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });

    switch (sort) {
      case "price-asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return list;
  }, [
    products,
    selectedCategories,
    selectedColors,
    priceRange,
    searchQuery,
    sort,
  ]);

  const activeFilterCount =
    selectedCategories.length +
    selectedColors.length +
    (priceRange[1] < maxPrice || priceRange[0] > 0 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const handleNavigate = useCallback(
    (slug: string) => {
      sessionStorage.setItem("pl_scroll", String(window.scrollY));
      router.push(`/products/${slug}`);
    },
    [router],
  );

  // Skeleton cards
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white border border-(--nav-border)">
      <div className="aspect-[3/4] bg-[var(--nav-border)]" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3 rounded w-3/4 bg-[var(--nav-border)]" />
        <div className="h-3 rounded w-1/2 bg-[var(--nav-border)]" />
        <div className="flex gap-2 mt-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-[var(--nav-border)]"
            />
          ))}
        </div>
      </div>
    </div>
  );

  const FiltersPanel = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={mobile ? "p-5" : ""}>
      <div className="mb-1">
        <div className="flex items-center gap-2 px-3 py-2 border border-[var(--nav-border)] bg-white focus-within:border-[var(--nav-accent)] transition-colors duration-150">
          <Search size={13} className="text-[var(--nav-fg-muted)] shrink-0" />
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[0.82rem] text-[var(--nav-fg)] placeholder:text-[var(--nav-fg-muted)]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")}>
              <X size={12} className="text-[var(--nav-fg-muted)]" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection title="Category">
          <div className="flex flex-col gap-2">
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              const checked = selectedCategories.includes(cat);
              return (
                <label
                  key={cat}
                  className="flex items-center justify-between gap-2 cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => toggleCategory(cat)}
                      className={`w-4 h-4 border transition-all duration-150 flex items-center justify-center cursor-pointer ${
                        checked
                          ? "bg-[var(--nav-accent)] border-[var(--nav-accent)]"
                          : "border-[var(--nav-border)] group-hover:border-[var(--nav-accent)]"
                      }`}
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
                      className={`text-[0.82rem] transition-colors duration-150 ${
                        checked
                          ? "text-[var(--nav-fg)] font-semibold"
                          : "text-[var(--nav-fg-muted)]"
                      }`}
                      onClick={() => toggleCategory(cat)}
                    >
                      {cat}
                    </span>
                  </div>
                  <span className="text-[0.65rem] font-bold text-[var(--nav-fg-muted)]">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Colour */}
      {allColors.length > 0 && (
        <FilterSection title="Colour">
          <div className="flex flex-col gap-2.5">
            {allColors.map(([name, hex]) => {
              const checked = selectedColors.includes(name);
              return (
                <label
                  key={name}
                  className="flex items-center gap-2.5 cursor-pointer group"
                  onClick={() => toggleColor(name)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 transition-all duration-150 ${
                      checked
                        ? "border-[var(--nav-accent)] outline outline-2 outline-[var(--nav-accent)] outline-offset-1"
                        : "border-[var(--nav-border)] group-hover:border-[var(--nav-accent)]"
                    }`}
                    style={{ background: hex }}
                  />
                  <span
                    className={`text-[0.82rem] transition-colors duration-150 ${
                      checked
                        ? "text-[var(--nav-fg)] font-semibold"
                        : "text-[var(--nav-fg-muted)]"
                    }`}
                  >
                    {name}
                  </span>
                </label>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Price */}
      {maxPrice > 0 && (
        <FilterSection title="Price Range">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[0.75rem] font-bold text-[var(--nav-accent)]">
                ₹{priceRange[0].toLocaleString()}
              </span>
              <span className="text-[0.75rem] font-bold text-[var(--nav-accent)]">
                ₹{priceRange[1].toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={50}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], Number(e.target.value)])
              }
              className="w-full accent-(--nav-accent) cursor-pointer"
            />
          </div>
        </FilterSection>
      )}

      {/* Clear */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="mt-4 w-full py-2 text-[0.7rem] font-bold tracking-[0.12em] uppercase border border-[var(--nav-border)] text-[var(--nav-fg-muted)] hover:border-[var(--nav-accent)] hover:text-[var(--nav-accent)] transition-all duration-150"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes gridFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pl-header { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
        .pl-sidebar { animation: slideInLeft 0.55s 0.1s cubic-bezier(0.22,1,0.36,1) both; }
        .pl-grid { animation: gridFadeIn 0.55s 0.15s cubic-bezier(0.22,1,0.36,1) both; }

        .pl-card-item {
          opacity: 0;
          animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .pl-card-item:nth-child(1)  { animation-delay: 0.05s; }
        .pl-card-item:nth-child(2)  { animation-delay: 0.10s; }
        .pl-card-item:nth-child(3)  { animation-delay: 0.15s; }
        .pl-card-item:nth-child(4)  { animation-delay: 0.20s; }
        .pl-card-item:nth-child(5)  { animation-delay: 0.22s; }
        .pl-card-item:nth-child(6)  { animation-delay: 0.24s; }
        .pl-card-item:nth-child(n+7){ animation-delay: 0.26s; }

        /* Mobile drawer */
        @keyframes drawerIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .pl-drawer { animation: drawerIn 0.28s cubic-bezier(0.32,0,0.67,0) both; }
        .pl-backdrop { animation: backdropIn 0.22s ease both; }

        /* Active filter pill */
        .pl-pill-exit { animation: fadeUp 0.2s reverse; }

        /* Range slider thumb */
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--nav-accent);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        input[type='range']::-webkit-slider-runnable-track {
          height: 4px;
          background: var(--nav-border);
          border-radius: 2px;
        }
      `}</style>

      <main
        className="min-h-screen"
        style={{
          background: "var(--nav-bg)",
          fontFamily: "var(--nav-font-ui)",
          color: "var(--nav-fg)",
        }}
      >
        {/* Top accent line */}
        <div
          className="h-0.5 w-full"
          style={{ background: "var(--nav-accent)" }}
        />

        {/* Page Header */}
        <div
          ref={headerRef}
          className={`pl-header border-b px-4 md:px-8 py-8 md:py-10 ${mounted ? "" : "opacity-0"}`}
          style={{ borderColor: "var(--nav-border)" }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p
                className="text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-2"
                style={{ color: "var(--nav-accent)" }}
              >
                Our Collection
              </p>
              <h1
                className="text-3xl md:text-5xl font-bold uppercase tracking-widest leading-tight"
                style={{
                  fontFamily: "var(--nav-font)",
                  color: "var(--nav-fg)",
                }}
              >
                All Products
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <div
                  className="h-px w-8"
                  style={{ background: "var(--nav-border)" }}
                />
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: "var(--nav-accent)" }}
                />
                <div
                  className="h-px w-8"
                  style={{ background: "var(--nav-border)" }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Result count */}
              <span
                className="text-[0.75rem] font-semibold tracking-wide"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                {loading
                  ? "Loading…"
                  : `${filtered.length} Result${filtered.length !== 1 ? "s" : ""}`}
              </span>

              {/* Sort dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setSortDropOpen((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2 text-[0.72rem] font-semibold tracking-wide border transition-colors duration-150"
                  style={{
                    border: "1px solid var(--nav-border)",
                    background: sortDropOpen ? "var(--nav-accent)" : "white",
                    color: sortDropOpen ? "white" : "var(--nav-fg)",
                  }}
                >
                  Sort By: {SORT_LABELS[sort]}
                  <ChevronDown size={13} />
                </button>
                {sortDropOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 z-30 min-w-45 py-1 shadow-lg"
                    style={{
                      background: "white",
                      border: "1px solid var(--nav-border)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    }}
                  >
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSort(key);
                          setSortDropOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2.5 text-[0.78rem] transition-colors duration-100"
                        style={{
                          color:
                            sort === key
                              ? "var(--nav-accent)"
                              : "var(--nav-fg)",
                          fontWeight: sort === key ? 700 : 400,
                          background:
                            sort === key
                              ? "rgba(200,169,126,0.08)"
                              : "transparent",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(200,169,126,0.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            sort === key
                              ? "rgba(200,169,126,0.08)"
                              : "transparent")
                        }
                      >
                        {SORT_LABELS[key]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden flex items-center gap-1.5 px-4 py-2 text-[0.72rem] font-bold tracking-widest uppercase"
                style={{
                  border: "1px solid var(--nav-border)",
                  background:
                    activeFilterCount > 0 ? "var(--nav-accent)" : "white",
                  color: activeFilterCount > 0 ? "white" : "var(--nav-fg)",
                }}
              >
                <SlidersHorizontal size={13} />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-0.5 w-4 h-4 rounded-full bg-white text-(--nav-accent) text-[0.6rem] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="max-w-7xl mx-auto mt-4 flex flex-wrap items-center gap-2">
              <span
                className="text-[0.65rem] font-bold tracking-[0.14em] uppercase"
                style={{ color: "var(--nav-fg-muted)" }}
              >
                Active:
              </span>
              {selectedCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[0.68rem] font-semibold transition-all duration-150"
                  style={{
                    background: "rgba(200,169,126,0.12)",
                    border: "1px solid var(--nav-accent)",
                    color: "var(--nav-accent)",
                  }}
                >
                  {cat} <X size={10} />
                </button>
              ))}
              {selectedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[0.68rem] font-semibold transition-all duration-150"
                  style={{
                    background: "rgba(200,169,126,0.12)",
                    border: "1px solid var(--nav-accent)",
                    color: "var(--nav-accent)",
                  }}
                >
                  {color} <X size={10} />
                </button>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                <button
                  onClick={() => setPriceRange([0, maxPrice])}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[0.68rem] font-semibold transition-all duration-150"
                  style={{
                    background: "rgba(200,169,126,0.12)",
                    border: "1px solid var(--nav-accent)",
                    color: "var(--nav-accent)",
                  }}
                >
                  ₹{priceRange[0]}–₹{priceRange[1]} <X size={10} />
                </button>
              )}
              <button
                onClick={clearFilters}
                className="text-[0.68rem] font-bold tracking-wide underline underline-offset-2 transition-colors duration-150"
                style={{ color: "var(--nav-fg-muted)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--nav-accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--nav-fg-muted)")
                }
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex gap-8">
          <aside
            className={`pl-sidebar hidden md:block shrink-0 sticky top-(--nav-height) h-fit ${mounted ? "" : "opacity-0"}`}
            style={{ width: 240 }}
          >
            <div
              className="py-1"
              style={{
                background: "white",
                border: "1px solid var(--nav-border)",
                boxShadow: "0 2px 16px rgba(200,169,126,0.06)",
              }}
            >
              <div
                className="px-4 py-3 border-b"
                style={{ borderColor: "var(--nav-border)" }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[0.7rem] font-bold tracking-[0.16em] uppercase"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    Filters
                  </span>
                  {activeFilterCount > 0 && (
                    <span
                      className="text-[0.6rem] font-bold px-1.5 py-0.5"
                      style={{
                        background: "rgba(200,169,126,0.15)",
                        border: "1px solid rgba(200,169,126,0.3)",
                        color: "var(--nav-accent)",
                      }}
                    >
                      {activeFilterCount} active
                    </span>
                  )}
                </div>
              </div>
              <div className="px-4">
                <FiltersPanel />
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div
            ref={gridRef}
            className={`pl-grid flex-1 min-w-0 ${mounted ? "" : "opacity-0"}`}
          >
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
                    background: "rgba(200,169,126,0.1)",
                    border: "1px solid var(--nav-border)",
                  }}
                >
                  <Search
                    size={24}
                    style={{ color: "var(--nav-accent)", opacity: 0.6 }}
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
                  Try adjusting your filters or search term.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 text-[0.72rem] font-bold tracking-[0.12em] uppercase transition-colors duration-200"
                  style={{ background: "var(--nav-accent)", color: "white" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--nav-accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--nav-accent)")
                  }
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                key={`${selectedCategories.join()}-${selectedColors.join()}-${sort}-${searchQuery}`}
                className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
              >
                {filtered.map((product, i) => (
                  <div key={product._id} className="pl-card-item">
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

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <>
            <div
              className="pl-backdrop fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.4)" }}
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div
              className="pl-drawer fixed top-0 left-0 bottom-0 z-50 flex flex-col"
              style={{
                width: "min(320px, 88vw)",
                background: "var(--nav-bg)",
                borderRight: "1px solid var(--nav-border)",
              }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b shrink-0"
                style={{
                  borderColor: "var(--nav-border)",
                  background: "white",
                  height: "var(--nav-height)",
                }}
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal
                    size={15}
                    style={{ color: "var(--nav-accent)" }}
                  />
                  <span
                    className="text-[0.8rem] font-bold tracking-[0.12em] uppercase"
                    style={{ color: "var(--nav-fg)" }}
                  >
                    Filter
                  </span>
                  {activeFilterCount > 0 && (
                    <span
                      className="text-[0.6rem] font-bold px-1.5 py-0.5"
                      style={{
                        background: "rgba(200,169,126,0.15)",
                        border: "1px solid rgba(200,169,126,0.3)",
                        color: "var(--nav-accent)",
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1.5"
                  style={{ color: "var(--nav-fg-muted)" }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <FiltersPanel mobile />
              </div>

              {/* Apply button */}
              <div
                className="shrink-0 p-4 border-t"
                style={{
                  borderColor: "var(--nav-border)",
                  background: "white",
                }}
              >
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 text-[0.75rem] font-bold tracking-[0.14em] uppercase transition-colors duration-200"
                  style={{ background: "var(--nav-accent)", color: "white" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--nav-accent-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--nav-accent)")
                  }
                >
                  Apply
                  {filtered.length > 0 &&
                    ` · ${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
                </button>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="w-full mt-2 py-2 text-[0.7rem] font-bold tracking-widest uppercase border transition-all duration-150"
                    style={{
                      border: "1px solid var(--nav-border)",
                      color: "var(--nav-fg-muted)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--nav-accent)";
                      e.currentTarget.style.color = "var(--nav-accent)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--nav-border)";
                      e.currentTarget.style.color = "var(--nav-fg-muted)";
                    }}
                  >
                    Reset
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
export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}
