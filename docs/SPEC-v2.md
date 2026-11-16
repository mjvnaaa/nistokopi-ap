# SPEC-v2.md: NistoKopi Production

Versi 2.0 (draf untuk persetujuan) · 16 November 2026
Menggantikan sebagian `SPEC.md` v1 (versi workshop). Acuan perilaku awal: `NistoKopi_Prototipe_v2.html`.

Status per kebutuhan: **[TETAP]** sama dengan v1, **[UBAH]** v1 diubah, **[BARU]** belum ada di v1.

---

## 1. Perubahan dari v1

| Hal | v1 (workshop) | v2 (production) |
|---|---|---|
| Pengguna | Tanpa login, satu pengelola | Tiga peran dengan login: Admin, Seller, Pembeli |
| Usaha | Satu katalog satu usaha | Banyak toko (seller) dalam satu katalog |
| Penyimpanan | localStorage | PostgreSQL lewat Prisma |
| Foto | Data URL di localStorage | File di Vercel Blob, URL di database |
| Nomor WhatsApp | Satu nomor global | Satu nomor per toko |
| Keamanan | Dashboard terbuka | Otorisasi di server pada setiap aksi |
| Teknologi | Vite, Vanilla JS | Next.js (App Router), TypeScript, Vercel |
| Tetap berlaku | Tanpa keranjang, checkout, pembayaran, riwayat transaksi. Pemesanan hanya lewat WhatsApp. Semua data contoh fiktif dan tanpa klaim asal kebun, sertifikasi, skor cupping, atau rasa. |

## 2. Teknologi

| Komponen | Pilihan | Catatan |
|---|---|---|
| Kerangka | Next.js (App Router) + TypeScript | Pada Next.js 16, `middleware.ts` bernama `proxy.ts`. |
| Database | PostgreSQL (Neon lewat Vercel Marketplace) | SQLite tidak dipakai karena tidak cocok di Vercel. |
| ORM | Prisma 7 | Generator `prisma-client` dengan `output`, URL database di `prisma.config.ts`, adapter `@prisma/adapter-pg`. |
| Autentikasi | **Better Auth** (email + kata sandi) | Pengganti Auth.js yang diusulkan di prompt awal. Lihat 2.1. |
| Validasi | Zod | Satu skema dipakai klien dan server. |
| Foto | Vercel Blob | JPG, PNG, WebP, maksimal 2 MB, divalidasi di server. |
| Pengujian | Vitest | Logika, otorisasi, dan validasi. |
| Hosting | Vercel | Database dan Blob terpisah untuk Preview dan Production. |

### 2.1 Mengapa Better Auth, bukan Auth.js

Auth.js v5 masih berstatus beta, dan pada Juli 2026 menerima beberapa perbaikan keamanan, termasuk satu celah bypass autentikasi yang hanya memengaruhi v5 beta. Pemeliharaannya kini berada di tim Better Auth, yang mengarahkan proyek baru ke Better Auth. Karena aplikasi ini memegang akun dengan hak admin, v2 memakai Better Auth. Tabel `User`, `Session`, `Account`, dan `Verification` di `schema.prisma` mengikuti skema Better Auth. **Versi dan skema perlu dicocokkan lagi dengan `npx @better-auth/cli generate` saat T-V2-11.**

## 3. Peran dan hak akses

| Aksi | Tamu | Pembeli | Seller disetujui | Seller belum disetujui | Admin |
|---|---|---|---|---|---|
| Jelajah katalog, cari, filter, urut | ✔ | ✔ | ✔ | ✔ | ✔ |
| Pesan lewat WhatsApp | ✔ | ✔ | ✔ | ✔ | ✔ |
| Favorit dan ulasan | ✘ | ✔ | ✘ | ✘ | ✘ |
| Kelola profil toko sendiri | ✘ | ✘ | ✔ | ✔ | ✘ |
| Tambah, ubah, hapus, nonaktifkan **produk sendiri** | ✘ | ✘ | ✔ | ✘ | ✘ |
| Statistik toko sendiri | ✘ | ✘ | ✔ | ✘ | ✘ |
| Setujui, tolak, tangguhkan seller | ✘ | ✘ | ✘ | ✘ | ✔ |
| Kelola pengguna (peran, aktif/nonaktif) | ✘ | ✘ | ✘ | ✘ | ✔ |
| Kelola kategori | ✘ | ✘ | ✘ | ✘ | ✔ |
| Sembunyikan atau hapus produk dan ulasan siapa pun | ✘ | ✘ | ✘ | ✘ | ✔ |
| Dashboard platform dan audit log | ✘ | ✘ | ✘ | ✘ | ✔ |

