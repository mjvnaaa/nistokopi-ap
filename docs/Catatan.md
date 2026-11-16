# Catatan Proyek NistoKopi

Dokumen ini adalah landasan proyek **NistoKopi** sebagai bahan pendamping workshop **Vibe Coding UMKM**. Tujuannya agar peserta, fasilitator, dan pemilik usaha memiliki pemahaman yang sama tentang apa yang dibangun, untuk siapa, dengan teknologi apa, serta apa saja batasannya, sebelum menyusun `SPEC.md`, `UI-SPEC.md`, dan `TASKS.md`.

> **Status terakhir (16 November 2026):** isi dokumen ini sudah diselaraskan dengan prototipe berkas tunggal `NistoKopi_Prototipe_v2.html`. Fitur yang belum ada di prototipe ditandai **belum tersedia**.

---

## 1. Tujuan Workshop Vibe Coding UMKM

Workshop ini membantu pelaku usaha mikro, kecil, dan menengah (UMKM) memahami cara memanfaatkan AI untuk membangun aplikasi web sederhana tanpa harus menjadi programmer profesional terlebih dahulu.

**Vibe Coding** dalam workshop ini berarti AI coding agent membantu menulis kode berdasarkan instruksi yang jelas, sedangkan manusia tetap bertanggung jawab atas spesifikasi, evaluasi, pengujian, dan keamanan.

Tujuan yang ingin dicapai:

- Memperkenalkan cara kerja Vibe Coding melalui proyek praktik yang nyata.
- Melatih peserta menyusun spesifikasi dan instruksi (prompt) yang jelas, terarah, dan mudah dipahami AI.
- Membiasakan peserta memeriksa, menjalankan, dan menguji hasil kerja AI, bukan menerimanya begitu saja.
- Memperkenalkan alur kerja pengembangan yang rapi: dokumen landasan, spesifikasi, daftar tugas, implementasi, pengujian, lalu pengelolaan versi dengan Git dan GitHub.
- Menghasilkan satu prototipe aplikasi yang dapat dijalankan, yaitu **NistoKopi**, sebagai contoh bahwa pelaku UMKM kopi dapat membuat solusi digital dengan biaya dan waktu yang lebih hemat.

Hasil workshop adalah **prototipe untuk pembelajaran**, bukan sistem siap produksi.

---

## 2. Gambaran Aplikasi NistoKopi

**NistoKopi** adalah katalog produk dan dashboard pengelolaan produk berbasis web untuk UMKM yang berfokus pada biji kopi khas Banyuwangi. NistoKopi merupakan brand kopi lokal yang memperkenalkan dan menawarkan berbagai produk biji kopi khas Banyuwangi melalui katalog digital. Aplikasi ini membantu pelaku usaha menampilkan produk kepada calon pembeli sekaligus mengelola informasi produknya melalui dashboard sederhana.

Aplikasi memiliki dua area utama, yang dipilih lewat menu **Katalog** dan **Dashboard** di bagian atas halaman:

- **Katalog Publik:** halaman yang dapat dijelajahi calon pembeli, berisi informasi produk dan tombol pemesanan melalui WhatsApp.
- **Dashboard Pengelola:** halaman bagi pemilik UMKM untuk menambah, mengubah, dan menghapus data produk.

### Ruang Lingkup Fitur

**A. Katalog Produk**

- Menampilkan daftar produk biji kopi khas Banyuwangi.
- Menampilkan nama, deskripsi, kategori, harga, dan stok setiap produk.
- Menampilkan penanda produk unggulan.
- Menampilkan peringatan stok tinggal sedikit (5 atau kurang) dan penanda stok habis.
- Menampilkan foto produk jika tersedia. Jika tidak ada foto, kartu memakai ikon pengganti sesuai kategori.
- Menggunakan tampilan kartu produk yang responsif, sehingga nyaman dibuka di ponsel maupun komputer.

**B. Pencarian dan Penyaringan**

- Pencarian berdasarkan nama dan deskripsi produk.
- Filter berdasarkan kategori, dengan jumlah produk di setiap kategori.
- Filter "Hanya yang tersedia" untuk menyembunyikan produk yang stoknya habis.
- Pengurutan berdasarkan nama A–Z, harga termurah, harga termahal, dan unggulan dulu.
- Pencarian, filter, dan pengurutan dapat digunakan bersamaan.
- Jumlah produk yang tampil ditampilkan di atas daftar, dan tombol "Hapus filter" muncul jika tidak ada produk yang cocok.

