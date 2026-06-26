import { defineConfig } from "drizzle-kit";

// อ่าน DATABASE_URL จาก environment variable เสมอ
// ใช้ทั้งตอน generate migration และตอนเชื่อมต่อ database จริง
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/welcomeweb",
  },
});
