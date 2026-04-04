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
import Link from "next/link";

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
      { title: " Snood Cap", links: ["SAMPLE", "SAMPLE", "SAMPLE"] },
      { title: "Utility Pouch", links: ["SAMPLE", "SAMPLE", "SAMPLE"] },
    ],
    featured: [],
  },
];

export default function Navbar() {
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  const activeItem = NAV_ITEMS.find((n) => n.label === activeNav);
  const activePanelItem = NAV_ITEMS.find((n) => n.label === activePanel);
  const closeDrawer = () => {
    setDrawerOpen(false);
    setActivePanel(null);
  };

  return (
    <>
      <header className="nav-root">
        <div
          className="max-w-7xl mx-auto h-full flex items-center gap-8 px-6"
          onMouseLeave={leave}
        >
          <Link href="/">
            <img className="w-20" src="/logo.png" alt="" />
          </Link>

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

          <div className="desktop-only items-center gap-1 ml-auto">
            <div
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
                  overflow: "hidden",
                  width: searchOpen ? 220 : 0,
                  opacity: searchOpen ? 1 : 0,
                  transition:
                    "width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
                  marginRight: searchOpen ? 4 : 0,
                }}
              >
                <div className="search-bar" style={{ width: "100%" }}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search for products…"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Escape" && setSearchOpen(false)
                    }
                    style={{ width: "100%" }}
                  />
                  {searchValue && (
                    <button
                      className="icon-btn"
                      onClick={() => setSearchValue("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <button
                className="icon-btn"
                onClick={() => {
                  setSearchOpen((prev) => {
                    const next = !prev;
                    if (next)
                      setTimeout(() => searchInputRef.current?.focus(), 50);
                    else setSearchValue("");
                    return next;
                  });
                }}
                aria-label={searchOpen ? "Close search" : "Open search"}
              >
                {searchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
            </div>

            <button className="icon-btn" style={{ marginLeft: 8 }}>
              <ShoppingBag size={20} />
              <span className="cart-badge">2</span>
            </button>
            <button className="icon-btn">
              <User size={20} />
            </button>
          </div>

          <div className="mobile-only items-center gap-1 ml-auto">
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

        {activeNav && activeItem && activeItem.categories.length > 0 && (
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
                      <span className="featured-card-caption">{f.caption}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

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
                  className={`drawer-nav-item`}
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
