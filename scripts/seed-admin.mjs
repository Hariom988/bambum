import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const { MONGODB_ADMIN_URI, ADMIN_USER, ADMIN_PASS } = process.env;

if (!MONGODB_ADMIN_URI || !ADMIN_USER || !ADMIN_PASS) {
    console.error("Missing env vars: MONGODB_ADMIN_URI, ADMIN_USER, ADMIN_PASS");
    process.exit(1);
}

async function seed() {
    const client = await MongoClient.connect(MONGODB_ADMIN_URI);
    const db = client.db("credentials");
    const col = db.collection("admin");

    const passwordHash = await bcrypt.hash(ADMIN_PASS, 12);

    await col.updateOne(
        { username: ADMIN_USER },
        {
            $set: {
                username: ADMIN_USER,
                passwordHash,
                updatedAt: new Date(),
            },
            $setOnInsert: {
                createdAt: new Date(),
            },
        },
        { upsert: true }
    );

    console.log(`Admin credentials upserted for user: "${ADMIN_USER}"`);
    console.log("Database: admin | Collection: credentials");
    await client.close();
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
