"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  User,
  Search,
  X,
  Menu,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Package,
  Loader2,
} from "lucide-react";
import "@/app/globals.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";
import Image from "next/image";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ProductVariant {
  colorName: string;
  colorHex: string;
  images: string[];
}
interface SearchProduct {
  _id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  variants: ProductVariant[];
}

// ── Nav config ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Men",
    categories: [
      { title: "Trunks", links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"] },
      { title: "Briefs", links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"] },
      {
        title: "Vest",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
    ],
    featured: [
      { caption: "Explore the collection" },
      { caption: "Discover new arrivals" },
    ],
  },
  {
    label: "Women",
    categories: [
      { title: "Hipster", links: ["SAMPLE", "SAMPLE"] },
      {
        title: "Boy Short Panty",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
      { title: "Lounge Bra", links: ["SAMPLE"] },
    ],
    featured: [],
  },
  {
    label: "Accessories",
    categories: [
      { title: "Balaclava", links: ["SAMPLE", "SAMPLE", "SAMPLE"] },
      { title: "Multi Purpose Band", links: ["SAMPLE", "SAMPLE", "SAMPLE"] },
      { title: "Snood Cap", links: ["SAMPLE", "SAMPLE", "SAMPLE"] },
      { title: "Utility Pouch", links: ["SAMPLE", "SAMPLE", "SAMPLE"] },
    ],
    featured: [],
  },
];

const DEBOUNCE_MS = 280;
const MAX_RESULTS = 6;

// ── Main component ─────────────────────────────────────────────────────────────
export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const router = useRouter();

  // nav state
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  // refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── nav hover ────────────────────────────────────────────────────────────────
  const enter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveNav(label);
  };
  const leave = () => {
    timeoutRef.current = setTimeout(() => setActiveNav(null), 120);
  };
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  // ── drawer body lock ─────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // ── fetch suggestions ─────────────────────────────────────────────────────────
  const fetchSuggestions = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    setSearchLoading(true);
    try {
      const res = await fetch(
        `/api/products?q=${encodeURIComponent(q)}&limit=${MAX_RESULTS}`,
        { signal: abortRef.current.signal },
      );
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setSearchResults(
        (data.products as SearchProduct[]).slice(0, MAX_RESULTS),
      );
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== "AbortError") setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // ── debounce search ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const trimmed = searchValue.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSuggestionsOpen(false);
      setSearchLoading(false);
      setCursor(-1);
      return;
    }
    setSuggestionsOpen(true);
    setCursor(-1);
    timerRef.current = setTimeout(() => fetchSuggestions(trimmed), DEBOUNCE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchValue, fetchSuggestions]);

  // ── close suggestions on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      ) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── keyboard nav in suggestions ───────────────────────────────────────────────
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSuggestionsOpen(false);
      setSearchOpen(false);
      setSearchValue("");
      return;
    }
    if (!suggestionsOpen) {
      if (e.key === "Enter" && searchValue.trim()) {
        router.push(`/products?q=${encodeURIComponent(searchValue.trim())}`);
        setSearchOpen(false);
        setSearchValue("");
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (cursor >= 0 && searchResults[cursor]) {
        navigateToProduct(searchResults[cursor].slug);
      } else if (searchValue.trim()) {
        router.push(`/products?q=${encodeURIComponent(searchValue.trim())}`);
        setSuggestionsOpen(false);
        setSearchOpen(false);
        setSearchValue("");
      }
    }
  };

  const navigateToProduct = (slug: string) => {
    setSuggestionsOpen(false);
    setSearchOpen(false);
    setSearchValue("");
    router.push(`/products/${slug}`);
  };

  const clearSearch = () => {
    setSearchValue("");
    setSearchResults([]);
    setSuggestionsOpen(false);
    searchInputRef.current?.focus();
  };

  const activeItem = NAV_ITEMS.find((n) => n.label === activeNav);
  const activePanelItem = NAV_ITEMS.find((n) => n.label === activePanel);
  const closeDrawer = () => {
    setDrawerOpen(false);
    setActivePanel(null);
  };

  const showSuggestions = suggestionsOpen && searchValue.trim().length > 0;

  return (
    <>
      <style>{`
        /* Cart badge pop animation */
        @keyframes badgePop {
          0%   { transform: translate(30%, -30%) scale(1); }
          40%  { transform: translate(30%, -30%) scale(1.4); }
          70%  { transform: translate(30%, -30%) scale(0.9); }
          100% { transform: translate(30%, -30%) scale(1); }
        }
        .cart-badge-pop { animation: badgePop 0.35s cubic-bezier(0.22,1,0.36,1); }

        /* ── Header search suggestion panel ── */
        .hdr-suggest-panel {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1px solid var(--nav-border);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12);
          z-index: 200;
          overflow: hidden;
          animation: hdrSuggestIn 0.18s cubic-bezier(0.22,1,0.36,1);
          min-width: 320px;
        }
        @keyframes hdrSuggestIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hdr-suggest-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 14px;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          transition: background 0.12s ease;
          border-bottom: 1px solid var(--nav-border);
        }
        .hdr-suggest-item:last-child { border-bottom: none; }
        .hdr-suggest-item:hover,
        .hdr-suggest-item.active { background: rgba(200,169,126,0.08); }

        .hdr-suggest-thumb {
          width: 40px;
          height: 52px;
          flex-shrink: 0;
          overflow: hidden;
          border: 1px solid var(--nav-border);
          position: relative;
          background: var(--nav-bg);
        }

        .hdr-suggest-name {
          font-family: var(--nav-font);
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--nav-fg);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .hdr-suggest-cat {
          font-size: 0.68rem;
          color: var(--nav-fg-muted);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 2px;
        }
        .hdr-suggest-price {
          font-family: var(--nav-font);
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--nav-accent);
          flex-shrink: 0;
          margin-left: auto;
        }

        .hdr-suggest-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 14px;
          border-top: 1px solid var(--nav-border);
          background: rgba(200,169,126,0.04);
        }
        .hdr-suggest-hint {
          font-size: 0.62rem;
          color: var(--nav-fg-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .hdr-suggest-viewall {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--nav-accent);
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.15s;
          padding: 0;
        }
        .hdr-suggest-viewall:hover { color: var(--nav-accent-hover); }

        .hdr-suggest-empty {
          padding: 22px 14px;
          text-align: center;
          font-size: 0.8rem;
          color: var(--nav-fg-muted);
          font-family: var(--nav-font-ui);
        }

        @keyframes hdrSpin { to { transform: rotate(360deg); } }
        .hdr-suggest-spinner {
          color: var(--nav-accent);
          animation: hdrSpin 0.8s linear infinite;
          flex-shrink: 0;
        }
      `}</style>

      <header className="nav-root">
        <div
          className="max-w-7xl mx-auto h-full flex items-center gap-8 px-6"
          onMouseLeave={leave}
        >
          <Link href="/">
            <img className="w-20" src="/logo.png" alt="" />
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="desktop-only justify-center items-center gap-6 flex-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} style={{ position: "relative" }}>
                <button
                  className={`nav-link${activeNav === item.label ? " active" : ""}`}
                  onMouseEnter={() => enter(item.label)}
                  aria-haspopup={item.categories.length > 0}
                  aria-expanded={activeNav === item.label}
                >
                  {item.label}
                </button>

                {activeNav === item.label && (
                  <div
                    className="simple-dropdown"
                    onMouseEnter={() => enter(item.label)}
                  >
                    {item.categories[0]?.links.map((link, i) => (
                      <a key={i} className="simple-dropdown-link">
                        {link}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* ── Desktop right icons ── */}
          <div className="desktop-only items-center gap-1 ml-auto">
            {/* Search with suggestions */}
            <div
              ref={searchWrapRef}
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* Animated expanding search bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  overflow: "visible",
                  width: searchOpen ? 220 : 0,
                  opacity: searchOpen ? 1 : 0,
                  transition:
                    "width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
                  marginRight: searchOpen ? 4 : 0,
                  position: "relative",
                }}
              >
                {searchOpen && (
                  <div style={{ width: 220, position: "relative" }}>
                    {/* Input row — keeps existing .search-bar styling */}
                    <div className="search-bar" style={{ width: "100%" }}>
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search for products…"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={() => {
                          if (searchValue.trim() && searchResults.length > 0)
                            setSuggestionsOpen(true);
                        }}
                        style={{ width: "100%" }}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      {searchLoading ? (
                        <span
                          style={{
                            padding: "0 8px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Loader2 size={13} className="hdr-suggest-spinner" />
                        </span>
                      ) : (
                        searchValue && <> </>
                      )}
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestions && (
                      <div className="hdr-suggest-panel">
                        {searchResults.length === 0 && !searchLoading ? (
                          <div className="hdr-suggest-empty">
                            No products found for &ldquo;{searchValue}&rdquo;
                          </div>
                        ) : (
                          <>
                            {searchResults.map((product, idx) => {
                              const variant = product.variants[0];
                              const img = variant?.images?.[0];
                              return (
                                <div
                                  key={product._id}
                                  className={`hdr-suggest-item${cursor === idx ? " active" : ""}`}
                                  onClick={() =>
                                    navigateToProduct(product.slug)
                                  }
                                  onMouseEnter={() => setCursor(idx)}
                                >
                                  {/* Thumbnail */}
                                  <div className="hdr-suggest-thumb">
                                    {img ? (
                                      <Image
                                        src={img}
                                        alt={product.name}
                                        fill
                                        sizes="40px"
                                        className="object-cover object-center"
                                      />
                                    ) : (
                                      <div
                                        style={{
                                          width: "100%",
                                          height: "100%",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <Package
                                          size={13}
                                          style={{
                                            color: "var(--nav-accent)",
                                            opacity: 0.5,
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="hdr-suggest-name">
                                      {product.name}
                                    </div>
                                    <div className="hdr-suggest-cat">
                                      {product.category}
                                    </div>
                                  </div>

                                  {/* Price */}
                                  <div className="hdr-suggest-price">
                                    ₹{product.price.toLocaleString("en-IN")}
                                  </div>

                                  {/* Arrow */}
                                  <ArrowRight
                                    size={12}
                                    style={{
                                      color: "var(--nav-fg-muted)",
                                      flexShrink: 0,
                                      opacity: cursor === idx ? 1 : 0,
                                      transition: "opacity 0.15s",
                                    }}
                                  />
                                </div>
                              );
                            })}

                            {/* Footer */}
                            <div className="hdr-suggest-footer">
                              <span className="hdr-suggest-hint">
                                {searchResults.length} result
                                {searchResults.length !== 1 ? "s" : ""} · ↑↓ · ↵
                              </span>
                              <button
                                className="hdr-suggest-viewall"
                                onClick={() => {
                                  router.push(
                                    `/products?q=${encodeURIComponent(searchValue.trim())}`,
                                  );
                                  setSuggestionsOpen(false);
                                  setSearchOpen(false);
                                  setSearchValue("");
                                }}
                              >
                                View all <ArrowRight size={11} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Search toggle icon — unchanged styling */}
              <button
                className="icon-btn"
                onClick={() => {
                  setSearchOpen((prev) => {
                    const next = !prev;
                    if (next)
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                    else {
                      setSearchValue("");
                      setSuggestionsOpen(false);
                      setSearchResults([]);
                    }
                    return next;
                  });
                }}
                aria-label={searchOpen ? "Close search" : "Open search"}
              >
                {searchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
            </div>

            {/* Cart */}
            <button
              className="icon-btn"
              style={{ marginLeft: 8 }}
              onClick={openCart}
              aria-label={`Open cart, ${totalItems} items`}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span key={totalItems} className="cart-badge cart-badge-pop">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            <button className="icon-btn">
              <User size={20} />
            </button>
          </div>

          {/* ── Mobile right icons ── */}
          <div className="mobile-only items-center gap-1 ml-auto">
            <div className="search-bar search-bar-mobile">
              <input
                type="text"
                placeholder="Search…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchValue.trim()) {
                    router.push(
                      `/products?q=${encodeURIComponent(searchValue.trim())}`,
                    );
                    setSearchValue("");
                  }
                }}
                style={{ width: 120 }}
              />
              {searchValue ? (
                <button className="icon-btn" onClick={clearSearch}>
                  <X size={14} />
                </button>
              ) : (
                <button className="icon-btn">
                  <Search size={14} />
                </button>
              )}
            </div>

            <button
              className="icon-btn"
              onClick={openCart}
              aria-label={`Open cart, ${totalItems} items`}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span key={totalItems} className="cart-badge cart-badge-pop">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            <button
              className="icon-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* ── Mega/Simple dropdown ── */}
        {activeNav && activeItem && activeItem.categories.length > 0 && (
          <div
            className="mega-menu"
            onMouseEnter={() => enter(activeNav)}
            onMouseLeave={leave}
          >
            <div className="max-w-7xl mx-auto px-6 py-8 flex gap-12">
              <div
                style={{ display: "flex", gap: 48, flex: 1, flexWrap: "wrap" }}
              >
                {activeItem.categories.map((cat) => (
                  <div key={cat.title} style={{ minWidth: 110 }}>
                    <p className="mega-col-title">{cat.title}</p>
                    {cat.links.map((link, i) => (
                      <a key={i} className="mega-link">
                        {link}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
              {activeItem.featured.length > 0 && (
                <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
                  {activeItem.featured.map((f, i) => (
                    <div key={i} className="featured-card">
                      <span className="featured-card-caption">{f.caption}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <>
          <div
            className="drawer-overlay"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          <div className="drawer" role="dialog" aria-label="Navigation menu">
            <div className="drawer-header">
              <span className="nav-logo" style={{ fontSize: "1.2rem" }}>
                Bambumm
              </span>
              <button
                className="icon-btn"
                onClick={closeDrawer}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="drawer-nav">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  className="drawer-nav-item"
                  onClick={() =>
                    item.categories.length > 0
                      ? setActivePanel(item.label)
                      : closeDrawer()
                  }
                >
                  <span>{item.label}</span>
                  {item.categories.length > 0 && (
                    <ChevronRight
                      size={16}
                      style={{ color: "var(--nav-fg-muted)", flexShrink: 0 }}
                    />
                  )}
                </button>
              ))}

              {activePanel && activePanelItem && (
                <div className="drawer-panel">
                  <div className="drawer-panel-header">
                    <button
                      className="drawer-panel-back"
                      onClick={() => setActivePanel(null)}
                      aria-label="Back"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    {activePanelItem.label}
                  </div>
                  <div className="drawer-panel-body">
                    {activePanelItem.categories.map((cat) => (
                      <div key={cat.title}>
                        <p className="drawer-category-title">{cat.title}</p>
                        {cat.links.map((link, i) => (
                          <a
                            key={i}
                            className="drawer-category-link"
                            onClick={closeDrawer}
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </nav>

            <div className="drawer-footer">
              <button className="drawer-footer-btn">
                <User size={16} /> Account
              </button>
              <button
                className="drawer-footer-btn"
                onClick={() => {
                  closeDrawer();
                  openCart();
                }}
              >
                <ShoppingBag size={16} /> Cart
                {totalItems > 0 && (
                  <span
                    style={{
                      background: "var(--nav-accent)",
                      color: "#fff",
                      borderRadius: "99px",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "1px 6px",
                    }}
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
