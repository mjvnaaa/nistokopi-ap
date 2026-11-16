import { Suspense } from "react";
import Link from "next/link";
import { AdminFlash, AdminHeader } from "@/components/AdminNav";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import { flashFor } from "@/lib/admin-flash";
import { getPlatformOverview } from "@/lib/admin-queries";
import type { SearchParams } from "@/lib/catalog";
import { requireAdmin } from "@/lib/guards";

export const metadata = { title: "Admin" };

export default function AdminPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <AdminContent searchParams={searchParams} />
    </Suspense>
  );
}

const n = (value: number) => value.toLocaleString("id-ID");

async function AdminContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin("/admin");
  const [overview, params] = await Promise.all([getPlatformOverview(), searchParams]);

  return (
    <>
      <AdminHeader current="ringkasan" title="Admin NistoKopi" lead="Ringkasan platform dan hal yang perlu ditinjau." />
      <AdminFlash flash={flashFor(params.info)} />

      {overview.pendingSellers > 0 ? (
        <div className="banner" role="status">
          <p className="banner-title">
            {n(overview.pendingSellers)} toko menunggu persetujuan
          </p>
          <p>
            Produk toko itu belum tampil di katalog. <Link href="/admin/seller">Buka antrean seller</Link>.
          </p>
        </div>
      ) : null}

      <section aria-labelledby="judul-pengguna">
        <h2 id="judul-pengguna" className="panel-title">
          Pengguna
        </h2>
        <div className="stats">
          <div className="stat">
            <b>{n(overview.totalUsers)}</b>
            <span>Total pengguna</span>
          </div>
          <div className="stat">
            <b>{n(overview.usersByRole.ADMIN)}</b>
            <span>Admin</span>
          </div>
          <div className="stat">
            <b>{n(overview.usersByRole.SELLER)}</b>
            <span>Penjual</span>
          </div>
          <div className="stat">
            <b>{n(overview.usersByRole.BUYER)}</b>
            <span>Pembeli</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="judul-katalog">
        <h2 id="judul-katalog" className="panel-title">
          Katalog dan minat
        </h2>
        <div className="stats">
          <div className="stat">
            <b>{n(overview.pendingSellers)}</b>
            <span>Toko menunggu persetujuan</span>
          </div>
          <div className="stat">
            <b>{n(overview.totalProducts)}</b>
            <span>Total produk ({n(overview.publicProducts)} tampil di katalog)</span>
          </div>
          <div className="stat">
            <b>{n(overview.clicks7)}</b>
            <span>Klik WhatsApp 7 hari</span>
          </div>
          <div className="stat">
            <b>{n(overview.clicks30)}</b>
            <span>Klik WhatsApp 30 hari</span>
          </div>
        </div>
        <p className="note">Klik WhatsApp hanya statistik minat, bukan catatan pesanan atau transaksi.</p>
      </section>

      <section aria-labelledby="judul-bagian">
        <h2 id="judul-bagian" className="panel-title">
          Kelola
        </h2>
        <div className="dash-grid">
          <Link className="dash-link" href="/admin/seller">
            <b>Antrean seller</b>
            <span>Setujui, tolak, tangguhkan, atau aktifkan kembali toko.</span>
          </Link>
          <Link className="dash-link" href="/admin/pengguna">
            <b>Pengguna</b>
            <span>Cari akun, ubah peran, nonaktifkan, atau hapus.</span>
          </Link>
          <Link className="dash-link" href="/admin/kategori">
            <b>Kategori</b>
            <span>Tambah, ubah nama, urutkan, atau hapus kategori yang belum dipakai.</span>
          </Link>
          <Link className="dash-link" href="/admin/moderasi">
            <b>Moderasi</b>
            <span>
              Sembunyikan atau hapus produk dan ulasan.
              {overview.hiddenProducts > 0 ? ` ${n(overview.hiddenProducts)} produk sedang disembunyikan.` : ""}
            </span>
          </Link>
          <Link className="dash-link" href="/admin/log">
            <b>Audit log</b>
            <span>Riwayat aksi admin. Hanya dapat dibaca.</span>
          </Link>
        </div>
      </section>
    </>
  );
}
