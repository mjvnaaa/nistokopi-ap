/** Fungsi teks murni (tanpa database) agar mudah diuji. */

/** Kunci nama produk untuk keunikan per seller tanpa peduli huruf besar-kecil. Sama dengan seed. */
export function nameKey(name: string): string {
  return name.trim().toLowerCase();
}

/** Ubah nama toko menjadi slug URL: huruf kecil, angka, tanda hubung. */
export function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");

  return base || "toko";
}

/** Cari slug yang belum dipakai: base, base-2, base-3, ... */
export async function uniqueSlug(base: string, isTaken: (slug: string) => Promise<boolean>): Promise<string> {
  if (!(await isTaken(base))) return base;

  for (let i = 2; i <= 50; i++) {
    const candidate = `${base}-${i}`;
    if (!(await isTaken(candidate))) return candidate;
  }

  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}
