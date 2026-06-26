import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// สร้าง connection แบบ lazy — ตอน build (collecting page data) Next.js จะ import
// ไฟล์นี้โดยที่ยังไม่มี DATABASE_URL เราจึงไม่เชื่อมต่อจนกว่าจะมีการเรียกใช้จริง
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
  db?: PostgresJsDatabase<typeof schema>;
};

function getDb(): PostgresJsDatabase<typeof schema> {
  if (globalForDb.db) return globalForDb.db;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env first.");
  }

  // reuse connection เดียวต่อ process (กัน dev hot-reload เปิด connection ซ้ำจนเต็ม pool)
  const client = globalForDb.client ?? postgres(databaseUrl);
  globalForDb.client = client;
  globalForDb.db = drizzle(client, { schema });
  return globalForDb.db;
}

// export เป็น Proxy เพื่อให้เรียก db.select()... ได้เหมือนเดิม แต่ init แบบ lazy
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
