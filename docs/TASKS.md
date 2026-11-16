# TASKS.md: Daftar Tugas NistoKopi

Versi 1.0 · 16 November 2026
Turunan dari `SPEC.md` dan `UI-SPEC.md`. Prototipe `NistoKopi_Prototipe_v2.html` menjadi acuan perilaku dan tampilan.

---

## Cara memakai dokumen ini

1. Kerjakan **satu tugas per giliran**, sesuai urutan. Jangan meminta AI mengerjakan beberapa tugas sekaligus.
2. Setiap tugas punya **hasil** dan **cara memeriksa**. Tugas selesai hanya jika cara memeriksanya lolos.
3. Setelah tugas lolos: jalankan `npm test`, lalu **commit kecil** dengan pesan yang menyebut ID tugas, misalnya `T-12: urutkan produk`.
4. Beri AI konteks yang cukup: sebut ID tugas dan kutip bagian `SPEC.md` atau `UI-SPEC.md` yang relevan.
5. Jangan memasukkan data pribadi, nomor WhatsApp asli, atau informasi usaha yang rahasia ke percakapan AI. Pakai data demo.
6. Tinjau setiap perubahan dari AI. Minta penjelasan jika ada kode yang belum dipahami.

**Penanda:** `[ ]` belum, `[x]` selesai. Kolom **Acuan** menunjukkan bagian prototipe yang bisa dipelajari. Tugas bertanda **[BARU]** belum ada di prototipe.

---

## Fase 0. Fondasi proyek

| ID | Tugas | Cara memeriksa |
|---|---|---|
| [ ] T-01 | Buat repository GitHub `nistokopi`, kloning ke komputer, tambahkan `.gitignore` (node_modules, dist). | `git status` bersih, repository tampil di GitHub. |
| [ ] T-02 | Inisialisasi Vite vanilla JavaScript. Hapus berkas contoh bawaan. Tambahkan skrip `dev`, `build`, `preview`, `test`. | `npm run dev` menampilkan halaman kosong tanpa galat. |
| [ ] T-03 | Pasang Vitest. Tambahkan satu tes contoh yang lulus. | `npm test` lulus. |
| [ ] T-04 | Buat struktur folder sesuai `SPEC.md` bagian 9. Tambahkan `README.md` singkat (tujuan, cara menjalankan, status prototipe, batasan). | Struktur ada, README terbaca. |
| [ ] T-05 | Salin `Catatan-Proyek-NistoKopi.md`, `SPEC.md`, `UI-SPEC.md`, `TASKS.md` ke folder `docs/` dan commit. | Dokumen ada di repository. |

## Fase 1. Logika murni dan pengujian

Semua tugas fase ini **tanpa DOM**, dengan tes Vitest untuk setiap fungsi.