**C. Integrasi WhatsApp**

- Menyediakan tombol pemesanan melalui WhatsApp pada setiap produk.
- Menghasilkan pesan otomatis berdasarkan produk yang dipilih (nama dan harga).
- Menonaktifkan tombol pemesanan apabila stok produk habis.
- Nomor WhatsApp penjual dapat diganti lewat Dashboard. Nomor dicek formatnya (nomor Indonesia, boleh diawali 0, 8, atau +62) dan disimpan di browser. Nomor bawaan adalah nomor contoh fiktif.

Pemesanan sepenuhnya berlangsung di percakapan WhatsApp antara pembeli dan penjual. Aplikasi hanya membantu menyiapkan pesan awal dan tidak memproses pesanan.

**D. Dashboard Pengelolaan**

- Menampilkan total produk.
- Menampilkan total stok.
- Menampilkan jumlah kategori aktif.
- Menambahkan produk baru lewat formulir (nama, kategori, harga, stok, deskripsi, foto opsional, penanda unggulan).
- Mengedit informasi produk.
- Menghapus produk dengan konfirmasi terlebih dahulu.
- Memeriksa isian formulir dan menampilkan pesan kesalahan yang jelas, termasuk mencegah nama produk ganda.
- Mengunggah foto produk (JPG, PNG, atau WebP, maksimal 8 MB). Foto diperkecil otomatis hingga 640 px agar muat di penyimpanan browser.

**E. Pengelolaan Penyimpanan**

- Menyimpan data produk menggunakan localStorage.
- Mempertahankan data setelah halaman dimuat ulang.
- Memeriksa ulang data dari localStorage saat dimuat. Data yang tidak valid dibuang.
- Menyediakan fitur reset ke data demo, dengan konfirmasi.
- **Belum tersedia di prototipe:** ekspor dan impor data dalam format JSON. Fitur ini tetap direncanakan sebagai pencadangan manual. Jika ditambahkan, data impor wajib divalidasi dengan aturan yang sama seperti formulir (lihat Bagian 6).

### Contoh Produk dan Data Demonstrasi

Produk contoh pada prototipe berfokus pada biji kopi, misalnya Robusta Banyuwangi, Arabika Ijen, biji kopi specialty, varian tingkat roasting (light, medium, dark), biji mentah (green bean), dan paket cicip.

Seluruh data produk pada prototipe adalah **data demonstrasi fiktif**. Asal kebun, sertifikasi, skor cupping, dan karakteristik rasa belum ditetapkan dan tidak boleh dicantumkan sebagai fakta sampai pemilik usaha menyediakan informasi yang sebenarnya.

### Prinsip Aplikasi

- Tampilan sederhana dan mudah dipakai.
- Fokus pada kebutuhan nyata UMKM, yaitu menampilkan produk dan menjaga informasinya tetap mutakhir, bukan fitur yang berlebihan.
- Dapat dipakai dari ponsel maupun komputer.
- Bahasa Indonesia sederhana pada semua teks, tombol, dan pesan kesalahan.
- Ramah aksesibilitas: fokus keyboard terlihat jelas, kontras warna cukup, dan animasi mengikuti pengaturan "reduced motion" pada perangkat.

### Identitas Tampilan

Tampilan prototipe diarahkan agar terasa seperti merek kopi lokal yang profesional.

- **Warna:** coklat kopi `#6f4e37` sebagai warna merek, espresso gelap `#2a1a10` untuk bagian hero dan footer, krem `#faf6f1` dan coklat susu `#f1e8dc` untuk latar, serta satu aksen karamel `#c8924f` untuk penanda unggulan. Status stok memakai hijau, karamel, dan merah.
- **Huruf:** Fraunces (serif) untuk judul dan harga, Figtree (sans-serif) untuk teks lainnya. Keduanya dimuat dari Google Fonts, sehingga membutuhkan koneksi internet. Jika gagal dimuat, browser memakai huruf bawaan.
- **Tata letak:** halaman katalog dibuka dengan panel hero gelap berhiaskan garis kontur tipis, kategori berbentuk pill, dan kartu produk dengan teks rata kiri.

---

## 3. Target Pengguna Aplikasi

Aplikasi ini ditujukan untuk dua kelompok pengguna aplikasi dan satu kelompok pengguna workshop.

**Pengguna aplikasi**

