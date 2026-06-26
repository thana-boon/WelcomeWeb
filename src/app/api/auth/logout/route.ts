import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

// POST /api/auth/logout — ลบ session cookie
export async function POST() {
  destroySession();
  return NextResponse.json({ ok: true });
}
