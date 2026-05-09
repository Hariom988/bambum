// app/api/navconfig/route.ts
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

export interface NavLink {
  label: string;
  href: string;
}

export interface NavCategory {
  id: string;        // stable client-side DnD key
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
}

async function fetchNavFromDB(): Promise<NavItem[]> {
  const client = await MongoClient.connect(MONGODB_URI);
  try {
    const col = client.db("content").collection("navConfig");
    const docs = await col
      .find({ isActive: true })
      .sort({ order: 1 })
      .toArray();
    return docs.map((d) => ({
      ...d,
      _id: d._id.toString(),
    })) as NavItem[];
  } finally {
    await client.close();
  }
}

// Cache for 60 seconds on the server — revalidated on every admin save via
// the admin route calling revalidateTag("navconfig")
const getCachedNav = unstable_cache(fetchNavFromDB, ["navconfig"], {
  revalidate: 60,
  tags: ["navconfig"],
});

export async function GET() {
  try {
    const items = await getCachedNav();
    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    console.error("[/api/navconfig GET]", err);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}