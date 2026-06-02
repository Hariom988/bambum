import { unstable_cache } from "next/cache";
import { MongoClient } from "mongodb";
import NavInteractive, { NavItem } from "@/components/navInteractive";
import "@/app/globals.css";

const FALLBACK_NAV: NavItem[] = [
  {
    _id: "men",
    label: "Men",
    order: 0,
    isActive: true,
    categories: [
      {
        id: "trunks",
        title: "Trunks",
        order: 0,
        links: [
          { label: "BAMBUMM CORE", href: "/products?category=Trunks" },
          { label: "BAMBUMM VERT-S", href: "/products?category=Trunks" },
        ],
      },
      {
        id: "briefs",
        title: "Briefs",
        order: 1,
        links: [
          { label: "BAMBUMM CORE", href: "/products?category=Briefs" },
          { label: "BAMBUMM VERT-S", href: "/products?category=Briefs" },
        ],
      },
      {
        id: "vest",
        title: "Vest",
        order: 2,
        links: [
          { label: "BAMBUMM CORE", href: "/products?category=Vest" },
          { label: "BAMBUMM VERT-S", href: "/products?category=Vest" },
        ],
      },
      { id: "deals-men", title: "Deals", order: 3, links: [] },
    ],
  },
  {
    _id: "women",
    label: "Women",
    order: 1,
    isActive: true,
    categories: [
      {
        id: "hipster",
        title: "Hipster",
        order: 0,
        links: [
          { label: "BAMBUMM CORE", href: "/products?category=Hipster" },
          { label: "BAMBUMM VERT-S", href: "/products?category=Hipster" },
          { label: "SPORT DIVA", href: "/products?category=Hipster" },
        ],
      },
      {
        id: "boyshort",
        title: "Boy Short Panty",
        order: 1,
        links: [
          { label: "BAMBUMM CORE", href: "/products?category=Boy+Short+Panty" },
          {
            label: "BAMBUMM VERT-S",
            href: "/products?category=Boy+Short+Panty",
          },
        ],
      },
      {
        id: "loungebra",
        title: "Lounge Bra",
        order: 2,
        links: [
          { label: "SEOUL SWAY BRA", href: "/products?category=Lounge+Bra" },
        ],
      },
      { id: "deals-women", title: "Deals", order: 3, links: [] },
    ],
  },
  {
    _id: "accessories",
    label: "Accessories",
    order: 2,
    isActive: true,
    categories: [
      {
        id: "balaclava",
        title: "Balaclava",
        order: 0,
        links: [{ label: "ZORO", href: "/products/zoro" }],
      },
      { id: "deals-acc", title: "Deals", order: 1, links: [] },
    ],
  },
];

const HARDCODED_LINKS: NavItem[] = [
  {
    _id: "hc-products",
    label: "Products",
    order: 998,
    isActive: true,
    categories: [],
    href: "/products",
  },
  {
    _id: "hc-about",
    label: "About Us",
    order: 999,
    isActive: true,
    categories: [],
    href: "/aboutus",
  },
];

async function fetchNavFromDB(): Promise<NavItem[]> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return FALLBACK_NAV;

  const client = await MongoClient.connect(uri, {
    serverSelectionTimeoutMS: 3000,
  });
  try {
    const docs = await client
      .db("content")
      .collection("navConfig")
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray();

    if (docs.length === 0) return FALLBACK_NAV;

    return docs.map((d) => ({ ...d, _id: d._id.toString() })) as NavItem[];
  } finally {
    await client.close();
  }
}

const getCachedNav = unstable_cache(fetchNavFromDB, ["navconfig"], {
  revalidate: 60,
  tags: ["navconfig"],
});

export default async function Header() {
  let fetchedNavItems: NavItem[];
  try {
    fetchedNavItems = await getCachedNav();
  } catch (err) {
    console.error("[Header] Failed to fetch nav, using fallback:", err);
    fetchedNavItems = FALLBACK_NAV;
  }

  // Merged so hardcoded links are pushed to the right side of the navbar
  const combinedNav = [...fetchedNavItems, ...HARDCODED_LINKS];

  return <NavInteractive navItems={combinedNav} />;
}
