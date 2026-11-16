# UI-SPEC.md: Spesifikasi Antarmuka NistoKopi

Versi 1.0 · 16 November 2026
Pelengkap `SPEC.md`. Acuan visual: prototipe `NistoKopi_Prototipe_v2.html`. Nilai di bawah adalah nilai yang dipakai prototipe, dan menjadi token CSS pada proyek Vite.

---

## 1. Arah desain

NistoKopi harus terasa seperti **merek kopi lokal yang rapi dan tepercaya**, bukan toko serba ada.

- **Satu momen mengesankan:** hero gelap berwarna espresso dengan garis kontur emas tipis di sudut, mengingatkan lereng Ijen. Seluruh halaman lain sengaja tenang.
- **Hangat dan terbaca:** latar krem, teks espresso, satu warna merek coklat, satu aksen karamel.
- **Isi lebih penting dari hiasan:** tidak ada ornamen yang tidak membawa informasi. Warna status (stok) selalu disertai teks.
- **Mudah dipakai di ponsel:** target sentuh besar, satu kolom di layar sempit.

## 2. Token desain

### 2.1 Warna

| Token | Nilai | Dipakai untuk |
|---|---|---|
| `--b` | `#6f4e37` | Warna merek: tombol utama, harga, tautan aktif, pill terpilih |
| `--b2` | `#563a28` | Tombol utama saat disorot |
| `--ink` | `#2a1a10` | Teks utama, hero, strip atas, footer, toast |
| `--paper` | `#faf6f1` | Latar halaman |
| `--tint` | `#f1e8dc` | Latar pill kategori produk, kepala tabel, tombol nonaktif, menu |
| `--line` | `#e2d5c5` | Garis tepi kartu, kolom, tabel |
| `--mute` | `#6b5646` | Teks pendukung (deskripsi, catatan, label) |
| `--gold` | `#c8924f` | Aksen: penanda "Unggulan", stok menipis, garis kontur hero |
| `--ok` | `#5c7a3a` | Titik stok tersedia |
| `--err` | `#a1301f` | Galat, stok habis, tombol hapus |
| `--w` | `#ffffff` | Permukaan kartu, kolom, panel |

Aturan: `--gold` hanya satu aksen, tidak dipakai untuk teks pada latar terang. Teks pada `--gold` memakai `--ink`. Kontras teks minimal 4,5:1.

### 2.2 Tipografi

| Peran | Huruf | Ukuran / tinggi baris | Berat |
|---|---|---|---|
| Judul hero katalog | Fraunces | `clamp(36px, 6vw, 64px)` / 1,1, jarak huruf −0,02em | 600 |
| Judul halaman (Dashboard) | Fraunces | `clamp(30px, 4vw, 44px)` / 1,1 | 600 |
| Judul panel, dialog | Fraunces | 24 / 32 | 600 |
| Nama produk | Fraunces | 20 / 26, maksimal 2 baris | 600 |
| Harga | Fraunces | 24 / 32 | 700 |
| Angka ringkasan | Fraunces | 40 / 48 | 700 |
| Logo (nama merek) | Fraunces | 26 / 32 | 700 |
| Teks isi | Figtree | 16 / 26 | 400 |
| Teks kolom, tombol, menu | Figtree | 15 | 500 sampai 600 |
| Deskripsi kartu | Figtree | 14 / 22, maksimal 3 baris | 400 |
| Label kecil, catatan | Figtree | 13 sampai 14 | 400 sampai 600 |

Panjang baris paragraf maksimal 60 sampai 80 karakter. Cadangan huruf: Fraunces → Georgia, Figtree → huruf sistem. Tidak ada teks huruf kapital semua dan tidak ada label kecil di atas judul.

### 2.3 Jarak, bentuk, bayangan

- **Skala jarak 8 pt:** 4, 8, 16, 24, 32, 40, 48, 64, 80 px (`--s1` sampai `--s9`). Jarak antarkomponen hanya memakai nilai ini.
- **Radius:** hero 24 (20 di ponsel), kartu dan panel 18, kolom dan tombol 12, tabel 14, dialog 20, pill dan menu 999.
- **Bayangan:** hanya pada hal yang melayang (dialog, toast). Kartu dan panel memakai garis tepi, bukan bayangan.
- **Lebar isi:** maksimal 1280 px, bantalan samping 24 px (16 px di ponsel).

### 2.4 Gerak

