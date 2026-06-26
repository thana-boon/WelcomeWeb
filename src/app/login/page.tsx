import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import LoginForm from "./login-form";

// ถ้า login อยู่แล้วเข้ามาหน้า /login → เด้งไป dashboard เลย
export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (getSession()) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-slate-500">
          Use <code className="rounded bg-slate-100 px-1">admin</code> /{" "}
          <code className="rounded bg-slate-100 px-1">password123</code>
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
