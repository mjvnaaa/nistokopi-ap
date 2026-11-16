import { describe, it, expect } from "vitest";
import { MAX_IMAGE_BYTES, blobPathname, checkImage, detectImageType, isOwnBlobUrl } from "../src/lib/image";

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (s: string) => Array.from(s).map((c) => c.charCodeAt(0));

const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0, 0, 16);
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0);
const WEBP = bytes(...text("RIFF"), 1, 2, 3, 4, ...text("WEBP"), 0);

describe("deteksi jenis foto dari isi", () => {
  it("mengenali JPG, PNG, dan WebP", () => {
    expect(detectImageType(JPEG)).toEqual({ mime: "image/jpeg", ext: "jpg" });
    expect(detectImageType(PNG)).toEqual({ mime: "image/png", ext: "png" });
    expect(detectImageType(WEBP)).toEqual({ mime: "image/webp", ext: "webp" });
  });

  it("menolak GIF, SVG, HTML, dan berkas program", () => {
    expect(detectImageType(bytes(...text("GIF89a")))).toBeNull();
    expect(detectImageType(bytes(...text("<svg xmlns=")))).toBeNull();
    expect(detectImageType(bytes(...text("<html><script>")))).toBeNull();
    expect(detectImageType(bytes(0x4d, 0x5a, 0x90, 0x00))).toBeNull();
  });

  it("menolak RIFF yang bukan WebP (misalnya WAV) dan berkas yang terlalu pendek", () => {
    expect(detectImageType(bytes(...text("RIFF"), 1, 2, 3, 4, ...text("WAVE")))).toBeNull();
    expect(detectImageType(bytes(0xff, 0xd8))).toBeNull();
    expect(detectImageType(new Uint8Array(0))).toBeNull();
  });
});

describe("pemeriksaan foto", () => {
  it("menerima foto sah sampai tepat 2 MB", () => {
    expect(checkImage(1000, JPEG).ok).toBe(true);
    expect(checkImage(MAX_IMAGE_BYTES, PNG).ok).toBe(true);
  });

  it("menolak berkas lebih dari 2 MB dengan pesan cara memperbaiki", () => {
    const result = checkImage(MAX_IMAGE_BYTES + 1, JPEG);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("2 MB");
  });

  it("menolak berkas kosong", () => {
    expect(checkImage(0, new Uint8Array(0)).ok).toBe(false);
  });

  it("menolak berkas bukan gambar walau ukurannya kecil (ekstensi .jpg tidak berpengaruh)", () => {
    const fake = bytes(...text("<?php echo 1;"));
    const result = checkImage(fake.byteLength, fake);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("JPG, PNG, atau WebP");
  });
});

describe("alamat Blob", () => {
  it("hanya alamat https Vercel Blob yang dianggap milik aplikasi", () => {
    expect(isOwnBlobUrl("https://abc123.public.blob.vercel-storage.com/produk/x/foto-k1.jpg")).toBe(true);
    expect(isOwnBlobUrl("http://abc123.public.blob.vercel-storage.com/x.jpg")).toBe(false);
    expect(isOwnBlobUrl("https://evil.example.com/x.jpg")).toBe(false);
    expect(isOwnBlobUrl("https://blob.vercel-storage.com.evil.com/x.jpg")).toBe(false);
    expect(isOwnBlobUrl("bukan url")).toBe(false);
    expect(isOwnBlobUrl(null)).toBe(false);
    expect(isOwnBlobUrl(undefined)).toBe(false);
  });

  it("menyusun nama berkas per toko", () => {
    expect(blobPathname("sp1", "webp")).toBe("produk/sp1/foto.webp");
  });
});
