/**
 * Run once: node scripts/setup-indexes.mjs
 * Creates all MongoDB indexes for performance + search
 */
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { MONGODB_URI } = process.env;
if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI in .env.local");
    process.exit(1);
}

async function setupIndexes() {
    const client = await MongoClient.connect(MONGODB_URI);

    // ── inventory.products ───────────────────────────────────────────────────
    const products = client.db("inventory").collection("products");

    // 1. Search: text index on name + category + description
    await products.createIndex(
        { name: "text", category: "text", description: "text" },
        {
            weights: { name: 10, category: 5, description: 1 },
            name: "products_text_search",
            default_language: "english",
        }
    );

    // 2. Listing page filter: category + isActive + createdAt (compound)
    await products.createIndex(
        { isActive: 1, category: 1, createdAt: -1 },
        { name: "products_active_category_date" }
    );

    // 3. Slug lookup (product detail page)
    await products.createIndex(
        { slug: 1, isActive: 1 },
        { name: "products_slug_active", unique: false }
    );

    // 4. Price range filter
    await products.createIndex(
        { isActive: 1, price: 1 },
        { name: "products_active_price" }
    );

    // 5. Stock management (admin low-stock queries)
    await products.createIndex(
        { stock: 1, isActive: 1 },
        { name: "products_stock_active" }
    );
    console.log("inventory.products indexes created");

    // ── inventory.category ───────────────────────────────────────────────────
    const category = client.db("inventory").collection("category");

    await category.createIndex(
        { name: 1 },
        { name: "category_name_unique", unique: true, collation: { locale: "en", strength: 2 } }
    );

    console.log(" inventory.category indexes created");

    // ── credentials.admin ────────────────────────────────────────────────────
    const admin = client.db("credentials").collection("admin");

    await admin.createIndex(
        { username: 1 },
        { name: "admin_username_unique", unique: true }
    );

    console.log(" credentials.admin indexes created");

    // ── users.credentials ────────────────────────────────────────────────────
    // Your screenshot shows a "users" db with "credentials" collection.
    // Adding _id (default) + email index as you requested.
    const users = client.db("users").collection("credentials");

    await users.createIndex(
        { email: 1 },
        { name: "users_email_unique", unique: true, sparse: true }
    );

    console.log(" users.credentials indexes created");

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log("\n Index summary:");
    const allProductIndexes = await products.listIndexes().toArray();
    allProductIndexes.forEach((idx) =>
        console.log(`  products → ${idx.name}`)
    );

    await client.close();
    console.log("\n All indexes set up successfully.");
}

setupIndexes().catch((err) => {
    console.error("Index setup failed:", err);
    process.exit(1);
});
