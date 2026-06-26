import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";

// ===== Custom session ด้วย signed HTTP-only cookie (ไม่ใช้ NextAuth) =====
// แนวคิด: เก็บ payload (userId + username) เป็น base64url แล้วต่อด้วยลายเซ็น HMAC
// รูปแบบ cookie: "<base64url(payload)>.<base64url(hmac)>"
// - ฝั่ง server เท่านั้นที่รู้ SESSION_SECRET → client ปลอม cookie ไม่ได้
// - ตั้งเป็น HTTP-only → JavaScript ฝั่ง client อ่าน cookie นี้ไม่ได้ กัน XSS ขโมย session

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 วัน

// ใน production ควรตั้ง SESSION_SECRET เองผ่าน env; dev มี fallback ให้สะดวก
const SECRET =
  process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";

export type SessionPayload = {
  userId: number;
  username: string;
};

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

function sign(data: string): string {
  return base64url(crypto.createHmac("sha256", SECRET).update(data).digest());
}

// แปลง payload → token ที่เซ็นลายเซ็นแล้ว
function serialize(payload: SessionPayload): string {
  const data = base64url(JSON.stringify(payload));
  return `${data}.${sign(data)}`;
}

// แปลง token กลับเป็น payload พร้อมตรวจสอบลายเซ็น (timing-safe)
// คืน null ถ้าลายเซ็นไม่ตรงหรือ token เพี้ยน
function deserialize(token: string): SessionPayload | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  const expected = sign(data);
  const a = fromBase64url(signature);
  const b = fromBase64url(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(fromBase64url(data).toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

// เรียกหลัง login สำเร็จ — เซ็ต cookie แบบ HTTP-only
export function createSession(payload: SessionPayload) {
  cookies().set(COOKIE_NAME, serialize(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

// อ่าน session ปัจจุบันจาก cookie — คืน null ถ้ายังไม่ได้ login หรือ cookie ไม่ถูกต้อง
export function getSession(): SessionPayload | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return deserialize(token);
}

// ล้าง session (ใช้ตอน logout)
export function destroySession() {
  cookies().delete(COOKIE_NAME);
}
