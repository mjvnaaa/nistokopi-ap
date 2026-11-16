import "dotenv/config";
import { defineConfig } from "prisma/config";

// CLI (migrate, seed) memakai koneksi langsung (tanpa pooler) bila tersedia.
// Di Vercel + Neon, variabel DATABASE_URL_UNPOOLED disediakan oleh integrasi.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
