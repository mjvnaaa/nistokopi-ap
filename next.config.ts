import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Unggah foto produk lewat server action: foto maksimal 2 MB ditambah isian formulir.
    // Batas bawaan Next.js hanya 1 MB, sehingga foto 1 sampai 2 MB akan ditolak sebelum sampai ke kode kita.
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
