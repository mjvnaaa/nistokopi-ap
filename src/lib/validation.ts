import { z } from "zod";
import { normalizeWA } from "./whatsapp";

/** Satu sumber kebenaran validasi, dipakai di klien dan server. Aturan sama dengan SPEC-v2.md bagian 6. */
export const productInputSchema = z.object({
  name: z.string().trim().min(1, "Isi nama produk.").max(80, "Nama produk maksimal 80 karakter."),
  categoryId: z.string().min(1, "Pilih kategori."),
  description: z.string().trim().min(1, "Isi deskripsi singkat produk.").max(240, "Deskripsi maksimal 240 karakter."),
  price: z
    .number()
    .int("Isi harga dengan bilangan bulat lebih dari 0.")
    .min(1, "Isi harga dengan bilangan bulat lebih dari 0.")
    .max(1_000_000_000, "Harga maksimal Rp1.000.000.000."),
  stock: z
    .number()
    .int("Isi stok dengan bilangan bulat 0 sampai 1.000.000.")
    .min(0, "Isi stok dengan bilangan bulat 0 sampai 1.000.000.")
    .max(1_000_000, "Isi stok dengan bilangan bulat 0 sampai 1.000.000."),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  imageUrl: z.string().url().startsWith("https://").optional().nullable(),
});

export const sellerProfileSchema = z.object({
  storeName: z.string().trim().min(3, "Nama toko minimal 3 karakter.").max(60, "Nama toko maksimal 60 karakter."),
  description: z.string().trim().max(300, "Deskripsi maksimal 300 karakter.").optional(),
  city: z.string().trim().max(60).optional(),
  whatsapp: z
    .string()
    .transform((v) => normalizeWA(v))
    .refine((v) => v !== "", "Nomor tidak valid. Contoh: 0812-3456-7890 atau +62 812-3456-7890."),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "Pilih rating 1 sampai 5.").max(5, "Pilih rating 1 sampai 5."),
  comment: z.string().trim().max(500, "Komentar maksimal 500 karakter.").optional(),
});

export type ProductInput = z.infer<typeof productInputSchema>;
