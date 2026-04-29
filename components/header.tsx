"use client";
import { useAuth } from "@/context/authContext";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  X,
  Menu,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Package,
  LogOut,
  Loader2,
  User,
} from "lucide-react";
import "@/app/globals.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";
import Image from "next/image";
import UserMenu from "@/components/userMenu";

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

const NAV_ITEMS = [
  {
    label: "Men",
    categories: [
      { title: "Trunks", links: ["BAMBUMM CORE", "BAMBUMM VERT-S"] },
      {
        title: "Briefs",
        links: ["BAMBUMM CORE", "BAMBUMM VERT-S"],
      },
      {
        title: "Vest",
        links: ["BAMBUMM CORE", "BAMBUMM VERT-S"],
      },
      { title: "Deals", links: [] },
    ],
  },
  {
    label: "Women",
    categories: [
      {
        title: "Hipster",
        links: ["BAMBUMM CORE", "BAMBUMM VERT-S", "SPORT DIVA"],
      },
      {
        title: "Boy Short Panty",
        links: ["BAMBUMM CORE", "BAMBUMM VERT-S", "SPORT DIVA", "LUNARA"],
      },
      { title: "Lounge Bra", links: ["SEOUL SWAY BRA"] },
      { title: "Deals", links: [] },
    ],
  },
  {
    label: "Accessories",
    categories: [
      { title: "Balaclava", links: ["ZORO"] },
      { title: "Multi Purpose Band", links: ["BANDX (suggestion)"] },
      { title: "Snood Cap", links: ["BAMBUMM CozyWrap"] },
      { title: "Deals", links: [] },
    ],
  },
];

