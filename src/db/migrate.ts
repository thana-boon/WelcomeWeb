import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

// รัน migration ทั้งหมดในโฟลเดอร์ ./drizzle (สร้างจาก `npm run db:generate`)
// migrator จะข้าม migration ที่รันไปแล้วโดยอัตโนมัติ → รันซ้ำได้ปลอดภัย (idempotent)
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  // ใช้ connection แยกที่ max: 1 ตามที่ migrator ต้องการ
  const migrationClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(migrationClient);

  console.log("[migrate] running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[migrate] done.");

  await migrationClient.end();
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});
