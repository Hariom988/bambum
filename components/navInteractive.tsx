"use client";
import { useAuth } from "@/context/authContext";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  X,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Package,
  LogOut,
  Loader2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cartContext";
import Image from "next/image";
import UserMenu from "@/components/userMenu";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
}

export interface NavCategory {
  id: string;
  title: string;
  order: number;
  links: NavLink[];
}

export interface NavItem {
  _id: string;
  label: string;
  order: number;
  isActive: boolean;
  categories: NavCategory[];
  href?: string;
}

interface SearchProduct {
  _id: string;
  slug: string;
  name: string;
  price: number;
  category: string;
  variants: { colorName: string; colorHex: string; images: string[] }[];
}

// ─── Animated Hamburger Component ─────────────────────────────────────────────

function AnimatedHamburger({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="flex flex-col items-center justify-center w-9 h-9 gap-[5px] relative transition-colors duration-150 z-50 cursor-pointer"
      style={{ color: "var(--nav-fg)" }}
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      <span
        className={`block h-[1.5px] w-[22px] bg-current transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center ${
          isOpen ? "rotate-45 translate-y-[6.5px]" : ""
        }`}
      />
      <span
        className={`block h-[1.5px] w-[22px] bg-current transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
        }`}
      />
      <span
        className={`block h-[1.5px] w-[22px] bg-current transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] origin-center ${
          isOpen ? "-rotate-45 -translate-y-[6.5px]" : ""
        }`}
      />
    </button>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 280;
const MAX_RESULTS = 6;

// ─── Main component ───────────────────────────────────────────────────────────

export default function NavInteractive({ navItems }: { navItems: NavItem[] }) {
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

  // ── Mega menu hover ────────────────────────────────────────────────────────
  const enter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveNav(label);
  };
  const leave = () => {
    timeoutRef.current = setTimeout(() => setActiveNav(null), 120);
  };
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ── Global Event Listeners (Scroll Lock & Esc Key) ─────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) {
        setDrawerOpen(false);
        setActivePanel(null);
      }
    };

    if (drawerOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  // ── Search ─────────────────────────────────────────────────────────────────
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

  const activeItem = navItems.find((n) => n.label === activeNav);
  const activePanelItem = navItems.find((n) => n.label === activePanel);

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setActivePanel(null), 300);
  };

  const showSuggestions = suggestionsOpen && searchValue.trim().length > 0;

  return (
    <>
      <style>{`
        @keyframes badgePop {
          0%   { transform: translate(30%,-30%) scale(1); }
          40%  { transform: translate(30%,-30%) scale(1.4); }
          70%  { transform: translate(30%,-30%) scale(0.9); }
          100% { transform: translate(30%,-30%) scale(1); }
        }
        .cart-badge-pop { animation: badgePop 0.35s cubic-bezier(0.22,1,0.36,1); }
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-menu-in { animation: menuIn 0.18s ease; }
        @keyframes suggestIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim-suggest-in { animation: suggestIn 0.18s cubic-bezier(0.22,1,0.36,1); }
        @keyframes spin { to { transform: rotate(360deg); } }
        .anim-spin { animation: spin 0.8s linear infinite; }
      `}</style>

      {/* ── HEADER (Bumped z-index) ── */}
      <header
        className="fixed top-0 left-0 right-0 z-[99990] h-[(--nav-height)]"
        style={{
          background: "var(--nav-bg)",
          borderBottom: "1px solid var(--nav-border)",
        }}
      >
        <div
          className="max-w-7xl mx-auto h-full flex items-center px-4 md:px-10 relative"
          onMouseLeave={leave}
        >
          <div className="max-w-22">
            {/* Logo */}
            <Link
              href="/"
              className="shrink-0 rounded-2xl overflow-hidden block w-20"
            >
              <img className="w-full" src="/logo.png" alt="Bambumm" />
            </Link>
          </div>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden md:flex items-center gap-5 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) =>
              item.href ? (
                <Link
                  key={item._id}
                  href={item.href}
                  className={`
                    cursor-pointer text-[0.65rem] sm:text-[0.78rem]  font-bold tracking-widest uppercase transition-colors duration-150
                    border-b-2 pb-0.5 no-underline
                    ${
                      activeNav === item.label
                        ? "border-[(--nav-accent)] text-[(--nav-accent)]"
                        : "border-transparent text-[(--nav-fg)] hover:text-[(--nav-accent)]"
                    }
                  `}
                  style={{ fontFamily: "var(--nav-font-ui)" }}
                  onMouseEnter={leave}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item._id}
                  className={`
                   cursor-pointer text-[0.65rem] sm:text-[0.78rem] text-sm font-bold tracking-widest uppercase transition-colors duration-150
                    border-b-2 pb-0.5
                    ${
                      activeNav === item.label
                        ? "border-[(--nav-accent)] text-[(--nav-accent)]"
                        : "border-transparent text-[(--nav-fg)] hover:text-[(--nav-accent)]"
                    }
                  `}
                  style={{ fontFamily: "var(--nav-font-ui)" }}
                  onMouseEnter={() => enter(item.label)}
                  aria-haspopup={item.categories.length > 0}
                  aria-expanded={activeNav === item.label}
                >
                  {item.label}
                </button>
              ),
            )}
          </nav>

          <div className="hidden md:flex items-center gap-5 ml-auto">
            {/* Search */}
            <div ref={searchWrapRef} className="flex items-center relative">
              <div
                className="flex items-center overflow-visible transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                  width: searchOpen ? 220 : 0,
                  opacity: searchOpen ? 1 : 0,
                  marginRight: searchOpen ? 4 : 0,
                }}
              >
                {searchOpen && (
                  <div className="w-[220px] relative">
                    <div
                      className="flex items-center border px-3 py-2 w-full"
                      style={{
                        background: "var(--nav-bg)",
                        borderColor: "var(--nav-border)",
                      }}
                    >
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
                        className="flex-1 text-[0.75rem] font-semibold tracking-wide bg-transparent outline-none placeholder-[var(--nav-fg-muted)] min-w-0"
                        style={{ color: "var(--nav-fg)" }}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      {searchLoading && (
                        <Loader2
                          size={13}
                          className="anim-spin shrink-0 ml-2"
                          style={{ color: "var(--nav-accent)" }}
                        />
                      )}
                    </div>

                    {showSuggestions && (
                      <div
                        className="anim-suggest-in absolute top-full left-0 right-0 z-[200] border overflow-hidden min-w-[320px]"
                        style={{
                          background: "var(--nav-bg)",
                          borderColor: "var(--nav-border)",
                          boxShadow: "var(--nav-shadow)",
                          marginTop: 4,
                        }}
                      >
                        {searchResults.length === 0 && !searchLoading ? (
                          <p
                            className="px-4 py-6 text-center text-[0.8rem]"
                            style={{ color: "var(--nav-fg-muted)" }}
                          >
                            No products found for &ldquo;{searchValue}&rdquo;
                          </p>
                        ) : (
                          <>
                            {searchResults.map((product, idx) => {
                              const img = product.variants[0]?.images?.[0];
                              const isActive = cursor === idx;
                              return (
                                <div
                                  key={product._id}
                                  className="flex items-center gap-3 px-3.5 py-2.5 cursor-pointer border-b last:border-b-0 transition-colors duration-100"
                                  style={{
                                    borderColor: "var(--nav-border)",
                                    background: isActive
                                      ? "rgba(200,169,126,0.08)"
                                      : "transparent",
                                  }}
                                  onClick={() =>
                                    navigateToProduct(product.slug)
                                  }
                                  onMouseEnter={() => setCursor(idx)}
                                >
                                  <div
                                    className="w-10 h-[52px] shrink-0 overflow-hidden border relative"
                                    style={{
                                      borderColor: "var(--nav-border)",
                                      background: "var(--nav-bg)",
                                    }}
                                  >
                                    {img ? (
                                      <Image
                                        src={img}
                                        alt={product.name}
                                        fill
                                        sizes="40px"
                                        className="object-cover object-center"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package
                                          size={13}
                                          className="opacity-50"
                                          style={{ color: "var(--nav-accent)" }}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p
                                      className="text-[0.8125rem] font-bold uppercase tracking-[0.04em] truncate"
                                      style={{
                                        fontFamily: "var(--nav-font)",
                                        color: "var(--nav-fg)",
                                      }}
                                    >
                                      {product.name}
                                    </p>
                                    <p
                                      className="text-[0.68rem] uppercase tracking-[0.06em] mt-0.5"
                                      style={{ color: "var(--nav-fg-muted)" }}
                                    >
                                      {product.category}
                                    </p>
                                  </div>

                                  <span
                                    className="text-[0.8125rem] font-bold shrink-0 ml-auto"
                                    style={{
                                      fontFamily: "var(--nav-font)",
                                      color: "var(--nav-accent)",
                                    }}
                                  >
                                    ₹{product.price.toLocaleString("en-IN")}
                                  </span>

                                  <ArrowRight
                                    size={12}
                                    className="shrink-0 transition-opacity duration-150"
                                    style={{
                                      color: "var(--nav-fg-muted)",
                                      opacity: isActive ? 1 : 0,
                                    }}
                                  />
                                </div>
                              );
                            })}

                            <div
                              className="flex items-center justify-between px-3.5 py-2 border-t"
                              style={{
                                borderColor: "var(--nav-border)",
                                background: "rgba(200,169,126,0.04)",
                              }}
                            >
                              <span
                                className="text-[0.62rem] uppercase tracking-widest"
                                style={{ color: "var(--nav-fg-muted)" }}
                              >
                                {searchResults.length} result
                                {searchResults.length !== 1 ? "s" : ""} · ↑↓ · ↵
                              </span>
                              <button
                                className="flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-widest transition-colors duration-150 bg-transparent border-none cursor-pointer p-0"
                                style={{ color: "var(--nav-accent)" }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--nav-accent-hover)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color =
                                    "var(--nav-accent)")
                                }
                                onClick={() => {
                                  router.push(
                                    `/products?q=${encodeURIComponent(
                                      searchValue.trim(),
                                    )}`,
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
                className="flex items-center justify-center w-9 h-9 rounded transition-colors duration-150 cursor-pointer"
                style={{ color: "var(--nav-fg)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--nav-accent)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--nav-fg)")
                }
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

            {/* Checkout */}
            <button
              className="flex items-center justify-center w-9 h-9 rounded relative transition-colors duration-150 cursor-pointer"
              style={{ color: "var(--nav-fg)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--nav-accent)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--nav-fg)")
              }
              onClick={() => router.push("/checkout")}
              aria-label={`Open cart, ${totalItems} items`}
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span
                  key={totalItems}
                  className="cart-badge-pop absolute top-0 right-0 translate-x-[30%] -translate-y-[30%] min-w-[16px] h-4 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white px-1"
                  style={{ background: "var(--nav-accent)" }}
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>

            <UserMenu />
          </div>

          {/* ── MOBILE RIGHT ICONS (Removed Search & Cart, Just Hamburger) ── */}
          <div className="flex md:hidden items-center ml-auto mr-12">
            {/* Added right margin to stop the external portal 'N' from overlapping the menu */}
            <AnimatedHamburger
              isOpen={drawerOpen}
              onClick={() => setDrawerOpen(!drawerOpen)}
            />
          </div>
        </div>

        {/* ── MEGA DROPDOWN ── */}
        {activeNav && activeItem && activeItem.categories.length > 0 && (
          <div
            className="anim-menu-in absolute left-0 right-0 z-40 border-b"
            style={{
              top: "var(--nav-height)",
              background: "var(--mega-bg)",
              borderColor: "var(--mega-divider)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={() => enter(activeNav)}
            onMouseLeave={leave}
          >
            <div className="flex justify-center py-7 px-6">
              <div className="flex items-stretch">
                {activeItem.categories.map((cat, idx) => (
                  <div key={cat.id} className="flex items-stretch">
                    {idx > 0 && (
                      <div
                        className="w-px self-stretch shrink-0 mx-9"
                        style={{ background: "var(--mega-divider)" }}
                      />
                    )}
                    <div className="min-w-[130px]">
                      {cat.links[0] ? (
                        <Link
                          href={cat.links[0].href}
                          className="block text-[0.9rem] font-bold capitalize tracking-[0.01em] mb-3.5 no-underline transition-colors duration-150"
                          style={{
                            fontFamily: "var(--nav-font-ui)",
                            color: "var(--mega-col-title-fg)",
                          }}
                        >
                          {cat.title}
                        </Link>
                      ) : (
                        <p
                          className="text-[0.9rem] font-bold capitalize tracking-[0.01em] mb-3.5"
                          style={{
                            fontFamily: "var(--nav-font-ui)",
                            color: "var(--mega-col-title-fg)",
                          }}
                        >
                          {cat.title}
                        </p>
                      )}
                      {cat.links.slice(1).map((link, i) => (
                        <Link
                          key={i}
                          href={link.href}
                          className="block text-[0.72rem] font-semibold uppercase tracking-[0.09em] py-0.5 no-underline transition-colors duration-150 hover:underline underline-offset-[3px]"
                          style={{ color: "var(--nav-accent)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color =
                              "var(--mega-link-hover-fg)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--nav-accent)")
                          }
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── MOBILE DRAWER (Bumped z-index) ── */}
      <div
        className={`fixed inset-0 z-[99999] md:hidden ${
          drawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!drawerOpen}
      >
        {/* Overlay Backdrop */}
        <div
          className={`absolute inset-0 transition-opacity duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            drawerOpen ? "opacity-100" : "opacity-0"
          }`}
          style={{ background: "var(--nav-overlay, rgba(0,0,0,0.5))" }}
          onClick={closeDrawer}
        />

        {/* Drawer panel sliding in from right */}
        <div
          className={`absolute top-0 right-0 bottom-0 w-[85vw] max-w-sm flex flex-col shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            drawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{ background: "var(--nav-bg)" }}
          role="dialog"
          aria-label="Navigation menu"
        >
          {/* Drawer header mimicking nav layout for seamless crossover */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b shrink-0 h-[var(--nav-height)]"
            style={{ borderColor: "var(--nav-border)" }}
          >
            <Link
              href="/"
              onClick={closeDrawer}
              className="shrink-0 rounded-2xl overflow-hidden block w-20"
            >
              <img className="w-full" src="/logo.png" alt="Bambumm" />
            </Link>

            {/* Added margin to keep 'X' clear from the 'N' floating element */}
            <div className="mr-7">
              <AnimatedHamburger isOpen={drawerOpen} onClick={closeDrawer} />
            </div>
          </div>

          {/* Drawer nav list */}
          <nav className="flex-1 overflow-y-auto relative">
            {navItems.map((item) =>
              item.href ? (
                <Link
                  key={item._id}
                  href={item.href}
                  onClick={closeDrawer}
                  className="flex items-center justify-between w-full px-5 py-4 text-left border-b text-[0.85rem] font-bold uppercase tracking-[0.08em] transition-colors duration-150 no-underline"
                  style={{
                    fontFamily: "var(--nav-font-ui)",
                    color: "var(--nav-fg)",
                    borderColor: "var(--nav-border)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--nav-dropdown-bg, rgba(200,169,126,0.08))")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  key={item._id}
                  className="flex items-center justify-between w-full px-5 py-4 text-left border-b text-[0.85rem] font-bold uppercase tracking-[0.08em] transition-colors duration-150 cursor-pointer"
                  style={{
                    fontFamily: "var(--nav-font-ui)",
                    color: "var(--nav-fg)",
                    borderColor: "var(--nav-border)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--nav-dropdown-bg, rgba(200,169,126,0.08))")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
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
              ),
            )}

            {/* Slide-in sub-panel */}
            {activePanel && activePanelItem && (
              <div
                className="anim-menu-in absolute inset-0 overflow-y-auto"
                style={{ background: "var(--nav-bg)" }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-4 border-b sticky top-0 z-10"
                  style={{
                    borderColor: "var(--nav-border)",
                    background: "var(--nav-bg)",
                  }}
                >
                  <button
                    className="flex items-center justify-center w-8 h-8 border transition-colors duration-150 cursor-pointer"
                    style={{
                      borderColor: "var(--nav-border)",
                      color: "var(--nav-fg-muted)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--nav-fg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--nav-fg-muted)")
                    }
                    onClick={() => setActivePanel(null)}
                    aria-label="Back"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <span
                    className="text-[0.85rem] font-bold uppercase tracking-[0.08em]"
                    style={{
                      fontFamily: "var(--nav-font-ui)",
                      color: "var(--nav-fg)",
                    }}
                  >
                    {activePanelItem.label}
                  </span>
                </div>

                <div className="px-5 py-4 flex flex-col gap-5">
                  {activePanelItem.categories.map((cat) => (
                    <div key={cat.id}>
                      <p
                        className="text-[0.75rem] font-bold uppercase tracking-[0.12em] mb-2"
                        style={{ color: "var(--nav-fg-muted)" }}
                      >
                        {cat.title}
                      </p>
                      {cat.links.map((link, i) => (
                        <Link
                          key={i}
                          href={link.href}
                          className="block text-[0.8rem] font-semibold uppercase tracking-[0.07em] py-2 border-b no-underline transition-colors duration-150"
                          style={{
                            color: "var(--nav-accent)",
                            borderColor: "var(--nav-border)",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color =
                              "var(--nav-accent-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "var(--nav-accent)")
                          }
                          onClick={closeDrawer}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Drawer footer */}
          <div
            className="shrink-0 border-t"
            style={{ borderColor: "var(--nav-border)" }}
          >
            {user ? (
              <>
                <div
                  className="flex items-center gap-3 px-5 py-3.5 border-b"
                  style={{
                    borderColor: "var(--nav-border)",
                    background: "var(--nav-bg)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[0.85rem] font-bold text-white overflow-hidden border-2"
                    style={{
                      background: "var(--nav-accent)",
                      fontFamily: "var(--nav-font)",
                      borderColor: "rgba(200,169,126,0.3)",
                    }}
                  >
                    {user.picture ? (
                      <img
                        src={user.picture}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[0.85rem] font-bold truncate"
                      style={{
                        fontFamily: "var(--nav-font-ui)",
                        color: "var(--nav-fg)",
                      }}
                    >
                      {user.name}
                    </p>
                    <p
                      className="text-[0.68rem] truncate mt-0.5"
                      style={{ color: "var(--nav-fg-muted)" }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 px-4 py-2.5">
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border text-[0.8rem] font-semibold tracking-wide transition-colors duration-150 cursor-pointer"
                    style={{
                      fontFamily: "var(--nav-font-ui)",
                      borderColor: "var(--nav-border)",
                      color: "var(--nav-fg)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--nav-dropdown-bg, rgba(200,169,126,0.08))")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                    onClick={() => {
                      closeDrawer();
                      openCart();
                    }}
                  >
                    <ShoppingBag size={16} /> Cart
                    {totalItems > 0 && (
                      <span
                        className="rounded-full text-[0.65rem] font-bold text-white px-1.5 py-0.5 leading-none"
                        style={{ background: "var(--nav-accent)" }}
                      >
                        {totalItems}
                      </span>
                    )}
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border text-[0.8rem] font-semibold tracking-wide transition-colors duration-150 cursor-pointer"
                    style={{
                      fontFamily: "var(--nav-font-ui)",
                      borderColor: "var(--nav-border)",
                      color: "var(--nav-fg)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--nav-dropdown-bg, rgba(200,169,126,0.08))")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                    onClick={() => {
                      closeDrawer();
                      router.push("/profile");
                    }}
                  >
                    <User size={16} /> Profile
                  </button>
                  <button
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 border text-[0.8rem] font-semibold cursor-pointer transition-colors duration-150 shrink-0"
                    style={{
                      fontFamily: "var(--nav-font-ui)",
                      background: "rgba(217,79,61,0.06)",
                      borderColor: "rgba(217,79,61,0.2)",
                      color: "var(--nav-sale)",
                    }}
                    onClick={logout}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3 px-4 py-2.5">
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border text-[0.8rem] font-semibold tracking-wide transition-colors duration-150 cursor-pointer"
                  style={{
                    fontFamily: "var(--nav-font-ui)",
                    borderColor: "var(--nav-border)",
                    color: "var(--nav-fg)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--nav-dropdown-bg, rgba(200,169,126,0.08))")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={() => {
                    closeDrawer();
                    router.push("/auth");
                  }}
                >
                  <User size={16} /> Sign In
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border text-[0.8rem] font-semibold tracking-wide transition-colors duration-150 cursor-pointer"
                  style={{
                    fontFamily: "var(--nav-font-ui)",
                    borderColor: "var(--nav-border)",
                    color: "var(--nav-fg)",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--nav-dropdown-bg, rgba(200,169,126,0.08))")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                  onClick={() => {
                    closeDrawer();
                    openCart();
                  }}
                >
                  <ShoppingBag size={16} /> Cart
                  {totalItems > 0 && (
                    <span
                      className="rounded-full text-[0.65rem] font-bold text-white px-1.5 py-0.5 leading-none"
                      style={{ background: "var(--nav-accent)" }}
                    >
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