Hanya transisi 0,15 sampai 0,2 detik pada warna dan garis tepi saat disorot. Tidak ada animasi masuk. `prefers-reduced-motion` mematikan semua transisi.

---

## 3. Kerangka halaman

```
┌───────────────────────────────────────────────┐
│ strip: "Prototipe NistoKopi. Data contoh..."  │  espresso, 13 px, tengah
├───────────────────────────────────────────────┤
│ ● NistoKopi             [ Katalog | Dashboard ]│  header lengket, tinggi 72
├───────────────────────────────────────────────┤
│ Home › Katalog › Biji Kopi                    │  jejak halaman
│ ┌───────────────────────────────────────────┐ │
│ │ HERO espresso + kontur emas               │ │
│ └───────────────────────────────────────────┘ │
│  (konten tampilan)                            │
├───────────────────────────────────────────────┤
│ footer espresso, teks 14 px, maks. 760 px     │
└───────────────────────────────────────────────┘
```

- **Strip atas:** menyatakan bahwa ini prototipe dan datanya fiktif. Wajib tampil selama masih prototipe.
- **Header:** latar krem 92% dengan blur, garis bawah `--line`, lengket di atas. Logo = biji kopi CSS kecil (miring 28°, goresan emas) + nama merek.
- **Menu:** dua pill di dalam wadah `--tint`. Pill aktif berlatar `--b`, teks putih, `aria-current="page"`.
- **Area aman iOS:** bantalan atas dan bawah memakai `env(safe-area-inset-*)`.

---

## 4. Tampilan Katalog

### 4.1 Susunan

```
Hero (judul + satu kalimat)
[ Semua (8) ] [ Arabika (3) ] [ Paket (1) ] [ Robusta (3) ] [ Specialty (1) ]
Menampilkan 8 dari 8 produk
[🔍 Cari nama atau deskripsi produk      ] [☐ Hanya yang tersedia]  Urutkan [Nama A–Z ▾]
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ kartu  │ │ kartu  │ │ kartu  │ │ kartu  │
└────────┘ └────────┘ └────────┘ └────────┘
```

### 4.2 Hero

- Latar `--ink`, teks `#f6ede2`, bantalan 80 × 48 (48 × 24 di ponsel), sudut 24.
- Judul maksimal 12 karakter per baris (jadi dua baris): "Biji Kopi / Banyuwangi". Paragraf pendukung maksimal 52 karakter per baris, warna `#dcc9b3`, 18 / 28.
- Kontur: `repeating-radial-gradient` berpusat di kanan bawah (92% / 118%), garis emas 1 px setiap 26 px dengan opasitas 0,34, dipudarkan oleh mask radial. Dekoratif saja, `pointer-events: none`.

### 4.3 Pill kategori

- Radio tersembunyi di dalam label berbentuk pill. Tinggi 44, garis `--line`, latar putih.
- Terpilih: latar dan garis `--b`, teks putih, berat 600. Sorotan: garis `--b`. Fokus keyboard: garis luar 3 px `--b`.
- Isi pill: nama kategori + jumlah dalam kurung (opasitas 0,7).
- Di ponsel: satu baris yang dapat digulir ke samping.

### 4.4 Bilah alat

- Kolom cari fleksibel (minimal 260 px), ikon kaca pembesar coklat di kiri.
- Kotak centang "Hanya yang tersedia" dan menu urut sejajar. Di ponsel menyusun ke bawah.
- Opsi urut: Nama A–Z, Harga termurah, Harga termahal, Unggulan dulu.

### 4.5 Kartu produk

```
┌──────────────────────────┐
│ ★ Unggulan               │  tile 4:3, gradien krem hangat
│          ☕              │  foto penuh jika ada
├──────────────────────────┤
│ (Robusta)    ● Stok 30   │  pill kategori kiri, status stok kanan
│ Robusta Banyuwangi       │  nama, maks. 2 baris
│ Medium Roast 250 g       │
│ Biji kopi Robusta khas...│  deskripsi, maks. 3 baris
│ Rp55.000                 │  harga
│ [ Pesan lewat WhatsApp ] │  tombol penuh
└──────────────────────────┘
```