const DEBOUNCE_MS = 280;
const MAX_RESULTS = 6;

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchWrapRef.current &&
        !searchWrapRef.current.contains(e.target as Node)
      )
        setSuggestionsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
        :root {
          --mega-bg: #ffffff;
          --mega-col-title-fg: #0a0a0a;
          --mega-link-fg: var(--nav-accent);
          --mega-link-hover-fg: var(--nav-accent-hover);
          --mega-divider: #e0e0e0;
        }

        @keyframes badgePop {
          0%   { transform: translate(30%,-30%) scale(1); }
          40%  { transform: translate(30%,-30%) scale(1.4); }
          70%  { transform: translate(30%,-30%) scale(0.9); }
          100% { transform: translate(30%,-30%) scale(1); }
        }
        .cart-badge-pop { animation: badgePop 0.35s cubic-bezier(0.22,1,0.36,1); }

        /* ── Mega menu ── */
        .mega-menu {
          position: absolute;
          top: calc(var(--nav-height) + 1px);
          left: 0;
          right: 0;
          background: var(--mega-bg);
          border-bottom: 1px solid var(--mega-divider);
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          animation: menuIn 0.18s ease;
          z-index: 40;
        }
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Category title */
        .mega-col-title {
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          text-transform: capitalize;
          color: var(--mega-col-title-fg);
          margin: 0 0 14px;
          font-family: var(--nav-font-ui);
        }

        /* Category links */
        .mega-link {
          display: block;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--mega-link-fg);
          padding: 3px 0;
          transition: color 0.15s;
          cursor: pointer;
          text-decoration: none;
        }
        .mega-link:hover {
          color: var(--mega-link-hover-fg);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* Vertical divider */
        .mega-col-divider {
          width: 1px;
          background: var(--mega-divider);
          align-self: stretch;
          flex-shrink: 0;
          margin: 0 36px;
        }

        /* ── Search suggestion panel ── */
        .hdr-suggest-panel {
          position: absolute;
          top: calc(100% + 4px);
          left: 0; right: 0;
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
          display: flex; align-items: center; gap: 12px;
          padding: 9px 14px; cursor: pointer;
          transition: background 0.12s ease;
          border-bottom: 1px solid var(--nav-border);
        }
        .hdr-suggest-item:last-child { border-bottom: none; }
        .hdr-suggest-item:hover, .hdr-suggest-item.active { background: rgba(200,169,126,0.08); }
        .hdr-suggest-thumb {
          width: 40px; height: 52px; flex-shrink: 0;
          overflow: hidden; border: 1px solid var(--nav-border);
          position: relative; background: var(--nav-bg);
        }
        .hdr-suggest-name {
          font-family: var(--nav-font); font-size: 0.8125rem; font-weight: 700;
          color: var(--nav-fg); white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .hdr-suggest-cat {
          font-size: 0.68rem; color: var(--nav-fg-muted);
          letter-spacing: 0.06em; text-transform: uppercase; margin-top: 2px;
        }
        .hdr-suggest-price {
          font-family: var(--nav-font); font-size: 0.8125rem; font-weight: 700;
          color: var(--nav-accent); flex-shrink: 0; margin-left: auto;
        }
        .hdr-suggest-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 14px; border-top: 1px solid var(--nav-border);
          background: rgba(200,169,126,0.04);
        }
        .hdr-suggest-hint { font-size: 0.62rem; color: var(--nav-fg-muted); letter-spacing: 0.1em; text-transform: uppercase; }
        .hdr-suggest-viewall {
          font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--nav-accent);
          display: flex; align-items: center; gap: 4px;
          background: none; border: none; cursor: pointer;
          transition: color 0.15s; padding: 0;
        }
        .hdr-suggest-viewall:hover { color: var(--nav-accent-hover); }
        .hdr-suggest-empty { padding: 22px 14px; text-align: center; font-size: 0.8rem; color: var(--nav-fg-muted); }
        @keyframes hdrSpin { to { transform: rotate(360deg); } }
        .hdr-suggest-spinner { color: var(--nav-accent); animation: hdrSpin 0.8s linear infinite; flex-shrink: 0; }
      `}</style>

      <header className="nav-root">
        <div
          className="max-w-7xl mx-auto h-full flex items-center px-6"
          onMouseLeave={leave}
        >
          {/* Logo — left */}
          <Link
            href="/"
            className="bg-white rounded-2xl"
            style={{ flexShrink: 0 }}
          >
            <img className="w-15" src="/logo.png" alt="" />
          </Link>

          {/* ── Desktop nav — absolutely centred ── */}
          <nav
            className="desktop-only items-center gap-6"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.label}
                className={`nav-link${activeNav === item.label ? " active" : ""}`}
                onMouseEnter={() => enter(item.label)}
                aria-haspopup={item.categories.length > 0}
                aria-expanded={activeNav === item.label}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* ── Desktop right icons — pushed to right ── */}
          <div
            className="desktop-only items-center gap-1"
            style={{ marginLeft: "auto" }}
          >
            {/* Search */}
            <div
              ref={searchWrapRef}
              style={{
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
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
                      {searchLoading && (
                        <span
                          style={{
                            padding: "0 8px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Loader2 size={13} className="hdr-suggest-spinner" />
                        </span>
                      )}
                    </div>

                    {showSuggestions && (
                      <div className="hdr-suggest-panel">
                        {searchResults.length === 0 && !searchLoading ? (
                          <div className="hdr-suggest-empty">
                            No products found for &ldquo;{searchValue}&rdquo;
                          </div>
                        ) : (
                          <>
                            {searchResults.map((product, idx) => {
                              const img = product.variants[0]?.images?.[0];
                              return (
                                <div
                                  key={product._id}
                                  className={`hdr-suggest-item${cursor === idx ? " active" : ""}`}
                                  onClick={() =>
                                    navigateToProduct(product.slug)
                                  }
                                  onMouseEnter={() => setCursor(idx)}
                                >
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
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div className="hdr-suggest-name">
                                      {product.name}
                                    </div>
                                    <div className="hdr-suggest-cat">
                                      {product.category}
                                    </div>
                                  </div>
                                  <div className="hdr-suggest-price">
                                    ₹{product.price.toLocaleString("en-IN")}
                                  </div>
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

            <UserMenu />
          </div>

          {/* ── Mobile right icons ── */}
          <div
            className="mobile-only items-center gap-1"
            style={{ marginLeft: "auto" }}
          >
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

        {/* ── Mega dropdown ── */}
        {activeNav && activeItem && activeItem.categories.length > 0 && (
          <div
            className="mega-menu"
            onMouseEnter={() => enter(activeNav)}
            onMouseLeave={leave}
          >
            {/* Centred content — columns + dividers */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "28px 24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "stretch" }}>
                {activeItem.categories.map((cat, idx) => (
                  <div
                    key={cat.title}
                    style={{ display: "flex", alignItems: "stretch" }}
                  >
                    {/* Vertical divider before every column except the first */}
                    {idx > 0 && <div className="mega-col-divider" />}

                    <div style={{ minWidth: 130 }}>
                      <p className="mega-col-title">{cat.title}</p>
                      {cat.links.map((link, i) => (
                        <a key={i} className="mega-link">
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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

            <div
              className="drawer-footer"
              style={{ flexDirection: "column", gap: 0, padding: 0 }}
            >
              {user ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 20px",
                      borderBottom: "1px solid var(--nav-border)",
                      background: "var(--nav-bg)",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "var(--nav-accent)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        fontFamily: "var(--nav-font)",
                        flexShrink: 0,
                        border: "2px solid rgba(200,169,126,0.3)",
                      }}
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          referrerPolicy="no-referrer"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "var(--nav-fg)",
                          fontFamily: "var(--nav-font-ui)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--nav-fg-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          marginTop: 1,
                        }}
                      >
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", gap: 0, padding: "10px 16px" }}
                  >
                    <button
                      className="drawer-footer-btn"
                      onClick={() => {
                        closeDrawer();
                        openCart();
                      }}
                      style={{ flex: 1 }}
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
                    <button
                      onClick={logout}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        padding: "10px 16px",
                        background: "rgba(217,79,61,0.06)",
                        border: "1px solid rgba(217,79,61,0.2)",
                        borderRadius: 2,
                        color: "var(--nav-sale)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "var(--nav-font-ui)",
                        marginLeft: 8,
                        flexShrink: 0,
                      }}
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ display: "flex", gap: 12, padding: "10px 16px" }}>
                  <button
                    className="drawer-footer-btn"
                    onClick={() => {
                      closeDrawer();
                      router.push("/auth");
                    }}
                    style={{ flex: 1 }}
                  >
                    <User size={16} /> Sign In
                  </button>
                  <button
                    className="drawer-footer-btn"
                    onClick={() => {
                      closeDrawer();
                      openCart();
                    }}
                    style={{ flex: 1 }}
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
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
