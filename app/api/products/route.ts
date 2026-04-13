import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

interface CacheEntry { data: unknown[]; ts: number; }
let cache: CacheEntry | null = null;
const TTL = 30_000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const category = searchParams.get("category")?.trim() ?? "";

  const useCache = !q && !category;

  if (useCache && cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json(
      { products: cache.data },
      { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } }
    );
  }

  try {
    const client = await clientPromise;
    const col = client.db("inventory").collection("products");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = { isActive: true };

    if (q) {
      // Regex search — works without text index, no APIStrictError
      const regex = { $regex: q, $options: "i" };
      filter.$or = [{ name: regex }, { category: regex }, { description: regex }];
    }
    if (category) {
      filter.category = category;
    }

    const products = await col
      .find(filter)
      .sort({ createdAt: -1 })
      .project({
        _id: 1,
        name: 1,
        slug: 1,
        price: 1,
        category: 1,
        stock: 1,
        "variants.colorName": 1,
        "variants.colorHex": 1,
        "variants.images": { $slice: 1 },
      })
      .toArray();

    const serialized = products.map((p) => ({ ...p, _id: p._id.toString() }));

    if (useCache) cache = { data: serialized, ts: Date.now() };

    return NextResponse.json(
      { products: serialized },
      {
        headers: {
          "Cache-Control": useCache
            ? "public, s-maxage=30, stale-while-revalidate=60"
            : "no-store",
        },
      }
    );
  } catch (err) {
    console.error("[/api/products GET]", err);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}