- **Calon pembeli dan penikmat kopi** yang menjelajahi Katalog Publik, mencari produk, membandingkan harga, dan memesan melalui WhatsApp.
- **Pemilik UMKM kopi**, seperti roaster atau penjual biji kopi lokal Banyuwangi, yang ingin menampilkan produknya secara rapi dan mengelola informasinya lewat Dashboard Pengelola. Anggota keluarga atau karyawan yang membantu juga termasuk di sini.

**Pengguna workshop**

- **Peserta dan fasilitator workshop** yang menggunakan NistoKopi sebagai bahan belajar membangun aplikasi dengan bantuan AI.

Karakteristik umum pengguna:

- Tidak selalu paham teknologi, tetapi terbiasa memakai ponsel.
- Lebih nyaman dengan tampilan sederhana dan bahasa Indonesia.
- Membutuhkan alat yang cepat dipakai di sela kegiatan usaha.

Karena data tersimpan lokal di browser, Dashboard Pengelola pada versi workshop ini dipakai oleh satu pengelola pada satu perangkat (lihat Bagian 5).

---

## 4. Teknologi yang Digunakan

Teknologi dipilih karena sederhana, populer, dan mudah dipelajari pemula. Tidak ada framework frontend, backend, maupun layanan database yang digunakan.

| Teknologi | Fungsi dalam proyek |
|---|---|
| **HTML** | Membentuk struktur halaman aplikasi. |
| **CSS** | Mengatur tampilan dan responsivitas. |
| **Vite** | Menjalankan development server dan membangun (build) aplikasi pada versi proyek. |
| **Vanilla JavaScript** | Menjalankan logika dan interaksi aplikasi tanpa framework frontend. |
| **localStorage** | Menyimpan data produk dan nomor WhatsApp secara lokal pada browser. |
| **Vitest** | Menjalankan pengujian otomatis pada fungsi-fungsi aplikasi. |
| **Git** | Mengelola versi kode dan mencatat perubahan. |
| **GitHub** | Menyimpan repository dan mendukung kolaborasi kode. |
| **OpenCode** | AI coding agent yang membantu proses pengembangan. |

Catatan:

- Prototipe saat ini berupa **satu berkas HTML** (`NistoKopi_Prototipe_v2.html`) yang memuat HTML, CSS, dan JavaScript sekaligus. Berkas ini dapat dibuka langsung di browser tanpa instalasi dan menjadi acuan tampilan serta perilaku sebelum kode dipecah menjadi proyek Vite.
- Vanilla JavaScript dipilih agar peserta dapat memahami alur kode tanpa harus mempelajari framework terlebih dahulu.
- Vitest dipakai agar hasil kerja AI dapat diperiksa secara otomatis dan berulang, terutama untuk logika seperti pencarian, filter, pengurutan, dan validasi data produk (formulir dan localStorage). Jika ekspor dan impor JSON ditambahkan, validasinya juga diuji.
- Satu-satunya sumber luar pada prototipe adalah Google Fonts. Tidak ada pustaka JavaScript pihak ketiga.
- Daftar teknologi ini bersifat tetap untuk workshop dan tidak diganti dengan framework atau layanan lain.

---

## 5. Batasan Aplikasi

NistoKopi pada workshop ini adalah **prototipe katalog produk dan dashboard lokal**, bukan sistem e-commerce lengkap. Batasan berikut menjaga proyek tetap fokus dan dapat diselesaikan dalam waktu workshop.

**Batasan fungsi**

- Tidak ada keranjang belanja dan checkout.
- Tidak ada payment gateway atau pembayaran online.
- Tidak ada pencatatan transaksi maupun riwayat penjualan.
- Tidak ada laporan pendapatan.
- Tidak ada sistem login atau autentikasi.
- Pemesanan hanya diteruskan melalui WhatsApp dan tidak diproses atau dilacak oleh aplikasi.
- Aplikasi hanya mencakup satu katalog produk milik satu usaha.

**Batasan penyimpanan dan keamanan**

- localStorage hanya menyimpan data pada browser dan perangkat yang digunakan. Data tidak otomatis tersedia di perangkat lain dan dapat hilang jika data browser dihapus.
- localStorage bukan database server. Karena itu, perubahan yang dibuat pengelola pada satu perangkat tidak terlihat oleh pengunjung di perangkat lain. Hal yang sama berlaku untuk nomor WhatsApp yang diganti lewat Dashboard.
- Foto produk disimpan di localStorage sebagai data gambar dan ikut memakai kuota penyimpanan browser yang terbatas (sekitar 5 MB). Karena itu foto diperkecil otomatis, dan penyimpanan dapat penuh jika terlalu banyak foto. Aplikasi akan memberi tahu jika penyimpanan gagal.
- Dashboard lokal tidak memiliki keamanan multiuser. Siapa pun yang membuka aplikasi di perangkat yang sama dapat mengakses dan mengubah data.
- Ekspor dan impor JSON (belum tersedia di prototipe) hanya akan membantu pencadangan dan pemindahan data secara manual, bukan menggantikan sinkronisasi data antarperangkat.

