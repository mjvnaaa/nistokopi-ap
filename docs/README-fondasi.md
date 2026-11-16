# NistoKopi Production: fondasi

Berkas di folder ini adalah **fondasi** (dokumen, skema database, seed, logika murni, dan tes) untuk mengembangkan prototipe NistoKopi menjadi aplikasi production di Vercel. Folder ini belum berupa proyek Next.js utuh.

## Isi
| Berkas | Fungsi |
|---|---|
| `docs/SPEC-v2.md`, `UI-SPEC-v2.md`, `TASKS-v2.md` | Spesifikasi dan daftar tugas versi production (draf untuk disetujui) |
| `prisma/schema.prisma`, `prisma.config.ts` | Skema PostgreSQL (Prisma 7) dan konfigurasi CLI |
| `prisma/seed.ts` | Data dummy idempoten (8 pengguna, 3 toko, 18 produk, ulasan, favorit, klik) |
| `src/lib/whatsapp.ts`, `authz.ts`, `validation.ts` | Logika murni: WhatsApp, otorisasi per peran, validasi Zod |
| `tests/` | Tes Vitest untuk WhatsApp dan otorisasi |
| `.env.example` | Daftar variabel lingkungan |

## Menyiapkan proyek
```bash
npx create-next-app@latest nistokopi --ts --app --src-dir --import-alias "@/*"
cd nistokopi
npm i @prisma/client @prisma/adapter-pg better-auth zod @vercel/blob
npm i -D prisma tsx dotenv vitest
```
Salin isi folder ini ke dalam proyek (gabungkan `src/`, `prisma/`, `tests/`, `docs/`, `prisma.config.ts`, `vitest.config.ts`, `.env.example`), lalu tambahkan skrip di `package.json`:
```json
"test": "vitest run",
"postinstall": "prisma generate",
"build": "prisma generate && prisma migrate deploy && next build"
```

## Database lokal atau staging
```bash
cp .env.example .env        # isi DATABASE_URL, DATABASE_URL_UNPOOLED, SEED_PASSWORD
npx prisma migrate dev --name init
npx prisma db seed
npm test
```
Akun dummy (semua memakai `SEED_PASSWORD`): `admin@`, `sari@`, `budi@`, `dewi@` (menunggu persetujuan), `rina@`, `agus@`, `putri@`, `hendra@` dengan domain `nistokopi.example`.

## Yang sudah dan belum diperiksa
- **Sudah dijalankan:** `authz.ts` dan `whatsapp.ts` lulus 26 pemeriksaan dengan penjalan sementara; data seed diperiksa konsistensinya (nama unik per toko, batas panjang, referensi ulasan dan favorit, nomor WhatsApp).
- **Belum dijalankan** (jaringan tidak tersedia saat penyusunan, paket belum terpasang): `prisma validate` dan migrasi, `seed.ts`, `validation.ts` (Zod), serta integrasi Better Auth. Jalankan langkah di atas dan perbaiki bila ada ketidakcocokan versi (T-V2-06, T-V2-10, T-V2-11).
- Skema `User/Session/Account/Verification` mengikuti skema Better Auth dari ingatan dan **harus dicocokkan** dengan hasil `npx @better-auth/cli generate`. Import `hashPassword` dari `better-auth/crypto` di seed juga perlu diperiksa terhadap versi terpasang.

## Keamanan
Seed menolak berjalan di production. Jangan menjalankan seed atau memakai akun dummy di database production. Admin pertama di production dibuat lewat skrip khusus (T-V2-16).
