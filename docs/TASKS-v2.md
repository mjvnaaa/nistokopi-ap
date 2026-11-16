# TASKS-v2.md: Daftar Tugas NistoKopi Production

Versi 2.0 (draf) · 16 November 2026
Turunan dari `SPEC-v2.md` dan `UI-SPEC-v2.md`. Pakai cara kerja yang sama dengan `TASKS.md` v1: satu tugas per giliran, commit kecil yang menyebut ID tugas, tes lulus sebelum lanjut.

**Status:**
- `[x]` dibuat dan diperiksa
- `[~]` draf sudah ditulis, **belum dijalankan** di proyek Next.js (menunggu paket terpasang)
- `[ ]` belum dikerjakan

---

## Fase 0. Fondasi proyek

| ID | Tugas | Cara memeriksa | Status |
|---|---|---|---|
| T-V2-01 | `npx create-next-app@latest` (TypeScript, App Router, `src/`, alias `@/*`). Hapus berkas contoh. | `npm run dev` menampilkan halaman awal. | [ ] |
| T-V2-02 | Pasang: `@prisma/client @prisma/adapter-pg better-auth zod @vercel/blob`, dev: `prisma tsx dotenv vitest`. Tambah skrip `test`, `postinstall` (`prisma generate`), `build`. | `npm test` berjalan. | [ ] |
| T-V2-03 | Buat proyek Vercel dari repository GitHub. Hubungkan Neon (Marketplace) dan Blob. Pisahkan database Preview dan Production. | Variabel lingkungan muncul di Vercel. | [ ] |
| T-V2-04 | Salin berkas dari folder `nistokopi-prod/` ke proyek (lihat README), commit dokumen ke `docs/`. | Struktur sesuai README. | [ ] |

## Fase 1. Database

| ID | Tugas | Cara memeriksa | Status |
|---|---|---|---|
| T-V2-05 | Skema Prisma: pengguna, toko, kategori, produk, favorit, ulasan, klik, audit log. | `prisma/schema.prisma` memuat semua model di SPEC-v2 bagian 6. | [~] |
| T-V2-06 | `prisma generate` lalu `prisma migrate dev --name init`. Jika versi Prisma yang terpasang berbeda dari Prisma 7, sesuaikan generator dan konfigurasi. | Migrasi `init` terbentuk, tabel ada di database. | [ ] |
| T-V2-07 | Jalankan seed (`npx prisma db seed`) dua kali. | Tidak ada galat, jumlah data tetap sama: 8 pengguna, 18 produk (16 publik). | [~] |

## Fase 2. Logika murni dan pengujian

| ID | Tugas | Cara memeriksa | Status |
|---|---|---|---|
| T-V2-08 | `lib/whatsapp.ts`: normalisasi nomor, tautan pesan ke nomor toko, rupiah, status stok. | `tests/whatsapp.test.ts` lulus. | [x] |
| T-V2-09 | `lib/authz.ts`: aturan akses per peran, kepemilikan produk, perlindungan admin terakhir, keterlihatan publik. | `tests/authz.test.ts` lulus. Mencakup "seller tidak bisa mengubah produk seller lain" dan "pembeli tidak bisa membuka admin". | [x] |
| T-V2-10 | `lib/validation.ts` (Zod): produk, profil toko, ulasan. Tambah tes tabel untuk setiap aturan SPEC-v2 bagian 6. | Tes lulus setelah Zod terpasang. | [~] |

## Fase 3. Autentikasi