- Grid `repeat(auto-fill, minmax(250px, 1fr))`, jarak 24.
- Kartu putih, garis `--line`, radius 18. Saat disorot garis menjadi `--b`. Seluruh isi rata kiri.
- Tile tanpa foto: gradien radial `#f7eddf` → `#e4d0b6`, ikon 60 px di tengah. Dengan foto: `object-fit: cover`.
- Penanda "Unggulan": pill `--gold`, teks `--ink`, berat 700, awalan ★, di kiri atas tile.
- Status stok: titik 8 px + teks. Hijau `--ok` ("Stok N"), karamel `--gold` dan teks tebal ("Stok tinggal N"), merah `--err` dan teks tebal ("Stok habis"). Warna tidak pernah menjadi satu-satunya penanda.
- Tombol "Pesan lewat WhatsApp": tombol utama. Label aksesibel: "Pesan {nama} lewat WhatsApp (buka di tab baru)".
- Stok 0: tombol nonaktif "Tidak tersedia", latar `--tint`, garis putus-putus, `disabled` dan `aria-disabled`.

### 4.6 Keadaan kosong

Kotak bergaris putus-putus `--line`, latar putih, teks `--mute`, di tengah.
- Tidak ada hasil: "Tidak ada produk yang cocok. Ubah kata kunci atau pilih kategori lain." + tombol kecil "Hapus filter".
- Katalog kosong: "Katalog masih kosong. Tambahkan produk lewat Dashboard." (Dashboard berupa tautan.)

---

## 5. Tampilan Dashboard

### 5.1 Susunan

```
Dashboard pengelola  (judul + penjelasan batasan tanpa login)
[ 8 Total produk ] [ 105 Total stok ] [ 5 Kategori aktif ]
┌ Nomor WhatsApp penjual ─────────────┐
│ Nomor WhatsApp [0812-3456-7890]     │
│ Catatan nomor contoh / nomor aktif  │
│ [Simpan nomor]                      │
└─────────────────────────────────────┘
┌ Tambah produk / Ubah produk ────────┐   dua kolom, satu kolom di ponsel
│ Nama      │ Kategori                │
│ Harga     │ Stok                    │
│ Deskripsi (penuh)                   │
│ Foto produk (penuh) + pratinjau     │
│ ☐ Tandai sebagai produk unggulan    │
│ [Simpan produk] [Batal ubah]        │
└─────────────────────────────────────┘
┌ Daftar produk ──────────────────────┐
│ tabel                               │
└─────────────────────────────────────┘
┌ Data produk ────────────────────────┐
│ [Ekspor JSON] [Impor JSON] [Reset]  │   Ekspor dan Impor: [BARU]
└─────────────────────────────────────┘
```

### 5.2 Komponen

- **Kartu ringkasan:** putih, garis `--line`, radius 18, bantalan 24. Angka Fraunces 40 warna `--b`, label 14 px `--mute`. Tiga kolom, satu kolom di ponsel.
- **Panel:** putih, garis `--line`, radius 18, bantalan 32 (24 di ponsel), jarak antarpanel 24. Judul Fraunces 24.
- **Formulir:** setiap kolom berlabel tebal 15 px di atasnya, tinggi kolom 48, radius 12, garis `--line` yang menjadi `--b` saat disorot. Satu `<p class="err">` per kolom untuk pesan galat.
- **Galat:** kolom bergaris merah 2 px, pesan merah 14 px tebal diawali "Perhatian: ", memakai `aria-live="polite"`. Pesan menjelaskan cara memperbaiki, tidak meminta maaf, dan tidak samar.
- **Unggah foto:** teks bantu mencantumkan format dan batas. Pratinjau maksimal 192 × 144, radius 12, dengan tombol "Hapus foto".
- **Tabel:** dibungkus kotak bergaris `--line` radius 14 dan dapat digulir ke samping (lebar minimal 600). Kepala `--tint` dengan teks `--b`. Baris disorot `--paper`. Kolom Aksi: tombol kecil "Ubah" (sekunder) dan "Hapus" (bahaya), berlabel aksesibel yang memuat nama produk.
- **Tombol Ekspor / Impor / Reset:** Ekspor dan Impor sekunder, Reset bahaya. Pesan galat impor di bawah baris tombol.

---

## 6. Komponen bersama

### 6.1 Tombol

