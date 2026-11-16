# SPEC.md: Spesifikasi NistoKopi

Versi 1.0 · 16 November 2026
Dokumen turunan dari `Catatan-Proyek-NistoKopi.md`. Acuan perilaku: prototipe `NistoKopi_Prototipe_v2.html`.

Dokumen ini menjawab **apa yang harus dilakukan aplikasi**. Tampilan dijelaskan di `UI-SPEC.md`, urutan pengerjaan di `TASKS.md`.

Penanda status: **[ADA]** sudah berjalan di prototipe, **[BARU]** belum ada di prototipe dan harus dibuat.

---

## 1. Ringkasan

NistoKopi adalah katalog produk dan dashboard pengelolaan produk berbasis web untuk UMKM biji kopi khas Banyuwangi. Pembeli menjelajahi produk dan memesan lewat WhatsApp. Pemilik usaha mengelola data produk lewat dashboard lokal.

Ini **prototipe workshop Vibe Coding UMKM**, bukan sistem e-commerce dan bukan sistem produksi.

## 2. Tujuan dan bukan-tujuan

**Tujuan**

1. Calon pembeli dapat menemukan produk dan mengirim pesan pesanan ke penjual dalam beberapa ketukan.
2. Pemilik usaha dapat menambah, mengubah, dan menghapus produk tanpa bantuan programmer.
3. Hasil kerja AI dapat diperiksa lewat pengujian otomatis (Vitest) dan dijalankan di ponsel maupun komputer.

**Bukan tujuan**

- Keranjang, checkout, pembayaran, riwayat transaksi, laporan pendapatan.
- Login, autentikasi, atau hak akses berlapis.
- Banyak katalog atau banyak usaha.
- Backend, database server, sinkronisasi antarperangkat.
- Klaim produk (asal kebun, sertifikasi, skor cupping, rasa) yang tidak diberikan pemilik usaha.

## 3. Pengguna

| Pengguna | Kebutuhan utama |
|---|---|
| Calon pembeli | Mencari, membandingkan harga, memesan lewat WhatsApp |
| Pemilik UMKM (termasuk keluarga atau karyawan) | Menjaga data produk tetap mutakhir dari ponsel atau komputer |
| Peserta dan fasilitator workshop | Contoh proyek yang bisa dibaca, diuji, dan dikembangkan bertahap |

## 4. Teknologi (tetap)

HTML, CSS, Vanilla JavaScript (modul ES), Vite, localStorage, Vitest, Git, GitHub, OpenCode. Tidak ada framework frontend, backend, atau layanan database. Satu-satunya sumber luar adalah Google Fonts (Fraunces dan Figtree), dengan huruf cadangan sistem jika gagal dimuat.

---

## 5. Kebutuhan fungsional

### 5.1 Navigasi

| ID | Kebutuhan | Status |
|---|---|---|
| NAV-01 | Dua tampilan: Katalog (`#katalog`, bawaan) dan Dashboard (`#dashboard`), dipilih lewat menu di header. | [ADA] |
| NAV-02 | Perpindahan tampilan memakai hash URL tanpa memuat ulang halaman. Judul dokumen ikut berubah ("Katalog – NistoKopi", "Dashboard – NistoKopi"). | [ADA] |
| NAV-03 | Setelah berpindah tampilan, halaman kembali ke atas dan fokus keyboard pindah ke judul tampilan. | [ADA] |

### 5.2 Katalog produk

| ID | Kebutuhan | Status |
|---|---|---|
| KAT-01 | Menampilkan produk sebagai kartu: foto (atau ikon pengganti), nama, deskripsi, kategori, harga, status stok. | [ADA] |
| KAT-02 | Produk unggulan diberi penanda "Unggulan". | [ADA] |
| KAT-03 | Stok 6 atau lebih: "Stok N". Stok 1 sampai 5: "Stok tinggal N". Stok 0: "Stok habis". | [ADA] |
| KAT-04 | Harga ditampilkan dalam format rupiah Indonesia, contoh `Rp55.000`. | [ADA] |
| KAT-05 | Tampil jumlah hasil: "Menampilkan X dari Y produk", diumumkan ke pembaca layar saat berubah. | [ADA] |
| KAT-06 | Jika tidak ada produk yang cocok, tampil pesan kosong dan tombol "Hapus filter". Jika katalog memang kosong, tampil ajakan ke Dashboard. | [ADA] |
| KAT-07 | Ikon pengganti tanpa foto: ☕ untuk Robusta dan Arabika, ✨ untuk Specialty, 🎁 untuk Paket, ☕ untuk kategori lain. | [ADA] |

### 5.3 Pencarian, filter, dan pengurutan