Akun berstatus `SUSPENDED` kehilangan semua hak di atas, kecuali menjelajah sebagai tamu. Aturan ini dikodekan di `src/lib/authz.ts` dan dicek di server.

## 4. Kebutuhan fungsional

### 4.1 Katalog publik
- **KAT-01 [UBAH]** Kartu produk menampilkan foto atau ikon pengganti, nama, deskripsi, kategori, harga, status stok, nama toko, dan rata-rata rating bila ada ulasan.
- **KAT-02 [TETAP]** Penanda unggulan; stok 6+ "Stok N", 1 sampai 5 "Stok tinggal N", 0 "Stok habis"; harga format `Rp55.000`.
- **KAT-03 [BARU]** Hanya produk yang **terlihat publik** yang tampil: `isActive`, bukan `hiddenByAdmin`, seller berstatus `APPROVED`, dan akun seller `ACTIVE`.
- **KAT-04 [BARU]** Halaman toko `/toko/[slug]` berisi profil toko dan produknya.
- **KAT-05 [BARU]** Halaman produk `/produk/[id]` berisi detail, ulasan, dan tombol pesan.
- **CAR-01 [UBAH]** Pencarian nama dan deskripsi, filter kategori, filter "Hanya yang tersedia", **filter toko**, pengurutan (nama A–Z, termurah, termahal, unggulan dulu, **rating tertinggi**). Semua berlaku bersamaan dan tercermin di URL agar dapat dibagikan.
- **CAR-02 [BARU]** Hasil dibagi per halaman (24 produk per halaman).

### 4.2 Pemesanan lewat WhatsApp
- **WA-01 [UBAH]** Tombol membuka `https://wa.me/<nomor toko>?text=<pesan>` di tab baru dengan `noopener noreferrer`. Nomor milik **seller pemilik produk**.
- **WA-02 [UBAH]** Pesan: `Halo, saya ingin memesan {nama} ({harga}). Apakah masih tersedia?`
- **WA-03 [TETAP]** Stok 0: tombol nonaktif "Tidak tersedia".
- **WA-04 [TETAP]** Nomor toko dinormalkan ke `62xxxxxxxxxx` dan divalidasi `^62\d{8,13}$`.
- **WA-05 [BARU]** Setiap klik tombol dicatat sebagai `OrderClick` (produk, pembeli bila login, waktu) lewat endpoint server sebelum membuka WhatsApp. Pencatatan gagal tidak boleh menghalangi pembeli membuka WhatsApp.
- **WA-06 [TETAP]** Aplikasi tidak memproses atau melacak pesanan. `OrderClick` hanyalah statistik minat.

### 4.3 Akun
- **AKN-01 [BARU]** Daftar sebagai Pembeli (nama, email, kata sandi minimal 10 karakter). Email disimpan huruf kecil dan unik.
- **AKN-02 [BARU]** Daftar sebagai Seller: akun dibuat dengan peran `SELLER` dan `SellerProfile` berstatus `PENDING`. Toko tidak tampil publik sampai disetujui admin.
- **AKN-03 [BARU]** Masuk, keluar, ubah profil dan kata sandi. Pesan galat masuk tidak membocorkan apakah email terdaftar. Percobaan masuk dibatasi lajunya.
- **AKN-04 [BARU]** Pengguna tidak dapat mengubah peran dirinya sendiri.

### 4.4 Pembeli
- **PMB-01 [BARU]** Favorit: tambah dan hapus produk dari daftar favorit, halaman `/akun/favorit`.
- **PMB-02 [BARU]** Ulasan: rating 1 sampai 5 dan komentar opsional (maksimal 500 karakter), **satu ulasan per produk per pembeli**, dapat diubah atau dihapus oleh pembuatnya.

