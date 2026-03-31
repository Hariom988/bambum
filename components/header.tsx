"use client";

import { useState, useRef, useEffect } from "react";
import {
  ShoppingBag,
  User,
  Search,
  X,
  Menu,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import "@/app/globals.css";

const NAV_ITEMS = [
  {
    label: "Top Wear",
    categories: [
      { title: "T-Shirts", links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"] },
      { title: "Hoodies", links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"] },
      {
        title: "Jackets",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
      { title: "Sweatshirts", links: ["SAMPLE", "SAMPLE"] },
    ],
    featured: [
      { caption: "Explore the collection" },
      { caption: "Discover new arrivals" },
    ],
  },
  {
    label: "Bottom Wear",
    categories: [
      { title: "Boxers", links: ["SAMPLE", "SAMPLE"] },
      {
        title: "Shorts",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
      { title: "Pyjamas", links: ["SAMPLE"] },
      {
        title: "Pants",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
      { title: "Joggers", links: ["SAMPLE", "SAMPLE"] },
    ],
    featured: [],
  },
  {
    label: "Innerwear",
    categories: [
      { title: "Underwear", links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"] },
      { title: "Vests", links: ["SAMPLE", "SAMPLE", "SAMPLE"] },
      { title: "Thermals", links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"] },
    ],
    featured: [
      { caption: "Premium innerwear" },
      { caption: "Stay comfortable" },
    ],
  },
  {
    label: "Accessories",
    categories: [
      { title: "Accessories", links: ["SAMPLE", "SAMPLE", "SAMPLE"] },
    ],
    featured: [],
    simple: true,
  },
  { label: "Sale", categories: [], featured: [], sale: true },
];

// ─── ALL STYLES ───────────────────────────────────────────────────────────────

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Navbar() {
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const activeItem = NAV_ITEMS.find((n) => n.label === activeNav);
  const activePanelItem = NAV_ITEMS.find((n) => n.label === activePanel);
  const closeDrawer = () => {
    setDrawerOpen(false);
    setActivePanel(null);
  };

  return (
    <>
      <header className="nav-root">
        {/* ══ DESKTOP LAYOUT ══ */}
        <div
          className="max-w-7xl mx-auto h-full flex items-center gap-8 px-6"
          onMouseLeave={leave}
        >
          <span className="nav-logo">Bambum</span>

          {/* Desktop links */}
          <nav className="desktop-only items-center gap-6 flex-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} style={{ position: "relative" }}>
                <button
                  className={`nav-link${activeNav === item.label ? " active" : ""}${item.sale ? " sale" : ""}`}
                  onMouseEnter={() => enter(item.label)}
                  aria-haspopup={item.categories.length > 0}
                  aria-expanded={activeNav === item.label}
                >
                  {item.label}
                </button>

                {item.simple && activeNav === item.label && (
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

          {/* Desktop right */}
          <div className="desktop-only items-center gap-1 ml-auto">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search for products…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {searchValue ? (
                <button className="icon-btn" onClick={() => setSearchValue("")}>
                  <X size={14} />
                </button>
              ) : (
                <button className="icon-btn">
                  <Search size={14} />
                </button>
              )}
            </div>
            <button className="icon-btn" style={{ marginLeft: 8 }}>
              <ShoppingBag size={20} />
              <span className="cart-badge">2</span>
            </button>
            <button className="icon-btn">
              <User size={20} />
            </button>
          </div>

          {/* Mobile right */}
          <div className="mobile-only items-center gap-1 ml-auto">
            {/* Search bar — hidden on very small screens */}
            <div className="search-bar search-bar-mobile">
              <input
                type="text"
                placeholder="Search…"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{ width: 120 }}
              />
              {searchValue ? (
                <button className="icon-btn" onClick={() => setSearchValue("")}>
                  <X size={14} />
                </button>
              ) : (
                <button className="icon-btn">
                  <Search size={14} />
                </button>
              )}
            </div>
            <button className="icon-btn">
              <ShoppingBag size={20} />
              <span className="cart-badge">2</span>
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

        {/* ══ DESKTOP MEGA MENU ══ */}
        {activeNav &&
          activeItem &&
          !activeItem.simple &&
          !activeItem.sale &&
          activeItem.categories.length > 0 && (
            <div
              className="mega-menu"
              onMouseEnter={() => enter(activeNav)}
              onMouseLeave={leave}
            >
              <div className="max-w-7xl mx-auto px-6 py-8 flex gap-12">
                <div
                  style={{
                    display: "flex",
                    gap: 48,
                    flex: 1,
                    flexWrap: "wrap",
                  }}
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
                        <span className="featured-card-caption">
                          {f.caption}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
      </header>

      {/* ══ MOBILE DRAWER ══ */}
      {drawerOpen && (
        <>
          <div
            className="drawer-overlay"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          <div className="drawer" role="dialog" aria-label="Navigation menu">
            {/* Header */}
            <div className="drawer-header">
              <span className="nav-logo" style={{ fontSize: "1.2rem" }}>
                Bambum
              </span>
              <button
                className="icon-btn"
                onClick={closeDrawer}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="drawer-search">
              <div className="drawer-search-inner">
                <input
                  type="text"
                  placeholder="Search for products…"
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  autoFocus
                />
                {mobileSearch ? (
                  <button
                    className="icon-btn"
                    onClick={() => setMobileSearch("")}
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <button className="icon-btn">
                    <Search size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Nav list + Level-2 panel */}
            <nav className="drawer-nav">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  className={`drawer-nav-item${item.sale ? " sale" : ""}`}
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

              {/* Level-2 slides over level-1 */}
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

            {/* Footer */}
            <div className="drawer-footer">
              <button className="drawer-footer-btn">
                <User size={16} /> Account
              </button>
              <button className="drawer-footer-btn">
                <ShoppingBag size={16} /> Cart
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
                  2
                </span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
