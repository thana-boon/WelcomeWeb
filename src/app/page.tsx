import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// หน้า root "/" — ไม่แสดงอะไรเอง แค่ตัดสินใจ redirect ตามสถานะ login
// ปิด cache ให้เช็ค cookie ใหม่ทุกครั้ง
export const dynamic = "force-dynamic";

export default function Home() {
  const session = getSession();
  // login อยู่แล้ว → ไป dashboard, ยังไม่ login → ไปหน้า login
  redirect(session ? "/dashboard" : "/login");
}
