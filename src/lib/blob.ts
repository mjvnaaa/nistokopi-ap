import { del, put } from "@vercel/blob";
import { MAX_IMAGE_BYTES, blobPathname, checkImage, isOwnBlobUrl, type ImageType } from "@/lib/image";

/** Foto yang sudah lolos pemeriksaan isi dan ukuran, siap diunggah. */
export interface ImageUpload {
  bytes: Uint8Array;
  type: ImageType;
}

/** Baca berkas dari formulir dan periksa di SERVER: ukuran dulu, lalu isi (bukan ekstensi). */
export async function readImageUpload(file: File): Promise<({ ok: true } & ImageUpload) | { ok: false; error: string }> {
  // file.size adalah jumlah byte sebenarnya yang diterima, bukan angka kiriman klien.
  if (file.size > MAX_IMAGE_BYTES) return checkImage(file.size, new Uint8Array(0)) as { ok: false; error: string };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const checked = checkImage(bytes.byteLength, bytes);
  return checked.ok ? { ok: true, bytes, type: checked.type } : checked;
}

/** Unggah ke Vercel Blob. Jenis konten diambil dari hasil deteksi isi, bukan dari kiriman klien. */
export async function uploadProductImage(sellerId: string, upload: ImageUpload): Promise<{ url: string } | { error: string }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("BLOB_READ_WRITE_TOKEN belum diisi");
    return { error: "Penyimpanan foto belum dihubungkan. Hubungi admin situs." };
  }

  try {
    const result = await put(blobPathname(sellerId, upload.type.ext), Buffer.from(upload.bytes), {
      access: "public",
      addRandomSuffix: true,
      contentType: upload.type.mime,
    });
    return { url: result.url };
  } catch (error) {
    console.error("Gagal mengunggah foto ke Blob", error);
    return { error: "Foto belum terunggah. Periksa sambungan, lalu coba lagi." };
  }
}

/**
 * Hapus foto lama dari Blob. Upaya terbaik: kegagalan hanya dicatat dan tidak menggagalkan aksi
 * pengguna (data sudah berubah di database; paling buruk satu berkas yatim tertinggal).
 */
export async function deleteBlobs(urls: (string | null | undefined)[]): Promise<void> {
  const own = urls.filter(isOwnBlobUrl);
  if (own.length === 0 || !process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    await del(own);
  } catch (error) {
    console.error("Gagal menghapus foto dari Blob", error);
  }
}
