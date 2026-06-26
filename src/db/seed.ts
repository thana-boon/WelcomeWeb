import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { users } from "./schema";

// ข้อมูล user เริ่มต้นที่ใช้ login ได้ทันทีหลัง container start
const SEED_USERNAME = "admin";
const SEED_PASSWORD = "password123";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client, { schema: { users } });

  // เช็คก่อนว่ามี user นี้อยู่แล้วหรือยัง → ถ้ามีแล้วไม่ insert ซ้ำ
  // ทำให้ seed รันทุกครั้งที่ container start ได้โดยไม่พัง (idempotent)
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.username, SEED_USERNAME))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[seed] user "${SEED_USERNAME}" already exists, skipping.`);
  } else {
    const hashed = await bcrypt.hash(SEED_PASSWORD, 10);
    await db.insert(users).values({ username: SEED_USERNAME, password: hashed });
    console.log(`[seed] created user "${SEED_USERNAME}".`);
  }

  await client.end();
}

main().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