| ID | Kebutuhan | Status |
|---|---|---|
| CAR-01 | Pencarian teks bebas pada nama dan deskripsi, tidak peka huruf besar-kecil, diperbarui saat mengetik. | [ADA] |
| CAR-02 | Filter kategori satu pilihan, plus "Semua". Setiap kategori menampilkan jumlah produknya. Daftar kategori diambil dari data produk, diurutkan A–Z. | [ADA] |
| CAR-03 | Filter "Hanya yang tersedia" menyembunyikan produk bestok 0. | [ADA] |
| CAR-04 | Pengurutan: Nama A–Z (bawaan), Harga termurah, Harga termahal, Unggulan dulu. Urutan nama memakai aturan bahasa Indonesia. Pada "Unggulan dulu", produk dengan status unggulan sama diurutkan menurut nama. | [ADA] |
| CAR-05 | Pencarian, filter kategori, filter ketersediaan, dan pengurutan berlaku **bersamaan**. | [ADA] |
| CAR-06 | Jika kategori yang sedang dipilih tidak lagi ada (produk terakhirnya dihapus atau diubah), pilihan kembali ke "Semua". | [ADA] |

### 5.4 Pemesanan lewat WhatsApp

| ID | Kebutuhan | Status |
|---|---|---|
| WA-01 | Setiap produk bestok > 0 punya tombol "Pesan lewat WhatsApp" yang membuka `https://wa.me/<nomor>?text=<pesan>` di tab baru dengan `rel="noopener noreferrer"`. | [ADA] |
| WA-02 | Pesan otomatis: `Halo NistoKopi, saya ingin memesan {nama produk} ({harga}). Apakah masih tersedia?`, di-encode dengan `encodeURIComponent`. | [ADA] |
| WA-03 | Produk bestok 0 menampilkan tombol nonaktif "Tidak tersedia" dan tidak punya tautan. | [ADA] |
| WA-04 | Nomor penjual dapat diganti di Dashboard. Input diterima dalam bentuk `0812-3456-7890`, `812...`, `62812...`, atau `+62 812...`, lalu dinormalisasi ke format `62xxxxxxxxxx`. | [ADA] |
| WA-05 | Nomor valid jika cocok `^62\d{8,13}$` setelah normalisasi. Nomor tidak valid ditolak dengan pesan yang memberi contoh format. | [ADA] |
| WA-06 | Nomor bawaan adalah **nomor contoh fiktif** `6281234567890`. Dashboard menampilkan peringatan selama nomor masih nomor contoh. | [ADA] |
| WA-07 | Aplikasi tidak memproses, mencatat, atau melacak pesanan. | [ADA] |

### 5.5 Dashboard pengelolaan

| ID | Kebutuhan | Status |
|---|---|---|
| DSH-01 | Tiga ringkasan: total produk, total stok (format ribuan Indonesia), jumlah kategori aktif. Diperbarui setelah setiap perubahan data. | [ADA] |
| DSH-02 | Formulir produk: nama, kategori (dengan saran dari kategori yang ada), harga, stok, deskripsi, foto opsional, penanda unggulan. | [ADA] |
| DSH-03 | Tambah produk: setelah berhasil, formulir dikosongkan dan muncul pemberitahuan "Produk ditambahkan." | [ADA] |
| DSH-04 | Ubah produk: tombol "Ubah" mengisi formulir dengan data produk, judul formulir menjadi "Ubah produk", tombol menjadi "Simpan perubahan", muncul "Batal ubah". Setelah berhasil: "Produk diperbarui." | [ADA] |
| DSH-05 | Hapus produk selalu meminta konfirmasi lewat dialog: "Hapus produk?" dengan nama produk. Setelah berhasil: "Produk dihapus." Jika produk yang dihapus sedang diubah, formulir direset. | [ADA] |
| DSH-06 | Tabel daftar produk: nama (dengan miniatur foto dan tanda unggulan), kategori, harga, stok ("Habis" jika 0), aksi Ubah dan Hapus. Tabel kosong menampilkan ajakan mengisi formulir. | [ADA] |
| DSH-07 | Validasi formulir dijalankan saat simpan. Setiap kolom yang salah menampilkan pesan sendiri, ditandai `aria-invalid`, dan fokus pindah ke kolom salah pertama. | [ADA] |
| DSH-08 | Foto: JPG, PNG, atau WebP, maksimal 8 MB. Foto diperkecil sisi terpanjang 640 px dan disimpan sebagai JPEG kualitas 0,75 di atas latar putih. Hasil lebih dari 400.000 karakter ditolak. Pratinjau dan tombol "Hapus foto" tersedia. | [ADA] |
| DSH-09 | Dashboard menyatakan bahwa prototipe belum memakai login dan bahwa versi nyata perlu akses khusus pengelola. | [ADA] |

