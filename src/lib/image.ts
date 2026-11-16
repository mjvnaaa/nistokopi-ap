/**
 * Validasi foto yang murni (tanpa jaringan dan tanpa framework) agar mudah diuji.
 * Jenis berkas ditentukan dari ISI berkas (magic number), bukan dari ekstensi atau Content-Type kiriman klien.
 */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_HINT = "JPG, PNG, atau WebP, maksimal 2 MB.";
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export interface ImageType {
  mime: "image/jpeg" | "image/png" | "image/webp";
  ext: "jpg" | "png" | "webp";
}

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0): boolean =>
  bytes.length >= offset + signature.length && signature.every((value, index) => bytes[offset + index] === value);

/** Kenali JPG, PNG, atau WebP dari byte awal. SVG, GIF, dan lainnya ditolak (null). */
export function detectImageType(bytes: Uint8Array): ImageType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", ext: "jpg" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: "image/png", ext: "png" };
  // WebP: "RIFF" + 4 byte ukuran + "WEBP"
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

export type ImageCheck = { ok: true; type: ImageType } | { ok: false; error: string };

/** Periksa ukuran lebih dulu (murah), lalu isi berkas. Pesan galat menjelaskan cara memperbaiki. */
export function checkImage(size: number, bytes: Uint8Array): ImageCheck {
  if (size <= 0) return { ok: false, error: "Berkas foto kosong. Pilih berkas lain." };
  if (size > MAX_IMAGE_BYTES) return { ok: false, error: "Foto lebih dari 2 MB. Perkecil ukurannya, lalu pilih lagi." };

  const type = detectImageType(bytes);
  if (!type) return { ok: false, error: "Berkas bukan foto JPG, PNG, atau WebP. Pilih foto dengan jenis tersebut." };

  return { ok: true, type };
}

/** Nama berkas di Blob. Akhiran acak ditambahkan oleh Blob agar tebakan alamat tidak mungkin dan tidak bentrok. */
export function blobPathname(sellerId: string, ext: ImageType["ext"]): string {
  return `produk/${sellerId}/foto.${ext}`;
}

/** Hanya alamat Vercel Blob yang boleh dihapus lewat aplikasi (mencegah penghapusan alamat sembarang). */
export function isOwnBlobUrl(url: string | null | undefined): url is string {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}
