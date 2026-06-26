import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LogoutButton from "./logout-button";

// เช็ค cookie ใหม่ทุกครั้ง ไม่ cache
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const session = getSession();
  // ป้องกันหน้านี้: ถ้ายังไม่ login → เด้งกลับไป /login
  if (!session) redirect("/login");

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="mb-2 text-3xl font-semibold">
          Welcome, {session.username}!
        </h1>
        <p className="mb-8 text-slate-500">You are logged in.</p>
        <LogoutButton />
      </div>
    </main>
  );
}
