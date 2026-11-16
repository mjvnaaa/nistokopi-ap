# UI-SPEC-v2.md: Perubahan Antarmuka untuk Production

Versi 2.0 (draf) · 16 November 2026
Berisi **selisih** terhadap `UI-SPEC.md` v1. Token warna, huruf (Fraunces dan Figtree), jarak, radius, tombol, dialog, toast, fokus keyboard, dan gaya penulisan **tetap sama** dan menjadi variabel CSS global di Next.js.

---

## 1. Kerangka dan navigasi per peran

Header tetap (logo + menu pill), strip "Prototipe" diganti strip "Data contoh" yang hanya tampil di lingkungan non-production.

| Peran | Menu | Sisi kanan |
|---|---|---|
| Tamu | Katalog | Masuk, Daftar |
| Pembeli | Katalog, Favorit | Menu akun (nama, Keluar) |
| Seller | Katalog, Dashboard toko | Menu akun |
| Admin | Katalog, Admin | Menu akun |

Menu akun berupa tombol dengan daftar pilihan yang dapat dioperasikan keyboard dan memakai `aria-expanded`. Di layar sempit (≤ 640 px) menu menjadi satu baris yang dapat digulir, dan menu akun pindah ke ujung kanan.

## 2. Halaman baru

| Halaman | Isi utama |
|---|---|
| Masuk | Satu kartu di tengah: email, kata sandi, tombol "Masuk", tautan "Daftar". Galat satu baris di atas tombol. |
| Daftar | Pilihan peran dua kartu ("Saya pembeli", "Saya penjual"), lalu formulir. Penjual melihat catatan: "Toko tampil setelah disetujui admin." |
| Toko `/toko/[slug]` | Kepala toko (nama, kota, deskripsi, tombol WhatsApp toko), lalu grid produk dengan filter yang sama seperti katalog. |
| Produk `/produk/[id]` | Foto besar kiri, info kanan (nama, toko, harga, status stok, tombol pesan, favorit), ulasan di bawah. Satu kolom di ponsel. |
| Favorit | Grid kartu yang sama dengan katalog. Kosong: "Belum ada favorit. Simpan produk dari katalog." |
| Dashboard toko | Ringkasan (jumlah produk, total stok, klik WhatsApp 7 hari), tabel produk, tombol "Tambah produk", profil toko. |
| Admin | Ringkasan platform, antrean seller, tabel pengguna, kategori, moderasi, audit log (satu halaman per bagian). |

## 3. Komponen baru

- **Kartu produk:** tambah baris kecil nama toko (tautan) di bawah nama produk dan rating bintang bila ada (`★ 4,5 (2)`). Tombol favorit berupa ikon hati di sudut tile, `aria-pressed`, label "Simpan ke favorit {nama}". Tile dan isi kartu lainnya tetap.
- **Lencana status:** pill kecil seperti pill kategori. `Menunggu` (karamel), `Disetujui` (hijau), `Ditolak` dan `Ditangguhkan` (merah), `Disembunyikan admin` (merah), `Nonaktif` (abu-abu `--tint`). Selalu berisi teks, bukan warna saja.
- **Bintang rating:** lima bintang, nilai diumumkan sebagai teks ("Rating 4 dari 5"). Masukan rating memakai kelompok radio, bukan klik bintang tanpa label.
- **Kartu ulasan:** nama pembeli, tanggal, bintang, komentar. Tombol "Laporkan" tidak ada di v2 (moderasi hanya oleh admin).
- **Tabel admin dan seller:** gaya tabel v1, kolom aksi berisi tombol kecil. Aksi berbahaya (hapus, tangguhkan) memakai dialog konfirmasi v1 dengan nama sasaran di kalimatnya.
- **Antrean persetujuan:** kartu per seller (nama toko, pemilik, tanggal daftar) dengan tombol "Setujui" dan "Tolak". "Tolak" membuka dialog berisi kolom catatan wajib.
- **Banner status seller:** di atas dashboard toko selama `PENDING`, `REJECTED`, atau `SUSPENDED`, berisi arti status dan langkah berikutnya (contoh: "Toko Anda sedang ditinjau admin. Produk belum tampil di katalog.").
- **Unggah foto:** area klik dengan pratinjau, batas jenis dan ukuran tertulis, dan progres teks ("Mengunggah...").
- **Paginasi:** tautan "Sebelumnya" dan "Berikutnya" dengan teks "Halaman 2 dari 5", bukan nomor berderet.

## 4. Keadaan

| Keadaan | Tampilan |
|---|---|
| Memuat | Kerangka kartu abu-abu hangat (`--tint`), tanpa animasi berkedip. |
| Galat jaringan atau server | Kotak seperti keadaan kosong: apa yang gagal, tombol "Coba lagi". |
| Tidak berhak (403) | Halaman sederhana: "Halaman ini hanya untuk {peran}." + tautan ke halaman yang sesuai. |
| Tidak ditemukan (404) | "Produk atau halaman tidak ditemukan." + tombol "Kembali ke katalog". |
| Sesi habis | Dialihkan ke Masuk dengan pesan "Sesi berakhir. Masuk lagi untuk melanjutkan." dan kembali ke halaman asal setelah masuk. |

## 5. Aksesibilitas tambahan

- Formulir masuk dan daftar: label terlihat, `autocomplete` yang tepat (`email`, `current-password`, `new-password`), tombol tampilkan/sembunyikan kata sandi yang dapat dijangkau keyboard.
- Perubahan hasil pada halaman berbasis URL (filter, paginasi) diumumkan lewat `aria-live` pada jumlah hasil.
- Dialog tetap memakai `<dialog>` dengan fokus awal pada tombol yang aman.
- Peran dan status selalu berupa teks, tidak hanya warna atau ikon.

## 6. Daftar periksa tambahan

- [ ] Tampilan setiap peran memuat menu yang benar dan tidak menampilkan menu peran lain.
- [ ] Kartu dengan dan tanpa rating, dengan dan tanpa foto, sama tingginya.
- [ ] Banner status seller terbaca untuk keempat status.
- [ ] Halaman produk dan toko nyaman di 360 px.
- [ ] Dashboard seller dan admin: tabel dapat digulir tanpa melebarkan halaman.
- [ ] Semua formulir dapat diselesaikan hanya dengan keyboard.
