import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// ตาราง users — เก็บข้อมูลผู้ใช้สำหรับ login
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  // password เก็บเป็น bcrypt hash เท่านั้น (ไม่เก็บ plain text)
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