### 4.5 Seller
- **SLR-01 [BARU]** Profil toko: nama (3 sampai 60), deskripsi (maksimal 300), kota, nomor WhatsApp. Slug dibuat dari nama toko dan unik.
- **SLR-02 [UBAH]** CRUD produk **miliknya saja** dengan aturan data di bagian 6. Hapus meminta konfirmasi. Seller dapat menonaktifkan produk (`isActive = false`) tanpa menghapusnya.
- **SLR-03 [UBAH]** Unggah foto ke Vercel Blob (maks. 2 MB). Foto lama dihapus dari Blob saat diganti atau produk dihapus.
- **SLR-04 [BARU]** Statistik toko: jumlah produk, total stok, klik WhatsApp per produk (7 dan 30 hari terakhir), ulasan masuk.
- **SLR-05 [BARU]** Selama `PENDING` atau `REJECTED`, seller hanya melihat status dan catatan admin serta dapat mengedit profil. Selama `SUSPENDED`, dashboard hanya-baca.

### 4.6 Admin
- **ADM-01 [BARU]** Antrean seller: setujui, tolak (dengan catatan), tangguhkan, aktifkan kembali.
- **ADM-02 [BARU]** Daftar pengguna: cari, ubah peran, aktifkan atau nonaktifkan, hapus. **Admin aktif terakhir tidak boleh diturunkan, dinonaktifkan, atau dihapus.** Admin tidak boleh menghapus akunnya sendiri.
- **ADM-03 [BARU]** Kategori: tambah, ubah nama, atur urutan, hapus **hanya jika belum dipakai produk**.
- **ADM-04 [BARU]** Moderasi: sembunyikan atau tampilkan produk (`hiddenByAdmin`), hapus produk, sembunyikan atau hapus ulasan.
- **ADM-05 [BARU]** Dashboard platform: jumlah pengguna per peran, seller menunggu persetujuan, jumlah produk, klik WhatsApp 7 dan 30 hari terakhir.
- **ADM-06 [BARU]** Audit log: setiap aksi admin (persetujuan seller, perubahan peran, penangguhan, moderasi, kategori) dicatat dengan pelaku, waktu, sasaran, dan data pendukung. Log tidak dapat diubah dari aplikasi.

### 4.7 Ekspor dan impor [BARU, ditunda]
Ekspor/impor JSON dari v1 tidak termasuk kebutuhan awal v2 karena data kini ada di database. Dapat ditambahkan nanti sebagai ekspor produk per seller.

## 5. Rute (usulan)

| Rute | Akses |
|---|---|
| `/` (katalog), `/toko/[slug]`, `/produk/[id]`, `/masuk`, `/daftar` | Tamu dan semua peran |
| `/akun`, `/akun/favorit` | Pembeli |
| `/seller`, `/seller/produk`, `/seller/produk/baru`, `/seller/profil` | Seller |
| `/admin`, `/admin/seller`, `/admin/pengguna`, `/admin/kategori`, `/admin/moderasi`, `/admin/log` | Admin |

Pengalihan di `proxy.ts` hanya memperbaiki pengalaman pengguna. **Otorisasi sebenarnya dicek lagi di setiap route handler dan server action.**

## 6. Model dan aturan data

Skema lengkap ada di `prisma/schema.prisma`. Aturan yang dipakai bersama klien dan server (`src/lib/validation.ts`):

| Data | Aturan |
|---|---|
| Nama produk | Wajib, maksimal 80, **unik per seller tanpa peduli huruf besar-kecil** (`nameKey`). |
| Kategori | Wajib, dipilih dari tabel `Category` (tidak diketik bebas). |
| Deskripsi | Wajib, maksimal 240. |
| Harga | Bilangan bulat 1 sampai 1.000.000.000 (rupiah). |
| Stok | Bilangan bulat 0 sampai 1.000.000. |
| Foto | URL `https://` dari Blob, opsional. |
| Nama toko | 3 sampai 60, slug unik. |
| WhatsApp | Format `62xxxxxxxxxx` setelah normalisasi. |
| Rating | Bilangan bulat 1 sampai 5, satu ulasan per pembeli per produk. |

Penghapusan: produk menghapus favorit, ulasan, dan klik terkait (cascade). Kategori yang masih dipakai tidak dapat dihapus (restrict). Menghapus pengguna menghapus sesi, akun, favorit, dan ulasannya. Klik dan audit log tetap ada dengan pelaku kosong.

## 7. Keamanan dan privasi

