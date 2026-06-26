import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";
import { createSession } from "@/lib/session";

// POST /api/auth/login — รับ username/password, ตรวจสอบ, เซ็ต session cookie
export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username หรือ Password ไม่ถูกต้อง" },
      { status: 400 }
    );
  }

  const user = await verifyCredentials(username, password);
  if (!user) {
    // ไม่บอกว่า username หรือ password ผิดที่ field ไหน เพื่อไม่ให้เดา username ได้
    return NextResponse.json(
      { error: "Username หรือ Password ไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  // ถูกต้อง → สร้าง session (เซ็ต HTTP-only cookie)
  createSession({ userId: user.id, username: user.username });

  return NextResponse.json({ ok: true });
}
