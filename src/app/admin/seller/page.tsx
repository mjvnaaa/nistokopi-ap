import { Suspense } from "react";
import Link from "next/link";
import { AdminFlash, AdminHeader } from "@/components/AdminNav";
import { AdminPager } from "@/components/AdminPager";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import { ConfirmActionButton } from "@/components/ConfirmActionButton";
import { StatusBadge } from "@/components/StatusBadge";
import { ADMIN_PAGE_SIZE, formatDate, parsePage, totalPagesFor } from "@/lib/admin-rules";
import { flashFor } from "@/lib/admin-flash";
import { listSellerApplications, parseSellerFilter, type SellerFilter } from "@/lib/admin-queries";
import type { SearchParams } from "@/lib/catalog";
import { requireAdmin } from "@/lib/guards";
import { putusanSellerAction } from "../actions";

export const metadata = { title: "Antrean seller" };

const TABS: { key: SellerFilter; label: string }[] = [
  { key: "PENDING", label: "Menunggu" },
  { key: "APPROVED", label: "Disetujui" },
  { key: "REJECTED", label: "Ditolak" },
  { key: "SUSPENDED", label: "Ditangguhkan" },
  { key: "ALL", label: "Semua" },
];

const EMPTY: Record<SellerFilter, string> = {
  PENDING: "Tidak ada toko yang menunggu persetujuan.",
  APPROVED: "Belum ada toko yang disetujui.",
  REJECTED: "Belum ada toko yang ditolak.",
  SUSPENDED: "Tidak ada toko yang ditangguhkan.",
  ALL: "Belum ada toko terdaftar.",
};

export default function AdminSellerPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin("/admin/seller");
  const params = await searchParams;
  const filter = parseSellerFilter(params.status);
  const page = parsePage(params.halaman);

  const { items, total, counts } = await listSellerApplications(filter, page);
  const totalPages = totalPagesFor(total, ADMIN_PAGE_SIZE);
  const here = `/admin/seller?status=${filter}${page > 1 ? `&halaman=${page}` : ""}`;

  return (
    <>
      <AdminHeader current="seller" title="Antrean seller" lead="Tinjau toko yang mendaftar. Toko tampil di katalog setelah disetujui." />
      <AdminFlash flash={flashFor(params.info)} />

      <nav aria-label="Saring menurut status toko">
        <ul className="subnav">
          {TABS.map((tab) => (
            <li key={tab.key}>
              <Link href={`/admin/seller?status=${tab.key}`} aria-current={tab.key === filter ? "page" : undefined}>
                {tab.label} <span className="count-chip">({counts[tab.key].toLocaleString("id-ID")})</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="count" aria-live="polite">
        {total.toLocaleString("id-ID")} toko
      </p>

      {items.length === 0 ? (
        <div className="empty">{EMPTY[filter]}</div>
      ) : (
        <div className="queue">
          {items.map((seller) => {
            const fields = { id: seller.id, kembali: here };

            return (
              <article className="app-card" key={seller.id} aria-labelledby={`s-${seller.id}`}>
                <h3 id={`s-${seller.id}`}>
                  {seller.storeName} <StatusBadge status={seller.approvalStatus} />
                </h3>

                <dl className="app-meta">
                  <div>
                    <dt>Pemilik</dt>
                    <dd>
                      {seller.ownerName}
                      <span className="cell-sub">{seller.ownerEmail}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Terdaftar</dt>
                    <dd>{formatDate(seller.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Kota</dt>
                    <dd>{seller.city || "Belum diisi"}</dd>
                  </div>
                  <div>
                    <dt>WhatsApp toko</dt>
                    <dd>{seller.whatsapp}</dd>
                  </div>
                  <div>
                    <dt>Jumlah produk</dt>
                    <dd>{seller.productCount.toLocaleString("id-ID")}</dd>
                  </div>
                  {seller.reviewedAt ? (
                    <div>
                      <dt>Ditinjau</dt>
                      <dd>{formatDate(seller.reviewedAt)}</dd>
                    </div>
                  ) : null}
                </dl>

                {seller.description ? <p>{seller.description}</p> : <p className="note">Deskripsi toko belum diisi.</p>}
                {seller.reviewNote ? <p className="app-note">Catatan admin: {seller.reviewNote}</p> : null}

                <div className="row-actions">
                  {seller.approvalStatus === "PENDING" || seller.approvalStatus === "REJECTED" ? (
                    <form action={putusanSellerAction}>
                      <input type="hidden" name="id" value={seller.id} />
                      <input type="hidden" name="aksi" value="approve" />
                      <input type="hidden" name="kembali" value={here} />
                      <button className="btn sm" type="submit" aria-label={`Setujui ${seller.storeName}`}>
                        Setujui
                      </button>
                    </form>
                  ) : null}

                  {seller.approvalStatus === "PENDING" ? (
                    <ConfirmActionButton
                      label="Tolak"
                      ariaLabel={`Tolak ${seller.storeName}`}
                      title="Tolak toko?"
                      message={`Toko “${seller.storeName}” tidak akan tampil di katalog. Catatan Anda akan dibaca penjual di dashboardnya.`}
                      confirmLabel="Ya, tolak"
                      action={putusanSellerAction}
                      fields={{ ...fields, aksi: "reject" }}
                      note={{ label: "Catatan untuk penjual (wajib)", required: true, hint: "Jelaskan apa yang perlu diperbaiki. Maksimal 300 karakter." }}
                      danger
                    />
                  ) : null}

                  {seller.approvalStatus === "APPROVED" ? (
                    <ConfirmActionButton
                      label="Tangguhkan"
                      ariaLabel={`Tangguhkan ${seller.storeName}`}
                      title="Tangguhkan toko?"
                      message={`Semua produk “${seller.storeName}” disembunyikan dari katalog dan dashboard penjual menjadi hanya-baca.`}
                      confirmLabel="Ya, tangguhkan"
                      action={putusanSellerAction}
                      fields={{ ...fields, aksi: "suspend" }}
                      note={{ label: "Catatan untuk penjual (opsional)", required: false }}
                      danger
                    />
                  ) : null}

                  {seller.approvalStatus === "SUSPENDED" ? (
                    <form action={putusanSellerAction}>
                      <input type="hidden" name="id" value={seller.id} />
                      <input type="hidden" name="aksi" value="reactivate" />
                      <input type="hidden" name="kembali" value={here} />
                      <button className="btn sm" type="submit" aria-label={`Aktifkan kembali ${seller.storeName}`}>
                        Aktifkan kembali
                      </button>
                    </form>
                  ) : null}

                  {seller.approvalStatus === "APPROVED" ? (
                    <Link className="btn alt sm" href={`/toko/${seller.slug}`} aria-label={`Lihat halaman toko ${seller.storeName}`}>
                      Lihat toko
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <AdminPager basePath="/admin/seller" params={{ status: filter }} page={page} totalPages={totalPages} label="Paginasi antrean seller" />
    </>
  );
}