| Jenis | Tampilan | Dipakai untuk |
|---|---|---|
| Utama | Latar `--b`, teks putih, sorot `--b2` | Pesan WhatsApp, Simpan |
| Sekunder (`.alt`) | Latar putih, teks dan garis `--b`, sorot `--tint` | Batal ubah, Ubah, Ekspor, Impor, Hapus foto |
| Bahaya (`.danger`) | Latar putih, teks dan garis `--err`, sorot `#fbeeea` | Hapus, Reset |
| Nonaktif | Latar `--tint`, teks `--mute`, garis putus-putus | Tombol pesan saat stok habis |

Tinggi 48 (kecil 40), radius 12, label 15 px berat 600. Satu aksi utama per area.

### 6.2 Dialog konfirmasi

Elemen `<dialog>`, lebar maksimal 420, radius 20, bantalan 32, bayangan lembut, latar belakang `rgba(42,26,16,.55)` dengan blur 3 px. Judul pertanyaan ("Hapus produk?"), satu kalimat akibat, dua tombol rata kanan: "Batal" (sekunder) dan tombol bahaya. Fokus awal pada tombol aman. Escape menutup dialog tanpa aksi.

### 6.3 Toast

Di bawah tengah layar, latar `--ink`, teks `#f6ede2`, radius 14, hilang sendiri setelah 2,6 detik, `role="status"`. Bunyi pesan mengikuti nama aksinya: tombol "Simpan produk" menghasilkan "Produk ditambahkan." atau "Produk diperbarui."

### 6.4 Fokus keyboard

Semua elemen interaktif: garis luar 3 px `--b`, jarak 2 px. Pada pill kategori, garis luar mengelilingi pill. Urutan tab mengikuti urutan baca.

---

## 7. Responsif

| Lebar | Perubahan |
|---|---|
| ≤ 640 px | Bantalan samping 16. Hero 48 × 24, sudut 20. Pill kategori satu baris yang dapat digulir. Kartu ringkasan dan formulir satu kolom. Bantalan panel 24. |
| 641 sampai 1280 px | Grid kartu menyesuaikan otomatis (3 sampai 4 kolom). |
| > 1280 px | Isi dikunci 1280 px di tengah. |

Tidak boleh ada gulir horizontal pada badan halaman. Hanya tabel dan baris pill yang boleh bergulir ke samping di dalam wadahnya sendiri.

## 8. Aksesibilitas

- Satu `<h1>` per tampilan, `tabindex="-1"` agar dapat menerima fokus saat berpindah tampilan.
- Legenda "Kategori" dan label kolom cari disembunyikan secara visual (`.sr`) tetapi tetap terbaca pembaca layar.
- Jumlah hasil (`aria-live="polite"`), pesan galat, dan toast diumumkan.
- Gambar produk punya `alt` "Foto {nama}". Ikon hias punya `aria-hidden="true"`.
- Target sentuh minimal 44 px.
- Tampilan tidak bergantung pada warna saja untuk status stok dan galat.

## 9. Gaya penulisan

- Kalimat biasa, kata kerja aktif, huruf kapital hanya di awal kalimat.
- Nama tombol menyebut hasilnya: "Simpan produk", "Simpan nomor", "Hapus filter". Aksi yang sama memakai kata yang sama di dialog dan toast.
- Galat menjelaskan apa yang salah dan cara memperbaikinya: "Isi harga dengan bilangan bulat lebih dari 0."
- Keadaan kosong mengajak bertindak, tidak sekadar menyatakan kosong.
- Data contoh selalu diberi tanda "Data contoh." dan tidak memuat klaim asal kebun, sertifikasi, skor cupping, atau rasa.
- Istilah teknis (localStorage, JSON) hanya muncul pada bagian Dashboard yang memang untuk pengelola, dengan penjelasan singkat.

## 10. Daftar periksa tampilan

- [ ] Hero tampil benar di 360 px dan 1440 px, kontur tidak menutupi teks.
- [ ] Kartu dengan nama panjang (dua baris) dan nama pendek rata baris harganya.
- [ ] Kartu tanpa foto dan dengan foto sama tingginya.
- [ ] Pill kategori yang aktif terlihat jelas tanpa bergantung pada warna saja.
- [ ] Fokus keyboard terlihat pada semua tombol, pill, dan kolom.
- [ ] Pesan galat tampil di bawah kolom yang salah dan kolom pertama yang salah menerima fokus.
- [ ] Tabel dapat digulir di 360 px tanpa memperlebar halaman.
- [ ] Dialog dan toast terbaca di atas semua latar.
- [ ] Kontras teks diperiksa dengan alat pemeriksa kontras.