| ID | Tugas | Acuan | Cara memeriksa |
|---|---|---|---|
| [ ] T-06 | `data/demo.js`: delapan produk contoh sesuai `SPEC.md` 6.2. Setiap deskripsi berakhir "Data contoh." | `DEMO` | Tes: 8 produk, tidak ada kata "sertifikat", "skor", atau nama kebun. |
| [ ] T-07 | `lib/format.js`: `rp(n)` (contoh `Rp55.000`) dan `esc(s)` (escape `& < > " '`). | `rp`, `esc` | Tes: `rp(150000)` = `Rp150.000`, `esc('<b>')` tidak mengandung `<`. |
| [ ] T-08 | `lib/validate.js`: `cleanProduct(input, prefix)` mengembalikan `{data}` atau `{error}` sesuai `SPEC.md` 6.1 (nama, kategori, deskripsi, harga bulat 1 sampai 1e9, stok bulat 0 sampai 1e6, featured boolean, image data URL ≤ 400.000). | `clean`, `okImg` | Tes tabel: nilai valid, kosong, negatif, pecahan, string, `featured: "ya"`, gambar bukan data URL, teks melebihi batas. |
| [ ] T-09 | `lib/validate.js`: `canonCategory(list, kat)` menyamakan penulisan kategori tanpa peduli huruf, dan `unifyCategories(list)`. | `canonCat`, `unify` | Tes: `arabika` menjadi `Arabika` jika sudah ada. |
| [ ] T-10 | `lib/validate.js`: `isDuplicateName(list, name, exceptId)` tanpa peduli huruf. | submit handler | Tes: `ROBUSTA banyuwangi...` terdeteksi, produk yang sedang diubah dikecualikan. |
| [ ] T-11 | `lib/storage.js`: `loadProducts()`, `saveProducts()`, `loadWA()`, `saveWA()` memakai kunci `nistokopi:products:v1` dan `nistokopi:wa:v1`. Data rusak atau kosong menghasilkan data demo. Kegagalan menyimpan dikembalikan sebagai hasil, tidak melempar galat. | `load`, `save` | Tes dengan localStorage tiruan: data rusak, produk tidak valid dibuang, penyimpanan penuh tidak membuat aplikasi error. |
| [ ] T-12 | `lib/query.js`: `queryProducts(list, {q, cat, availOnly, sort})` untuk cari, filter, urut (nama, murah, mahal, unggulan) sekaligus. `listCategories(list)` dengan jumlah per kategori. | `visible`, `categories` | Tes: kombinasi cari + kategori + tersedia + urut; urutan nama bahasa Indonesia; unggulan dulu lalu nama. |
| [ ] T-13 | `lib/whatsapp.js`: `normalizeWA(input)` dan `waLink(product, number)`. | `normWA`, `waLink` | Tes: `0812-3456-7890`, `+62 812-3456-7890`, `812 3456 7890`, `62812...` menjadi `6281234567890`; `123` dan teks kosong ditolak; pesan ter-encode dan memuat nama serta harga. |
| [ ] T-14 | `lib/status.js`: `stockStatus(stock)` mengembalikan `ok`, `low` (1 sampai 5), atau `out` (0) beserta teksnya. | `renderCatalog` | Tes: 30 → "Stok 30", 5 → "Stok tinggal 5", 0 → "Stok habis". |

## Fase 2. Kerangka dan Katalog

| ID | Tugas | Acuan | Cara memeriksa |
|---|---|---|---|
| [ ] T-15 | `style.css`: token warna, huruf, jarak, radius sesuai `UI-SPEC.md` bagian 2. Tautkan Google Fonts di `index.html`. | CSS prototipe | Variabel CSS ada, huruf Fraunces dan Figtree termuat. |
| [ ] T-16 | Kerangka halaman: strip atas, header lengket dengan logo dan menu, footer, area aman iOS. Router hash `#katalog` dan `#dashboard` di `main.js` (judul dokumen, gulir ke atas, fokus ke `<h1>`). | `route`, `header.top` | Menu berpindah tanpa memuat ulang, `aria-current` benar, fokus pindah ke judul. |
| [ ] T-17 | Hero katalog, jejak halaman, kalimat pembuka (`UI-SPEC.md` 4.2). | `.hero` | Cocok dengan `UI-SPEC.md`, terbaca di 360 px. |
| [ ] T-18 | Pill kategori dari `listCategories`, termasuk "Semua" dan jumlahnya. Pilihan kembali ke "Semua" jika kategori hilang. | `fillCategories` | Klik pill memfilter, fokus keyboard terlihat. |
| [ ] T-19 | Bilah alat: kolom cari, kotak "Hanya yang tersedia", menu urut. Teks "Menampilkan X dari Y produk" dengan `aria-live`. | `.toolbar`, `renderCatalog` | Ketiganya bekerja bersamaan sesuai `SPEC.md` CAR-05. |
| [ ] T-20 | Kartu produk (`UI-SPEC.md` 4.5): tile foto atau ikon, penanda unggulan, pill kategori, status stok, nama, deskripsi, harga. Semua teks lewat `esc`. | `.card` | Produk dengan nama `<img src=x onerror=alert(1)>` tampil sebagai teks. Kartu seragam tingginya. |
| [ ] T-21 | Tombol WhatsApp pada kartu, tombol nonaktif saat stok 0. | `waLink` | Tab baru terbuka dengan pesan benar. Produk stok 0 tidak punya tautan. |
| [ ] T-22 | Keadaan kosong: tidak ada hasil (dengan "Hapus filter") dan katalog kosong. | `#b-clear` | Kedua keadaan tampil dan "Hapus filter" mengembalikan semua pilihan. |

