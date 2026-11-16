import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL belum diisi. Lihat .env.example untuk daftar variabel lingkungan.");
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** Satu klien Prisma per proses. Di development, simpan di global agar tidak membuat pool baru setiap hot reload. */
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
