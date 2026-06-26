/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone output รวมเฉพาะไฟล์ที่จำเป็นสำหรับรัน production server
  // ทำให้ Docker image เล็กลงมาก (ไม่ต้องคัดลอก node_modules ทั้งก้อน)
  output: "standalone",
};

export default nextConfig;
