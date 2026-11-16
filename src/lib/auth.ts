import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";

/**
 * Better Auth: email + kata sandi. `role` dan `status` ada di tabel User tetapi
 * `input: false` berarti pengguna TIDAK dapat mengisinya saat daftar (AKN-04).
 * Peran SELLER diberikan oleh server action daftar, bukan oleh klien.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "BUYER", input: false },
      status: { type: "string", required: false, defaultValue: "ACTIVE", input: false },
    },
  },
  // Penyimpanan batas laju default berada di memori (per instance). Cukup untuk awal; T-V2-15 menyempurnakan.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 30,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
  plugins: [nextCookies()], // harus plugin terakhir
});