| ID | Tugas | Cara memeriksa | Status |
|---|---|---|---|
| T-V2-11 | Pasang Better Auth dengan adapter Prisma dan email + kata sandi. Jalankan `npx @better-auth/cli generate` dan **cocokkan** hasilnya dengan model `User/Session/Account/Verification` di skema. Tambah kolom `role` dan `status` sebagai field tambahan, nonaktifkan `role` dari input pengguna. | Daftar dan masuk berjalan. Pengguna tidak dapat menetapkan `role` saat mendaftar. | [ ] |
| T-V2-12 | `getActor()` di server: ambil sesi, pengguna, dan profil toko dari database pada **setiap permintaan** (tidak mempercayai peran di cookie), kembalikan `Actor`. Akun `SUSPENDED` dianggap tamu. | Tes: akun yang dinonaktifkan kehilangan akses pada permintaan berikutnya. | [ ] |
| T-V2-13 | Halaman `/masuk` dan `/daftar` (pilihan Pembeli atau Penjual). Daftar penjual membuat `SellerProfile` berstatus `PENDING`. | Penjual baru tidak tampil di katalog. | [ ] |
| T-V2-14 | `proxy.ts` (Next.js 16) atau `middleware.ts` untuk pengalihan `/seller` dan `/admin`. Ingat: ini hanya kenyamanan, bukan otorisasi. | Tamu dialihkan ke Masuk. | [ ] |
| T-V2-15 | Pembatasan laju masuk dan daftar, pesan galat tanpa membocorkan email terdaftar. | Percobaan berulang ditolak sementara. | [ ] |
| T-V2-16 | Skrip `npm run create-admin` untuk admin pertama di production (email dan kata sandi dari input aman). | Admin dapat masuk, skrip menolak membuat admin jika sudah ada kecuali dipaksa. | [ ] |

## Fase 4. Katalog publik

| ID | Tugas | Cara memeriksa | Status |
|---|---|---|---|
| T-V2-17 | Token CSS v1 (`UI-SPEC.md` bagian 2), huruf lewat `next/font`, kerangka halaman dan menu per peran. | Tampilan sesuai `UI-SPEC-v2.md` bagian 1. | [x] |
| T-V2-18 | Query katalog: hanya produk terlihat publik (`isProductPubliclyVisible`), cari, filter kategori, tersedia, toko, urut, paginasi 24. Parameter di URL. | Tes: produk seller `PENDING`, nonaktif, dan disembunyikan tidak muncul. | [x] |
| T-V2-19 | Halaman katalog: hero, pill kategori, bilah alat, kartu produk (toko, rating). | Sesuai UI-SPEC bagian 4 dan 3. | [x] |
| T-V2-20 | Halaman toko `/toko/[slug]` dan halaman produk `/produk/[id]`. Produk tak terlihat publik menghasilkan 404. | Tautan langsung ke produk tersembunyi menampilkan 404. | [x] |
| T-V2-21 | Endpoint klik WhatsApp: catat `OrderClick`, lalu buka `waLink` ke nomor toko. Gagal mencatat tidak menghalangi. | Klik menambah satu baris klik, tautan tetap terbuka saat database gagal. | [x] |

## Fase 5. Pembeli

| ID | Tugas | Cara memeriksa | Status |
|---|---|---|---|
| T-V2-22 | Favorit: tombol hati, halaman `/akun/favorit`. Hanya Pembeli. | Seller dan tamu ditolak di server. | [ ] |
| T-V2-23 | Ulasan: formulir rating dan komentar, satu per produk, ubah dan hapus milik sendiri. Rata-rata rating mengabaikan ulasan tersembunyi. | Ulasan kedua pada produk yang sama menjadi pembaruan. | [ ] |

## Fase 6. Seller

| ID | Tugas | Cara memeriksa | Status |
|---|---|---|---|
| T-V2-24 | Banner status dan dashboard sesuai status seller (`PENDING`, `REJECTED`, `SUSPENDED`, `APPROVED`). | Empat status menampilkan perilaku berbeda sesuai SLR-05. | [ ] |
| T-V2-25 | Profil toko: nama, deskripsi, kota, WhatsApp (normalisasi dan validasi), slug unik. | Nomor tidak valid ditolak dengan pesan contoh format. | [ ] |
| T-V2-26 | CRUD produk milik sendiri: server action dengan `canEditProduct` dan validasi Zod. Nama unik per seller tanpa peduli huruf. | Seller A yang mengirim `id` produk seller B ditolak. Diuji otomatis. | [ ] |
| T-V2-27 | Unggah foto ke Vercel Blob: cek jenis dari isi berkas, maks. 2 MB, hapus foto lama saat diganti. | Berkas bukan gambar dan berkas besar ditolak. | [ ] |
| T-V2-28 | Statistik toko: jumlah produk, total stok, klik 7 dan 30 hari, ulasan masuk. | Angka cocok dengan data seed. | [ ] |

## Fase 7. Admin

