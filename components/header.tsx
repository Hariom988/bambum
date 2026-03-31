"use client";
import { useState, useRef, useEffect } from "react";
import { ShoppingBag, User, Search, X } from "lucide-react";
import "@/app/globals.css";
const NAV_ITEMS = [
  {
    label: "Top Wear",
    categories: [
      {
        title: "T-Shirts",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
      {
        title: "Hoodies",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
      {
        title: "Jackets",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
      {
        title: "Sweatshirts",
        links: ["SAMPLE", "SAMPLE"],
      },
    ],
    featured: [
      { caption: "Explore the collection" },
      { caption: "Discover new arrivals" },
    ],
  },
  {
    label: "Bottom Wear",
    categories: [
      {
        title: "Boxers",
        links: ["SAMPLE", "SAMPLE"],
      },
      {
        title: "Shorts",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
      {
        title: "Pyjamas",
        links: ["SAMPLE"],
      },
      {
        title: "Pants",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
      {
        title: "Joggers",
        links: ["SAMPLE", "SAMPLE"],
      },
    ],
    featured: [],
  },
  {
    label: "Innerwear",
    categories: [
      {
        title: "Underwear",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
      {
        title: "Vests",
        links: ["SAMPLE", "SAMPLE", "SAMPLE"],
      },
      {
        title: "Thermals",
        links: ["SAMPLE", "SAMPLE", "SAMPLE", "SAMPLE"],
      },
    ],
    featured: [
      { caption: "Premium innerwear" },
      { caption: "Stay comfortable" },
    ],
  },
  {
    label: "Accessories",
    categories: [
      {
        title: "Accessories",
        links: ["SAMPLE", "SAMPLE", "SAMPLE"],
      },
    ],
    featured: [],
    simple: true,
  },
  {
    label: "Sale",
    categories: [],
    featured: [],
    sale: true,
  },
];

export default function Navbar() {
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveNav(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveNav(null), 120);
  };

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const activeItem = NAV_ITEMS.find((n) => n.label === activeNav);

  return (
    <>
      <header className="nav-root" ref={navRef}>
        <div
          className="max-w-7xl mx-auto h-full flex items-center gap-8 px-6"
          onMouseLeave={handleMouseLeave}
        >
          {/* Logo */}
          <span className="nav-logo">Bambum</span>

          {/* Nav links */}
          <nav className="flex items-center gap-6 flex-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} style={{ position: "relative" }}>
                <button
                  className={`nav-link${activeNav === item.label ? " active" : ""}${item.sale ? " sale" : ""}`}
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  aria-haspopup={item.categories.length > 0}
                  aria-expanded={activeNav === item.label}
                >
                  {item.label}
                </button>

                {/* Simple small dropdown (Accessories, Sale) */}
                {item.simple && activeNav === item.label && (
                  <div
                    className="simple-dropdown"
                    onMouseEnter={() => handleMouseEnter(item.label)}
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

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Search */}
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

            {/* Cart */}
            <button className="icon-btn" style={{ marginLeft: 8 }}>
              <ShoppingBag size={20} />
              <span className="cart-badge">2</span>
            </button>

            {/* Account */}
            <button className="icon-btn">
              <User size={20} />
            </button>
          </div>
        </div>

        {activeNav &&
          activeItem &&
          !activeItem.simple &&
          !activeItem.sale &&
          activeItem.categories.length > 0 && (
            <div
              className="mega-menu"
              onMouseEnter={() => handleMouseEnter(activeNav)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-6 py-8 flex gap-12">
                <div className="flex gap-12 flex-1">
                  {activeItem.categories.map((cat) => (
                    <div key={cat.title} className="min-w-30">
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
                  <div className="flex gap-4 shrink-0">
                    {activeItem.featured.map((f, i) => (
                      <div
                        key={i}
                        className="featured-card w-36 cursor-pointer"
                      >
                        <span className="featured-card-caption">
                          {f.caption}
                          <img src="/bambum_image.jpeg" alt="" />
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
      </header>
    </>
  );
}