### 5.6 Penyimpanan dan data

| ID | Kebutuhan | Status |
|---|---|---|
| DAT-01 | Produk disimpan di localStorage kunci `nistokopi:products:v1`. Nomor WhatsApp di kunci `nistokopi:wa:v1`. | [ADA] |
| DAT-02 | Saat dimuat, setiap produk dari localStorage divalidasi ulang. Produk tidak valid dibuang. Jika tidak ada data atau data rusak, dipakai data demo. | [ADA] |
| DAT-03 | Saat penyimpanan gagal (penuh atau tidak tersedia), pengguna diberi tahu cara mengatasinya (perkecil atau hapus foto). Aplikasi tidak error. | [ADA] |
| DAT-04 | "Reset data demo" meminta konfirmasi, lalu mengembalikan 8 produk contoh. | [ADA] |
| DAT-05 | **Ekspor JSON**: mengunduh semua produk sebagai larik JSON dengan nama berkas `nistokopi-produk-YYYY-MM-DD.json`. Kolom `id` tidak diekspor. Kolom `image` hanya disertakan jika ada. Jika tidak ada produk, tampil pemberitahuan dan tidak ada berkas. | [BARU] |
| DAT-06 | **Impor JSON**: pengguna memilih berkas `.json`. Aturan di bagian 7. | [BARU] |
| DAT-07 | Nomor WhatsApp tidak ikut dalam ekspor dan impor. | [BARU] |

---

## 6. Model data

### 6.1 Produk

| Kolom | Tipe | Aturan |
|---|---|---|
| `id` | teks | Dibuat aplikasi, unik, tidak diekspor. Saat dimuat dari localStorage, `id` yang valid dipertahankan. |
| `name` | teks | Wajib, dipangkas spasi, maksimal 80 karakter, **unik tanpa peduli huruf besar-kecil**. |
| `category` | teks | Wajib, maksimal 40 karakter. Penulisan huruf disamakan dengan kategori yang sudah ada (`arabika` menjadi `Arabika`). |
| `description` | teks | Wajib, maksimal 240 karakter. |
| `price` | bilangan bulat | 1 sampai 1.000.000.000 (rupiah). |
| `stock` | bilangan bulat | 0 sampai 1.000.000. |
| `featured` | boolean | Opsional, bawaan `false`. Jika ada tetapi bukan boolean, produk ditolak. |
| `image` | teks | Opsional. Harus data URL `data:image/(jpeg\|png\|webp);base64,...`, maksimal 400.000 karakter. Nilai tidak valid diganti kosong. |

Teks yang melebihi batas pada data yang dimuat dipotong, bukan ditolak. Pada formulir, batas dikunci di input (`maxlength`).

### 6.2 Data demo

Delapan produk fiktif: Robusta Banyuwangi Medium Roast 250 g, Dark Roast 250 g, Biji Mentah 1 kg; Arabika Ijen Medium Roast 200 g, Light Roast 200 g (stok 0), Biji Mentah 500 g; Specialty Banyuwangi 100 g; Paket Cicip Biji Kopi 3 × 100 g. Setiap deskripsi diakhiri "Data contoh." Tidak boleh ada klaim asal kebun, sertifikasi, skor cupping, atau rasa.

---

## 7. Aturan impor JSON [BARU]

1. Berkas harus berekstensi `.json` atau bertipe `application/json`, maksimal **5 MB**.
2. Isi harus JSON valid berupa **larik** berisi 1 sampai **500** produk.
3. Setiap produk divalidasi dengan **aturan yang sama** dengan 6.1. Fungsi validasi dipakai bersama oleh formulir, localStorage, dan impor.
4. Nama produk tidak boleh muncul dua kali di dalam berkas (tanpa peduli huruf besar-kecil).
5. **Semua atau tidak sama sekali**: satu produk tidak valid membatalkan seluruh impor dan tidak mengubah data yang ada.
6. Pesan galat menyebut nomor produk dan kolom, contoh: `Produk ke-3: “price” wajib berupa bilangan bulat lebih dari 0.`
7. Jika lolos, dialog konfirmasi: "Data saat ini (N produk) akan diganti dengan M produk dari file ...". Data diganti hanya setelah pengguna menyetujui.
8. Setelah berhasil: simpan, reset formulir, render ulang, pemberitahuan "Data diimpor (M produk)."
9. Berkas tidak boleh dieksekusi atau disisipkan sebagai HTML. Semua teks ditampilkan dengan pelolosan karakter khusus.

---

## 8. Kebutuhan non-fungsional

