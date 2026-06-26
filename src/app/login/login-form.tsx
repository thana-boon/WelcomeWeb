"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ฟอร์ม login เป็น client component เพื่อจัดการ state ของ error และ loading
export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });

    if (res.ok) {
      // login สำเร็จ → cookie ถูกเซ็ตจากฝั่ง server แล้ว, redirect ไป dashboard
      router.replace("/dashboard");
      router.refresh();
    } else {
      // login ไม่สำเร็จ → แสดง error message
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Username หรือ Password ไม่ถูกต้อง");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