## Fase 3. Dashboard

| ID | Tugas | Acuan | Cara memeriksa |
|---|---|---|---|
| [ ] T-23 | Tampilan Dashboard: judul, penjelasan batasan tanpa login, tiga kartu ringkasan yang diperbarui setelah setiap perubahan. | `renderDash` | Angka cocok dengan data, total stok berformat ribuan. |
| [ ] T-24 | Formulir tambah produk dengan validasi per kolom (`aria-invalid`, pesan di bawah kolom, fokus ke kolom salah pertama), saran kategori, pencegahan nama ganda. | submit handler | Setiap aturan `SPEC.md` 6.1 menampilkan pesan yang tepat. Produk valid muncul di katalog. |
| [ ] T-25 | Tabel daftar produk dengan Ubah dan Hapus, tabel kosong ajakan, miniatur foto. | `#tbody` | Tabel bergulir di 360 px tanpa melebarkan halaman. |
| [ ] T-26 | Ubah produk: isi formulir, judul dan tombol berubah, "Batal ubah", simpan perubahan. | handler `tbody` | Data terubah di katalog dan tabel, batal tidak mengubah data. |
| [ ] T-27 | Hapus produk dengan dialog konfirmasi (`ui/dialog.js`), toast (`ui/toast.js`). Tanpa dukungan `<dialog>`, pakai `window.confirm`. | `askConfirm`, `toast` | Batal tidak mengubah data. Menghapus produk yang sedang diubah mereset formulir. |
| [ ] T-28 | Unggah foto: validasi jenis dan ukuran (≤ 8 MB), perkecil ke 640 px, JPEG 0,75 di atas latar putih, tolak > 400.000 karakter, pratinjau dan "Hapus foto". | `#p-img` handler | Foto besar diperkecil, berkas bukan gambar ditolak dengan pesan jelas. |
| [ ] T-29 | Panel nomor WhatsApp: normalisasi, validasi, catatan "nomor contoh" selama masih bawaan, simpan di localStorage. | `wform` handler | Nomor tersimpan setelah muat ulang, tautan pesan memakai nomor baru. |
| [ ] T-30 | Reset data demo dengan konfirmasi. | `#b-reset` | Data kembali ke 8 produk contoh, nomor WhatsApp tidak berubah. |

## Fase 4. Ekspor dan impor JSON **[BARU]**

| ID | Tugas | Cara memeriksa |
|---|---|---|
| [ ] T-31 | `lib/transfer.js`: `exportProducts(list)` menghasilkan teks JSON tanpa `id`, `image` hanya jika ada, dan `exportFileName(date)` = `nistokopi-produk-YYYY-MM-DD.json`. | Tes: tidak ada kolom `id`, nama berkas sesuai tanggal. |
| [ ] T-32 | `lib/transfer.js`: `parseImport(text)` sesuai `SPEC.md` bagian 7: JSON valid, larik 1 sampai 500, validasi tiap produk dengan `cleanProduct`, tolak nama ganda dalam berkas, semua atau tidak sama sekali, pesan "Produk ke-N: ...". | Tes tabel: JSON rusak, bukan larik, larik kosong, 501 produk, harga negatif di produk ke-3, nama ganda, berkas valid. |
| [ ] T-33 | Tombol "Ekspor JSON": unduh berkas, pemberitahuan jumlah produk, pemberitahuan jika kosong. | Berkas terunduh dan terbaca sebagai JSON. |
| [ ] T-34 | Tombol "Impor JSON": pilih berkas, batas 5 MB dan jenis berkas, pesan galat di bawah tombol, dialog konfirmasi sebelum mengganti data. | Impor berkas valid mengganti data. Satu produk tidak valid membatalkan semuanya dan data lama utuh. |
| [ ] T-35 | Uji pulang-pergi: ekspor lalu impor menghasilkan daftar yang sama (kecuali `id`). | Tes lulus. |

## Fase 5. Penyempurnaan

