import { build } from "esbuild";

// Next.js standalone output ไม่ได้รวม dev tool อย่าง tsx/drizzle-kit มาด้วย
// เราจึง bundle migrate.ts และ seed.ts ให้เป็นไฟล์ .cjs ที่รันด้วย `node` ได้เลย
// (รวม dependency อย่าง drizzle-orm, postgres, bcryptjs เข้าไปในไฟล์เดียว)
// ผลลัพธ์ไปอยู่ที่ dist/ แล้วถูกคัดลอกเข้า image สำหรับรันตอน container start
await build({
  entryPoints: ["src/db/migrate.ts", "src/db/seed.ts"],
  outdir: "dist",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outExtension: { ".js": ".cjs" },
});

console.log("[build:scripts] bundled migrate.cjs and seed.cjs into dist/");
