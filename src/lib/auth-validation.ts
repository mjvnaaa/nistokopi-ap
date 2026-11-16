import { z } from "zod";
import { sellerProfileSchema } from "@/lib/validation";

const email = z.string().trim().toLowerCase().pipe(z.email("Isi email yang valid."));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Isi kata sandi."),
});

const base = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80, "Nama maksimal 80 karakter."),
  email,
  password: z.string().min(10, "Kata sandi minimal 10 karakter.").max(128, "Kata sandi maksimal 128 karakter."),
});

/** Peran hanya BUYER atau SELLER. Nilai lain (misalnya ADMIN) ditolak. */
export const registerSchema = z.discriminatedUnion("peran", [
  base.extend({ peran: z.literal("BUYER") }),
  base.extend(sellerProfileSchema.shape).extend({ peran: z.literal("SELLER") }),
]);

export type RegisterInput = z.infer<typeof registerSchema>;
