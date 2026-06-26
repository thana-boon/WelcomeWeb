# syntax=docker/dockerfile:1

# ===== Stage 1: deps — ติดตั้ง dependencies ทั้งหมด (รวม dev) =====
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ===== Stage 2: builder — build Next.js (standalone) + bundle migrate/seed =====
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ปิด telemetry และ build แบบ standalone (กำหนด output: 'standalone' ใน next.config)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
# bundle migrate.ts/seed.ts → dist/*.cjs สำหรับรันตอน container start
RUN npm run build:scripts

# ===== Stage 3: runner — image สุดท้าย เล็กและมีเฉพาะของที่ต้องใช้รัน =====
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# รันด้วย non-root user เพื่อความปลอดภัย
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# ไฟล์ public และผลลัพธ์ standalone (มี server.js + node_modules ที่จำเป็น)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# สคริปต์ migrate/seed ที่ bundle แล้ว + ไฟล์ migration (.sql) + entrypoint
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/drizzle ./drizzle
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
# defense in depth: แปลง CRLF -> LF เสมอตอน build เผื่อไฟล์ถูก checkout เป็น CRLF
# (เช่น clone บน Windows ที่ core.autocrlf=true) แล้วค่อย chmod +x
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