| ID | Tugas | Cara memeriksa | Status |
|---|---|---|---|
| T-V2-29 | Antrean seller: setujui, tolak (catatan wajib), tangguhkan, aktifkan kembali. Semua ke audit log. | Setelah disetujui, produk seller muncul di katalog. | [~] |
| T-V2-30 | Manajemen pengguna: cari, ubah peran, aktif/nonaktif, hapus, dengan `canChangeUserRole`, `canSetUserStatus`, `canDeleteUser`. | Admin terakhir tidak dapat diturunkan, dinonaktifkan, atau dihapus. | [~] |
| T-V2-31 | Manajemen kategori: tambah, ubah, urutkan, hapus hanya jika tidak dipakai. | Menghapus kategori terpakai ditolak dengan pesan jelas. | [~] |
| T-V2-32 | Moderasi produk dan ulasan: sembunyikan, tampilkan, hapus. | Produk tersembunyi hilang dari katalog dan seller melihat penandanya. | [~] |
| T-V2-33 | Dashboard platform dan halaman audit log. | Angka cocok dengan data, log tidak dapat diubah dari aplikasi. | [~] |

## Fase 8. Keamanan dan mutu

| ID | Tugas | Cara memeriksa | Status |
|---|---|---|---|
| T-V2-34 | Header keamanan dan Content-Security-Policy di `next.config`. Periksa tidak ada `dangerouslySetInnerHTML` dengan masukan pengguna. | Pemindai header memberi nilai baik, nama produk berisi `<img onerror>` tampil sebagai teks. | [ ] |
| T-V2-35 | Tes integrasi otorisasi: permintaan langsung ke setiap server action dan route dengan peran yang salah. | Semua ditolak sesuai matriks SPEC-v2 bagian 3. | [ ] |
| T-V2-36 | Aksesibilitas: keyboard penuh di 360 px, kontras, pembaca layar pada alur cari → pesan dan alur daftar → masuk. | Daftar periksa `UI-SPEC-v2.md` bagian 6 lengkap. | [ ] |
| T-V2-37 | Kinerja: katalog 500 produk dengan indeks yang ada, Lighthouse 90 ke atas. | Skor tercapai di Preview. | [ ] |

## Fase 9. Deploy

| ID | Tugas | Cara memeriksa | Status |
|---|---|---|---|
| T-V2-38 | CI (GitHub Actions): `npm test`, `prisma validate`, `next build`. | Pipeline hijau pada pull request. | [ ] |
| T-V2-39 | Skrip build Vercel: `prisma generate && prisma migrate deploy && next build`. Seed hanya di staging. | Preview terbangun dengan database Preview. | [ ] |
| T-V2-40 | README: variabel lingkungan, menghubungkan database dan Blob, seed lokal, langkah deploy, langkah membuat admin production. | Orang baru dapat menjalankan proyek dari README saja. | [ ] |
| T-V2-41 | Cocokkan 12 kriteria penerimaan `SPEC-v2.md` bagian 10, beri tag `v2.0.0`. | Semua butir lulus di Preview, lalu Production. | [ ] |

---

## Definisi selesai
Hasil sesuai SPEC-v2 dan UI-SPEC-v2, cara memeriksa lolos, tes otomatis untuk logika dan otorisasi lulus, kode ditinjau dan dipahami, commit menyebut ID tugas.

## Risiko yang dipantau
| Risiko | Tanda | Tindakan |
|---|---|---|
| Otorisasi hanya di tampilan | Aksi bisa dilakukan lewat permintaan langsung | Tes T-V2-35, semua server action memanggil fungsi di `authz.ts`. |
| Peran dipercaya dari cookie atau token | Peran lama tetap berlaku setelah diubah admin | `getActor()` membaca database tiap permintaan (T-V2-12). |
| Skema Better Auth berbeda dari draf | Galat tabel atau kolom saat masuk | Cocokkan dengan hasil CLI di T-V2-11. |
| Versi Prisma berbeda | Galat generator atau datasource | Ikuti petunjuk versi yang terpasang (T-V2-06). |
| Seed jalan di production | Akun dengan kata sandi seed di production | Seed menolak di production, kata sandi dari environment (T-V2-07). |
| AI menambah fitur di luar lingkup | Keranjang, pembayaran, chat muncul | Tolak, rujuk SPEC-v2 bagian 1. |
