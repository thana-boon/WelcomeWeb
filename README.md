# WelcomeWeb

เว็บ Next.js ที่มีระบบ **login → dashboard** อย่างง่าย พร้อมรันด้วย Docker Compose (web + PostgreSQL) ได้ในคำสั่งเดียว

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **PostgreSQL 16** (รันเป็น container)
- **Drizzle ORM** เชื่อมต่อ database
- **bcryptjs** สำหรับ hash password
- **Custom session** ผ่าน signed HTTP-only cookie (ไม่ใช้ NextAuth — เขียนเอง 100% เพื่อให้เห็น flow auth ทั้งหมด)

---

## เริ่มใช้งานด้วย Docker (แนะนำ)

ต้องมี Docker + Docker Compose ติดตั้งอยู่ จากนั้น (ใช้ได้ทั้ง Windows / Mac / Linux):

```bash
cp .env.example .env
docker compose up --build
```

เปิดเบราว์เซอร์ที่ **http://localhost:3000** แล้ว login ด้วย:

| Username | Password      |
| -------- | ------------- |
| `admin`  | `password123` |

จะเข้าหน้า Dashboard ที่ขึ้นว่า **"Welcome, admin!"**

> ทุกอย่างทำงานอัตโนมัติ — ไม่ต้องรัน migrate หรือ seed เอง
> ตอน container `web` start จะรัน migration แล้ว seed user `admin` ให้ก่อนเปิดเซิร์ฟเวอร์
> ขั้นตอนเหล่านี้ idempotent (รันซ้ำได้ ไม่สร้างข้อมูลซ้ำ ไม่พัง) จึง `docker compose up` กี่ครั้งก็ได้

หยุดการทำงาน: `Ctrl+C` แล้ว `docker compose down`
ล้างข้อมูล database ด้วย (ลบ volume): `docker compose down -v`

---

## หน้าเว็บที่มี

| Route        | คำอธิบาย                                                                  |
| ------------ | ------------------------------------------------------------------------- |
| `/`          | redirect ไป `/dashboard` ถ้า login แล้ว, ไม่งั้นไป `/login`                |
| `/login`     | ฟอร์ม login — ถ้าผิดขึ้น "Username หรือ Password ไม่ถูกต้อง", ถ้าถูกไป dashboard |
| `/dashboard` | ต้อง login ก่อน (ถ้าไม่เด้งกลับ `/login`) — แสดง "Welcome, {username}!" + ปุ่ม Logout |

ไม่มีหน้า register ตามดีไซน์ — ผู้ใช้ถูกสร้างจาก seed script เท่านั้น

---

## รัน local dev (ไม่ใช้ Docker สำหรับตัวเว็บ)

ต้องมี Node.js 20+ และ PostgreSQL ที่เชื่อมต่อได้

1. ติดตั้ง dependencies และตั้งค่า env:

   ```bash
   npm install
   cp .env.example .env
   # แก้ DATABASE_URL ใน .env ให้ชี้ไป Postgres ของคุณ
   ```

   หากยังไม่มี Postgres สะดวก ๆ สามารถสตาร์ทเฉพาะ db ด้วย Docker ได้:

   ```bash
   docker compose up -d db
   ```

2. สร้างตารางและ seed user:

   ```bash
   npm run db:migrate   # รัน migration (สร้างตาราง users)
   npm run db:seed      # สร้าง user admin / password123
   ```

3. สตาร์ท dev server:

   ```bash
   npm run dev
   ```

   เปิด http://localhost:3000

### คำสั่งที่มีให้

| คำสั่ง                 | ทำอะไร                                                       |
| --------------------- | ----------------------------------------------------------- |
| `npm run dev`         | สตาร์ท dev server                                            |
| `npm run build`       | build production (standalone)                               |
| `npm run db:generate` | สร้างไฟล์ migration ใหม่จาก `src/db/schema.ts` (Drizzle Kit) |
| `npm run db:migrate`  | รัน migration ทั้งหมดใส่ database                            |
| `npm run db:seed`     | seed user `admin`                                           |

---

## โครงสร้างโปรเจกต์

```
src/
├── app/
│   ├── page.tsx               # "/" → redirect ตามสถานะ login
│   ├── login/                 # หน้า login (page + ฟอร์ม client)
│   ├── dashboard/             # หน้า dashboard (ป้องกันด้วย session) + ปุ่ม logout
│   └── api/auth/
│       ├── login/route.ts     # POST ตรวจ credential + เซ็ต cookie
│       └── logout/route.ts    # POST ลบ cookie
├── db/
│   ├── schema.ts              # ตาราง users (Drizzle)
│   ├── index.ts               # db client (lazy connection)
│   ├── migrate.ts             # สคริปต์รัน migration
│   └── seed.ts                # สคริปต์ seed user admin (idempotent)
└── lib/
    ├── auth.ts                # ตรวจ username/password กับ bcrypt
    └── session.ts             # สร้าง/อ่าน/ลบ signed HTTP-only cookie
drizzle/                       # ไฟล์ migration ที่ generate แล้ว
Dockerfile                     # multi-stage build → standalone image
docker-compose.yml             # web + db (postgres) พร้อม healthcheck
docker-entrypoint.sh           # migrate → seed → start server
```

---

## ระบบ auth ทำงานยังไง (สรุป)

1. ผู้ใช้กรอก username/password ที่ `/login` → POST ไป `/api/auth/login`
2. server เทียบ password กับ bcrypt hash ใน database (`src/lib/auth.ts`)
3. ถ้าถูก → สร้าง token `base64url(payload).HMAC-SHA256` แล้วเซ็ตเป็น **HTTP-only cookie** (`src/lib/session.ts`)
   - HTTP-only → JS ฝั่ง client อ่าน cookie ไม่ได้ (กัน XSS ขโมย session)
   - มี HMAC ลายเซ็น → client ปลอม/แก้ cookie ไม่ได้ เพราะไม่รู้ `SESSION_SECRET`
4. หน้า `/dashboard` และ `/` เป็น server component ที่อ่าน+ตรวจ cookie นี้ทุก request
5. Logout → POST `/api/auth/logout` ลบ cookie แล้ว redirect กลับ `/login`

> **หมายเหตุ production:** ตั้ง `SESSION_SECRET` ใน `.env` เป็นค่าสุ่มยาว ๆ (`openssl rand -base64 32`) และเปลี่ยนรหัสผ่าน seed
