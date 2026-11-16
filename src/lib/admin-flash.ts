/** Pesan singkat setelah aksi admin. Kode dikirim lewat ?info= dan dicocokkan di sini (bukan teks bebas dari URL). */
export const ADMIN_FLASH = {
  "seller-disetujui": { text: "Toko disetujui dan kini tampil di katalog." },
  "seller-ditolak": { text: "Toko ditolak. Catatan Anda tampil di dashboard penjual." },
  "seller-ditangguhkan": { text: "Toko ditangguhkan dan produknya disembunyikan dari katalog." },
  "seller-diaktifkan": { text: "Toko diaktifkan kembali." },
  "status-berubah": { text: "Status toko sudah berubah sebelumnya. Halaman menampilkan data terbaru.", bad: true },
  "catatan-wajib": { text: "Catatan wajib diisi saat menolak toko, maksimal 300 karakter.", bad: true },
  "peran-diubah": { text: "Peran pengguna diubah." },
  "pengguna-dinonaktifkan": { text: "Pengguna dinonaktifkan. Akses berhenti pada permintaan berikutnya." },
  "pengguna-diaktifkan": { text: "Pengguna diaktifkan kembali." },
  "pengguna-dihapus": { text: "Pengguna dihapus." },
  "pengguna-ditolak": {
    text: "Perubahan ini tidak diizinkan. Admin aktif terakhir dan akun Anda sendiri tidak dapat diturunkan, dinonaktifkan, atau dihapus, dan peran penjual tidak diubah dari sini.",
    bad: true,
  },
  "kategori-ditambah": { text: "Kategori ditambahkan." },
  "kategori-diubah": { text: "Nama kategori diubah." },
  "kategori-diurutkan": { text: "Urutan kategori diubah." },
  "kategori-dihapus": { text: "Kategori dihapus." },
  "kategori-dipakai": { text: "Kategori masih dipakai produk, jadi belum dapat dihapus. Pindahkan atau hapus produknya lebih dulu.", bad: true },
  "kategori-ganda": { text: "Nama kategori itu sudah ada. Gunakan nama yang berbeda.", bad: true },
  "kategori-nama": { text: "Nama kategori harus 2 sampai 40 karakter.", bad: true },
  "produk-disembunyikan": { text: "Produk disembunyikan dari katalog." },
  "produk-ditampilkan": { text: "Produk ditampilkan kembali." },
  "produk-dihapus": { text: "Produk dihapus." },
  "ulasan-disembunyikan": { text: "Ulasan disembunyikan dan tidak dihitung dalam rating." },
  "ulasan-ditampilkan": { text: "Ulasan ditampilkan kembali." },
  "ulasan-dihapus": { text: "Ulasan dihapus." },
  "tidak-ditemukan": { text: "Data tidak ditemukan. Mungkin sudah diubah atau dihapus.", bad: true },
  gagal: { text: "Aksi belum berhasil. Muat ulang halaman, lalu coba lagi.", bad: true },
} as const satisfies Record<string, { text: string; bad?: boolean }>;

export type FlashCode = keyof typeof ADMIN_FLASH;

export function flashFor(code: string | string[] | undefined): { text: string; bad: boolean } | null {
  const key = Array.isArray(code) ? code[0] : code;
  if (!key || !Object.prototype.hasOwnProperty.call(ADMIN_FLASH, key)) return null;

  const entry = ADMIN_FLASH[key as FlashCode] as { text: string; bad?: boolean };
  return { text: entry.text, bad: !!entry.bad };
}
