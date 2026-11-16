/** Normalisasi nomor WhatsApp Indonesia ke format 62xxxxxxxxxx. Mengembalikan "" jika tidak valid. */
export function normalizeWA(input: string): string {
  let d = String(input ?? "").replace(/\D/g, "");
  if (d.startsWith("620")) d = "62" + d.slice(3);
  else if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (d.startsWith("8")) d = "62" + d;
  return /^62\d{8,13}$/.test(d) ? d : "";
}

export function formatRupiah(n: number): string {
  return "Rp" + Number(n).toLocaleString("id-ID");
}

/** Tautan pesan WhatsApp ke seller pemilik produk. */
export function waLink(product: { name: string; price: number }, sellerNumber: string): string {
  const msg = `Halo, saya ingin memesan ${product.name} (${formatRupiah(product.price)}). Apakah masih tersedia?`;
  return `https://wa.me/${sellerNumber}?text=${encodeURIComponent(msg)}`;
}

/** Status stok untuk kartu: tersedia, menipis (1-5), atau habis. */
export function stockStatus(stock: number): { level: "ok" | "low" | "out"; label: string } {
  if (stock <= 0) return { level: "out", label: "Stok habis" };
  if (stock <= 5) return { level: "low", label: `Stok tinggal ${stock}` };
  return { level: "ok", label: `Stok ${stock}` };
}

/** Hanya izinkan pengalihan ke tautan wa.me yang sah (mencegah open redirect). */
export function isSafeWaLink(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "wa.me" && /^\/62\d{8,13}$/.test(url.pathname);
  } catch {
    return false;
  }
}