| ID | Tugas | Cara memeriksa |
|---|---|---|
| [ ] T-36 | Periksa seluruh `UI-SPEC.md` bagian 10 (daftar periksa tampilan) dan perbaiki yang belum sesuai. | Semua kotak tercentang. |
| [ ] T-37 | Aksesibilitas: uji penuh dengan keyboard di 360 px, periksa kontras warna, uji dengan pembaca layar (VoiceOver atau TalkBack) pada alur cari → pesan. | Semua alur dapat diselesaikan tanpa mouse. |
| [ ] T-38 | Uji kinerja: muat 500 produk (hasil impor) dan ketik di kolom cari. | Tidak terasa tersendat. |
| [ ] T-39 | Uji `prefers-reduced-motion` dan mode gelap perangkat (tampilan memakai tema terang tetap dan harus tetap terbaca). | Tidak ada transisi saat reduced motion aktif. |
| [ ] T-40 | Tinjau keamanan: tidak ada `innerHTML` dengan teks mentah, semua tautan luar memakai `noopener noreferrer`, tidak ada sumber luar selain Google Fonts. | Daftar periksa keamanan di README terisi. |

## Fase 6. Rilis workshop

| ID | Tugas | Cara memeriksa |
|---|---|---|
| [ ] T-41 | Jalankan `npm test` dan `npm run build`. Perbaiki semua kegagalan. | Keduanya lulus tanpa galat. |
| [ ] T-42 | Cocokkan hasil dengan 12 kriteria penerimaan di `SPEC.md` bagian 10. Catat hasilnya di README. | Semua butir lulus. |
| [ ] T-43 | Pastikan semua data tetap fiktif dan strip atas "Prototipe" tampil. Tidak ada nomor WhatsApp nyata di kode. | Tinjauan manual. |
| [ ] T-44 | Perbarui `Catatan-Proyek-NistoKopi.md` (status fitur, riwayat pembaruan), beri tag versi `v1.0-workshop`, dan dorong ke GitHub. | Tag tampil di GitHub. |
| [ ] T-45 | (Opsional) Terbitkan hasil `npm run build` ke layanan hosting statis. | Alamat publik dapat dibuka dari ponsel. |

---

## Definisi selesai (berlaku untuk setiap tugas)

- Hasil sesuai `SPEC.md` dan `UI-SPEC.md`.
- Cara memeriksa lolos, termasuk tes otomatis untuk logika.
- `npm test` lulus dan aplikasi masih berjalan.
- Kode sudah ditinjau dan dipahami oleh pengerjanya.
- Perubahan sudah di-commit dengan pesan yang menyebut ID tugas.

## Contoh perintah untuk AI (T-12)

> Kerjakan **T-12** dari `TASKS.md`. Buat `src/lib/query.js` dengan fungsi `queryProducts` dan `listCategories` sesuai `SPEC.md` bagian 5.3 (CAR-01 sampai CAR-06). Jangan menyentuh DOM. Urutan nama memakai `localeCompare(..., 'id')`. Buat `tests/query.test.js` yang menguji kombinasi cari + kategori + hanya tersedia + semua opsi urut, termasuk "unggulan dulu" yang tie-break-nya nama. Jelaskan singkat perubahan yang kamu buat.

## Risiko yang dipantau selama pengerjaan

| Risiko | Tanda | Tindakan |
|---|---|---|
| AI menambah fitur di luar lingkup (keranjang, login, pembayaran) | Ada berkas atau kode di luar `SPEC.md` | Tolak perubahan, ingatkan bagian "Bukan tujuan". |
| AI mengarang klaim produk | Deskripsi menyebut asal kebun, sertifikat, skor cupping, rasa | Hapus, ganti dengan teks netral dan "Data contoh." |
| Validasi berbeda-beda antara formulir, localStorage, dan impor | Ada lebih dari satu fungsi validasi produk | Satukan ke `cleanProduct`. |
| Teks pengguna disisipkan mentah ke HTML | `innerHTML` memakai variabel tanpa `esc` | Perbaiki sebelum commit (T-40). |
| Penyimpanan penuh karena foto | Pesan galat penyimpanan sering muncul | Perkecil foto, batasi jumlah foto, catat di README. |
