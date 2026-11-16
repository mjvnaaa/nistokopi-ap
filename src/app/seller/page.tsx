import { Suspense } from "react";
import Link from "next/link";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import { ConfirmDeleteButton } from "@/components/ConfirmDeleteButton";
import { SellerBanner, StatusBadge } from "@/components/StatusBadge";
import type { SearchParams } from "@/lib/catalog";
import { requireSeller } from "@/lib/guards";
import { getSellerOverview } from "@/lib/seller-queries";
import { sellerMode } from "@/lib/seller-status";
import { formatRupiah } from "@/lib/whatsapp";
import { hapusProdukAction, ubahAktifAction } from "./actions";

export const metadata = { title: "Dashboard toko" };

const FLASH: Record<string, string> = {
  disimpan: "Produk tersimpan.",
  diubah: "Status produk diubah.",
  dihapus: "Produk dihapus.",
  gagal: "Aksi tidak dapat dilakukan. Muat ulang halaman, lalu coba lagi.",
};

export default function SellerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <SellerContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SellerContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { profile } = await requireSeller("/seller");
  const mode = sellerMode(profile.approvalStatus);
  const overview = mode === "profile-only" ? null : await getSellerOverview(profile.id);

  const info = (await searchParams).info;
  const flash = FLASH[(Array.isArray(info) ? info[0] : info) ?? ""];
  const canManage = mode === "full";

  return (
    <>
      <p className="crumbs">
        <Link href="/">Beranda</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Dashboard toko</span>
      </p>

      <section className="hero" aria-labelledby="judul-seller">
        <h1 id="judul-seller" tabIndex={-1}>
          {profile.storeName}
        </h1>
        <p>
          Status toko: <StatusBadge status={profile.approvalStatus} />
          {profile.approvalStatus === "APPROVED" ? (
            <>
              {" "}
              · <Link href={`/toko/${profile.slug}`}>Lihat halaman toko</Link>
            </>
          ) : null}
        </p>
      </section>

      {flash ? (
        <p className="flash" role="status">
          {flash}
        </p>
      ) : null}

      <SellerBanner status={profile.approvalStatus} note={profile.reviewNote} />

      {overview ? (
        <>
          <div className="stats">
            <div className="stat">
              <b>{overview.productCount.toLocaleString("id-ID")}</b>
              <span>Total produk</span>
            </div>
            <div className="stat">
              <b>{overview.totalStock.toLocaleString("id-ID")}</b>
              <span>Total stok</span>
            </div>
            <div className="stat">
              <b>{overview.clicks7.toLocaleString("id-ID")}</b>
              <span>Klik WhatsApp 7 hari</span>
            </div>
            <div className="stat">
              <b>{overview.reviewCount.toLocaleString("id-ID")}</b>
              <span>Ulasan masuk</span>
            </div>
          </div>

          <section className="panel" aria-labelledby="judul-produk">
            <div className="panel-head">
              <h2 id="judul-produk">Produk</h2>
              {canManage ? (
                <Link className="btn sm" href="/seller/produk/baru">
                  Tambah produk
                </Link>
              ) : null}
            </div>

            {overview.products.length === 0 ? (
              <div className="empty">
                {canManage ? "Belum ada produk. Pilih “Tambah produk” untuk produk pertama." : "Belum ada produk."}
              </div>
            ) : (
              <div className="tbl">
                <table>
                  <caption className="sr">Produk di toko Anda</caption>
                  <thead>
                    <tr>
                      <th scope="col">Produk</th>
                      <th scope="col">Kategori</th>
                      <th scope="col">Harga</th>
                      <th scope="col">Stok</th>
                      <th scope="col">Klik WA 7 / 30 hari</th>
                      {canManage ? <th scope="col">Aksi</th> : null}
                    </tr>
                  </thead>
                  <tbody>
                    {overview.products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <b>{p.name}</b>
                          {p.featured ? <span className="tag"> Unggulan</span> : null}
                          {!p.isActive ? <span className="tag off"> Nonaktif</span> : null}
                          {p.hiddenByAdmin ? <span className="tag bad"> Disembunyikan admin</span> : null}
                        </td>
                        <td>{p.categoryName}</td>
                        <td>{formatRupiah(p.price)}</td>
                        <td className={p.stock <= 0 ? "stock out" : undefined}>{p.stock <= 0 ? "Habis" : p.stock}</td>
                        <td>
                          {p.clicks7} / {p.clicks30}
                        </td>
                        {canManage ? (
                          <td>
                            <div className="act-wrap">
                              <Link className="btn alt sm" href={`/seller/produk/${p.id}`} aria-label={`Ubah ${p.name}`}>
                                Ubah
                              </Link>
                              <form action={ubahAktifAction}>
                                <input type="hidden" name="id" value={p.id} />
                                <input type="hidden" name="aktif" value={p.isActive ? "0" : "1"} />
                                <button className="btn alt sm" type="submit" aria-label={`${p.isActive ? "Nonaktifkan" : "Aktifkan"} ${p.name}`}>
                                  {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                                </button>
                              </form>
                              <ConfirmDeleteButton id={p.id} name={p.name} action={hapusProdukAction} />
                            </div>
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}

      <section className="panel" aria-labelledby="judul-profil">
        <h2 id="judul-profil">Profil toko</h2>
        <p className="note">
          {profile.city ? `${profile.city} · ` : ""}WhatsApp {profile.whatsapp}
        </p>
        <p className="row-actions">
          <Link className="btn alt sm" href="/seller/profil">
            {mode === "read-only" ? "Lihat profil toko" : "Ubah profil toko"}
          </Link>
        </p>
      </section>
    </>
  );
}
