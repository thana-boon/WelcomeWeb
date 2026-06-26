#!/bin/sh
set -e

# Entrypoint ของ container web — รันตามลำดับ:
# 1) migrate  : สร้าง/อัปเดตตารางใน database (idempotent ข้าม migration ที่รันแล้ว)
# 2) seed     : สร้าง user "admin" ถ้ายังไม่มี (idempotent)
# 3) server   : สตาร์ท Next.js production server
#
# ถึงตอนนี้ db ผ่าน healthcheck (pg_isready) แล้วจาก depends_on ใน compose
# จึงเชื่อมต่อ database ได้เลยโดยไม่ต้องรอเอง

echo "==> Running database migrations"
node dist/migrate.cjs

echo "==> Seeding database"
node dist/seed.cjs

echo "==> Starting Next.js server"
exec node server.js