**Arah pengembangan lanjutan**

Untuk menjadi sistem produksi, NistoKopi membutuhkan backend, autentikasi, otorisasi di sisi server, dan database. Hal ini berada di luar ruang lingkup workshop.

---

## 6. Risiko Penggunaan AI dalam Proses Pengembangan

AI sangat membantu, tetapi memiliki keterbatasan yang perlu diwaspadai. Setiap risiko berikut disertai langkah pencegahan yang dapat diterapkan peserta.

| Risiko | Penjelasan | Langkah pencegahan |
|---|---|---|
| **Hasil tidak selalu benar** | AI dapat menghasilkan kode yang keliru, tidak lengkap, atau tidak sesuai permintaan. | Jalankan aplikasi, periksa hasilnya, dan gunakan pengujian otomatis dengan Vitest. |
| **Kurang paham konteks usaha** | AI tidak mengetahui kondisi nyata usaha, sehingga dapat menambahkan fitur di luar kebutuhan atau ruang lingkup. | Tulis spesifikasi dan batasan dengan jelas, lalu cocokkan hasilnya dengan dokumen ini. |
| **Kode sulit dipahami** | Kode yang tidak dipahami pembuatnya sulit diperbaiki dan dirawat. | Minta AI menjelaskan kode, simpan perubahan kecil-kecil dengan Git, dan tinjau sebelum diterima. |
| **Celah keamanan** | Kode dari AI dapat memuat kelemahan, misalnya data yang tidak divalidasi atau tampilan yang menampilkan masukan pengguna tanpa pengamanan. | Validasi isian formulir, data localStorage, dan foto (jenis file serta ukuran). Hindari menyisipkan masukan pengguna langsung sebagai HTML. Jika impor JSON ditambahkan, validasi setiap produk sebelum dipakai. Tinjau kode sebelum dipakai. |
| **Risiko data dan privasi** | Informasi sensitif yang dimasukkan ke percakapan AI dapat bocor atau tersimpan di layanan pihak lain. | Jangan memasukkan data pribadi, nomor kontak asli, atau informasi usaha yang bersifat rahasia. Gunakan data demo dan nomor WhatsApp contoh. |
| **Ketergantungan berlebihan** | Peserta dapat berhenti memahami logika dasar karena terlalu bergantung pada AI. | Pelajari dasar logika pemrograman dan alur aplikasi, bukan hanya menyalin hasil AI. |
| **Biaya dan layanan** | Penggunaan layanan AI tertentu dapat menimbulkan biaya. | Periksa ketentuan dan biaya layanan sejak awal. |
| **Klaim produk tidak terverifikasi** | AI dapat mengarang asal kebun, sertifikasi, atau karakteristik rasa kopi yang terdengar meyakinkan tetapi tidak benar. | Cantumkan hanya informasi yang dapat dibuktikan pemilik usaha, dan tandai data contoh sebagai fiktif. |
| **Hak cipta dan lisensi** | Kode atau materi yang dihasilkan dapat bersinggungan dengan hak pihak lain. | Periksa lisensi pustaka dan huruf yang dipakai (Fraunces dan Figtree berlisensi terbuka lewat Google Fonts) dan gunakan materi yang aman digunakan. |

**Prinsip aman:** AI sebagai pembantu menulis kode, manusia sebagai penanggung jawab. Manusia menentukan spesifikasi, mengevaluasi hasil, menguji aplikasi, dan menjaga keamanannya. Setiap hasil AI harus diperiksa, diuji, dan dipahami sebelum dipakai.

---

## 7. Riwayat Pembaruan

| Tanggal | Perubahan |
|---|---|
| 16 November 2026 | Catatan diselaraskan dengan prototipe berkas tunggal: ditambahkan foto produk, filter "Hanya yang tersedia", pengurutan "Unggulan dulu", pengaturan nomor WhatsApp, identitas tampilan baru, dan batasan penyimpanan foto. Ekspor dan impor JSON ditandai belum tersedia di prototipe. |

---

*Catatan ini adalah dokumen hidup dan akan diperbarui seiring perkembangan proyek NistoKopi.*