| Area | Kebutuhan |
|---|---|
| Responsif | Nyaman dari lebar 360 px sampai layar komputer. Titik patah utama 640 px. |
| Aksesibilitas | Dapat dipakai penuh dengan keyboard. Fokus selalu terlihat. Tombol dan kolom minimal 44 px tinggi sentuh. Kontras teks minimal 4,5:1. Pesan dinamis memakai `aria-live`. Dialog memakai elemen `<dialog>`. Animasi mati jika `prefers-reduced-motion`. |
| Keamanan | Semua teks dari pengguna atau berkas di-escape sebelum masuk HTML. Tautan keluar memakai `noopener noreferrer`. Berkas yang diunggah dan diimpor divalidasi jenis, ukuran, dan isinya. Dashboard tanpa login diumumkan jelas sebagai batasan. |
| Privasi | Tidak ada pelacak, analitik, atau pengiriman data ke server. Data produk dan nomor WhatsApp hanya ada di browser. Data contoh dan nomor contoh tidak mewakili usaha nyata. |
| Kinerja | Katalog 500 produk tetap lancar saat mengetik pencarian. Gambar kartu dimuat malas (`loading="lazy"`). |
| Bahasa | Semua teks antarmuka berbahasa Indonesia sederhana. |
| Kompatibilitas | Browser modern (dua versi terakhir Chrome, Edge, Firefox, Safari). Tanpa dukungan `<dialog>`, konfirmasi memakai `window.confirm`. |

## 9. Struktur proyek yang disarankan

```
nistokopi/
├─ index.html
├─ package.json
├─ vite.config.js
├─ src/
│  ├─ main.js            # titik masuk, router hash
│  ├─ style.css          # token dan komponen (lihat UI-SPEC.md)
│  ├─ data/demo.js       # 8 produk contoh
│  ├─ lib/
│  │  ├─ format.js       # rupiah, escape HTML
│  │  ├─ validate.js     # aturan produk (satu sumber kebenaran)
│  │  ├─ storage.js      # baca/tulis localStorage
│  │  ├─ query.js        # cari, filter, urut
│  │  ├─ whatsapp.js     # normalisasi nomor, tautan pesan
│  │  └─ transfer.js     # ekspor dan impor JSON
│  ├─ views/catalog.js
│  ├─ views/dashboard.js
│  └─ ui/dialog.js, toast.js
└─ tests/*.test.js
```

Logika murni (`lib/`) dipisahkan dari DOM agar dapat diuji dengan Vitest tanpa browser.

## 10. Kriteria penerimaan

Aplikasi dianggap sesuai SPEC jika semua butir berikut lolos.

1. Pengguna dapat mencari "arabika", memilih kategori Robusta, mengurutkan termurah, dan hasilnya sesuai gabungan ketiganya.
2. Produk bestok 0 tidak punya tautan WhatsApp, dan `Arabika Ijen Light Roast 200 g` tampil "Stok habis".
3. Tombol WhatsApp membuka pesan berisi nama dan harga produk yang benar, ke nomor yang tersimpan.
4. Nomor `0812-3456-7890`, `+62 812-3456-7890`, dan `812 3456 7890` semuanya menjadi `6281234567890`. Nomor `123` ditolak.
5. Menambah produk dengan nama sama (`ROBUSTA banyuwangi medium roast 250 g`) ditolak dengan pesan jelas.
6. Menghapus produk meminta konfirmasi, dan membatalkannya tidak mengubah data.
7. Memuat ulang halaman mempertahankan semua data dan nomor WhatsApp.
8. Ekspor lalu impor berkas yang sama menghasilkan daftar produk yang identik (kecuali `id`).
9. Impor berkas dengan satu `price` negatif ditolak seluruhnya, dengan pesan "Produk ke-N", dan data lama utuh.
10. Nama produk berisi `<img src=x onerror=alert(1)>` tampil sebagai teks biasa di katalog dan tabel.
11. Seluruh pengujian Vitest lulus, dan aplikasi dapat dibangun dengan `npm run build` tanpa galat.
12. Katalog dan Dashboard dapat dipakai penuh hanya dengan keyboard pada lebar 360 px.

## 11. Asumsi dan pertanyaan terbuka

- Pemilik usaha belum menyediakan data produk nyata, nomor WhatsApp nyata, atau foto. Selama itu semua data tetap fiktif.
- Apakah ekspor perlu menyertakan foto? Untuk v1 **ya** (opsional per produk), dengan konsekuensi berkas bisa besar. Bisa diubah menjadi opsi "tanpa foto" bila perlu.
- Apakah perlu "mode baca saja" bagi pembeli yang menyembunyikan menu Dashboard? Di luar lingkup v1 karena tanpa login tidak ada cara aman membedakan pengguna.
