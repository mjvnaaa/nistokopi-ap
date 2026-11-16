import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty">
      <h1 tabIndex={-1}>Produk atau halaman tidak ditemukan</h1>
      <p>Produk mungkin sudah dihapus, dinonaktifkan, atau belum disetujui untuk tampil di katalog.</p>
      <Link className="btn" href="/">
        Kembali ke katalog
      </Link>
    </div>
  );
}
