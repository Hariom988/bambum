import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

export async function GET() {
  try {
    const client = await MongoClient.connect(MONGODB_URI);

    const productsCol = client.db("inventory").collection("products");
    const ordersCol = client.db("users").collection("orders");

    const [
      totalProducts,
      menProducts,
      womenProducts,
      totalOrders,
    ] = await Promise.all([
      productsCol.countDocuments({ isActive: true }),
      productsCol.countDocuments({
        isActive: true,
        category: "Men",
      }),
      productsCol.countDocuments({
        isActive: true,
        category:"Women",
      }),
      ordersCol.countDocuments({}),
    ]);

    await client.close();

    return NextResponse.json({
      totalProducts,
      menProducts,
      womenProducts,
      totalOrders,
    });
  } catch (err) {
    console.error("[admin/stats GET]", err);
    return NextResponse.json({ error: "Failed to fetch stats." }, { status: 500 });
  }
}