- Otorisasi di server untuk setiap aksi tulis dan setiap halaman area seller/admin, termasuk cek kepemilikan produk dan cek status akun pada **setiap** permintaan (bukan hanya saat masuk).
- Kata sandi di-hash oleh Better Auth (tidak disimpan polos), batas laju untuk masuk dan daftar, cookie sesi `httpOnly` dan `secure`.
- Semua teks pengguna di-escape. Tidak ada HTML mentah dari masukan. Header keamanan dan Content-Security-Policy diatur di `next.config`.
- Unggahan foto divalidasi jenis (cek isi berkas, bukan hanya ekstensi) dan ukuran di server.
- Rahasia hanya di environment variable (`.env.example` disediakan). Tidak ada rahasia di repository.
- Data pribadi minimal: nama, email, dan nomor WhatsApp toko (tampil publik, seller diberi tahu saat mengisi). Tidak ada pelacak pihak ketiga.
- Seed hanya untuk development dan staging, menolak berjalan di production kecuali dipaksa lewat variabel khusus.

## 8. Non-fungsional

Responsif dari 360 px; dapat dipakai penuh dengan keyboard; kontras minimal 4,5:1; bahasa Indonesia sederhana; halaman katalog dirender di server dengan cache yang dibatalkan saat data berubah; Lighthouse performa dan aksesibilitas target 90 ke atas; teks galat menjelaskan cara memperbaiki.

## 9. Deploy

- Proyek Vercel terhubung ke GitHub. Branch `main` untuk Production, branch lain untuk Preview.
- Database Neon terpisah untuk Preview dan Production. `prisma migrate deploy` dijalankan saat build, dan `prisma generate` sebelum `next build`.
- Variabel: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BLOB_READ_WRITE_TOKEN`.
- Admin pertama di production dibuat lewat skrip terpisah (`npm run create-admin`) yang membaca email dan kata sandi dari input aman, **bukan** lewat seed.

## 10. Kriteria penerimaan

1. Tamu dapat menjelajah, mencari, memfilter per kategori dan toko, serta memesan lewat WhatsApp ke nomor toko yang benar.
2. Produk dari seller `PENDING`, produk `isActive = false`, dan produk `hiddenByAdmin` tidak muncul di katalog, halaman toko, maupun pencarian.
3. Seller A tidak dapat mengubah, menghapus, atau menonaktifkan produk seller B, baik lewat antarmuka maupun permintaan langsung ke server (diuji otomatis).
4. Pembeli dan tamu mendapat penolakan (403 atau pengalihan) saat membuka `/admin` dan `/seller`, termasuk lewat permintaan langsung.
5. Seller yang baru mendaftar tidak dapat menambah produk sampai admin menyetujui, dan setelah disetujui tokonya tampil di katalog.
6. Admin terakhir tidak dapat diturunkan, dinonaktifkan, atau dihapus.
7. Akun yang dinonaktifkan langsung kehilangan akses pada permintaan berikutnya.
8. Satu pembeli hanya dapat memiliki satu ulasan per produk. Ulasan tersembunyi tidak tampil dan tidak dihitung dalam rating.
9. Setiap aksi admin tercatat di audit log.
10. Setelah `prisma migrate deploy` dan seed di lingkungan staging, katalog menampilkan 16 produk dari 2 toko, dengan 1 stok habis, 2 stok menipis, dan produk unggulan.
11. `npm test`, `npm run build`, dan `prisma migrate deploy` berhasil di CI. Aplikasi berjalan di Vercel Preview.
12. Semua alur utama dapat diselesaikan dengan keyboard di lebar 360 px.

## 11. Asumsi yang saya ambil (mohon dikonfirmasi)

1. Seller baru harus disetujui admin sebelum tampil.
2. Hanya pembeli (bukan seller atau admin) yang dapat memberi ulasan dan favorit.
3. Satu akun seller memiliki tepat satu toko.
4. Daftar sendiri hanya untuk Pembeli dan Seller. Admin dibuat lewat skrip, bukan formulir publik.
5. Verifikasi email dan pemulihan kata sandi lewat email **tidak** termasuk tahap awal (membutuhkan layanan email). Dicatat sebagai pengembangan lanjutan.
6. Pembeli tidak wajib login untuk memesan. Klik pesan tamu dicatat tanpa identitas.

## 12. Pertanyaan terbuka

- Apakah seller perlu verifikasi tambahan (KTP atau bukti usaha) sebelum disetujui?
- Apakah toko ditangguhkan boleh tetap tampil dengan label, atau disembunyikan penuh? (Draf ini: disembunyikan.)
- Apakah komisi atau paket langganan seller direncanakan? (Di luar lingkup v2.)
