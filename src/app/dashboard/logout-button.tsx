"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    // เรียก API ให้ server ลบ cookie แล้วค่อย redirect กลับหน้า login
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg bg-slate-900 px-6 py-2 font-medium text-white transition hover:bg-slate-700"
    >
      Logout
    </button>
  );
}
