import "server-only";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";

// ตรวจสอบ username/password กับข้อมูลใน database
// คืนข้อมูล user (เฉพาะ field ที่ปลอดภัย) ถ้าถูกต้อง, คืน null ถ้าไม่ถูกต้อง
export async function verifyCredentials(username: string, password: string) {
  const found = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const user = found[0];
  if (!user) return null;

  // เทียบ password ที่กรอกมากับ bcrypt hash ใน database
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  return { id: user.id, username: user.username };
}
