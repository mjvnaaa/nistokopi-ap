import { Suspense } from "react";
import Link from "next/link";
import { AdminFlash, AdminHeader } from "@/components/AdminNav";
import { AdminPager } from "@/components/AdminPager";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import { ConfirmActionButton } from "@/components/ConfirmActionButton";
import { Stars } from "@/components/Stars";
import { flashFor } from "@/lib/admin-flash";
import {
  listProductsForModeration,
  listReviewsForModeration,
  parseModerationFilter,
  type ModerationFilter,
  type ModerationProduct,
} from "@/lib/admin-queries";
import { ADMIN_PAGE_SIZE, formatDate, parsePage, totalPagesFor } from "@/lib/admin-rules";
import type { SearchParams } from "@/lib/catalog";
import { requireAdmin } from "@/lib/guards";
import { hapusProdukAdminAction, hapusUlasanAction, ubahTampilProdukAction, ubahTampilUlasanAction } from "../actions";

export const metadata = { title: "Moderasi" };

export default function AdminModerationPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

/** Alasan produk tampil atau tidak di katalog, selalu berupa teks. */
function visibility(product: ModerationProduct): { text: string; tone: "ok" | "bad" | "off" } {
  if (product.hiddenByAdmin) return { text: "Disembunyikan admin", tone: "bad" };
  if (!product.isActive) return { text: "Nonaktif (oleh penjual)", tone: "off" };
  if (!product.storeApproved) return { text: "Toko belum tampil", tone: "off" };
  return { text: "Tampil di katalog", tone: "ok" };
}

async function Content({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin("/admin/moderasi");
  const params = await searchParams;

  const section = one(params.bagian) === "ulasan" ? "ulasan" : "produk";
  const filter: ModerationFilter = parseModerationFilter(params.tampil);
  const q = one(params.q).trim().slice(0, 80);
  const page = parsePage(params.halaman);

  const tabHref = (bagian: string) => `/admin/moderasi${bagian === "produk" ? "" : `?bagian=${bagian}`}`;
  const filterHref = (value: ModerationFilter) => {
    const query = new URLSearchParams();
    if (section === "ulasan") query.set("bagian", "ulasan");
    if (value === "disembunyikan") query.set("tampil", value);
    if (q && section === "produk") query.set("q", q);
    const text = query.toString();
    return text ? `/admin/moderasi?${text}` : "/admin/moderasi";
  };

  const here = (() => {
    const query = new URLSearchParams();
    if (section === "ulasan") query.set("bagian", "ulasan");
    if (filter === "disembunyikan") query.set("tampil", filter);
    if (q && section === "produk") query.set("q", q);
    if (page > 1) query.set("halaman", String(page));
    const text = query.toString();
    return text ? `/admin/moderasi?${text}` : "/admin/moderasi";
  })();

  return (
    <>
      <AdminHeader current="moderasi" title="Moderasi" lead="Sembunyikan atau hapus produk dan ulasan. Produk atau ulasan yang disembunyikan tidak tampil di katalog dan tidak dihitung dalam rating." />
      <AdminFlash flash={flashFor(params.info)} />

      <nav aria-label="Bagian moderasi">
        <ul className="subnav">
          <li>
            <Link href={tabHref("produk")} aria-current={section === "produk" ? "page" : undefined}>
              Produk
            </Link>
          </li>
          <li>
            <Link href={tabHref("ulasan")} aria-current={section === "ulasan" ? "page" : undefined}>
              Ulasan
            </Link>
          </li>
        </ul>
      </nav>

      <nav aria-label="Saring tampilan">
        <ul className="subnav">
          <li>
            <Link href={filterHref("semua")} aria-current={filter === "semua" ? "page" : undefined}>
              Semua
            </Link>
          </li>
          <li>
            <Link href={filterHref("disembunyikan")} aria-current={filter === "disembunyikan" ? "page" : undefined}>
              Disembunyikan
            </Link>
          </li>
        </ul>
      </nav>

      {section === "produk" ? <Products q={q} filter={filter} page={page} here={here} /> : <Reviews filter={filter} page={page} here={here} />}
    </>
  );
}

async function Products({ q, filter, page, here }: { q: string; filter: ModerationFilter; page: number; here: string }) {
  const { items, total } = await listProductsForModeration({ q, filter, page });
  const totalPages = totalPagesFor(total, ADMIN_PAGE_SIZE);

  return (
    <>
      <form className="search-row" method="get" action="/admin/moderasi" role="search" aria-label="Cari produk">
        {filter === "disembunyikan" ? <input type="hidden" name="tampil" value="disembunyikan" /> : null}
        <div className="field">
          <label htmlFor="q">Nama produk atau toko</label>
          <input id="q" name="q" type="search" defaultValue={q} maxLength={80} autoComplete="off" />
        </div>
        <button className="btn" type="submit">
          Cari
        </button>
      </form>

      <p className="count" aria-live="polite">
        {total.toLocaleString("id-ID")} produk
      </p>

      {items.length === 0 ? (
        <div className="empty">
          <p>{filter === "disembunyikan" ? "Tidak ada produk yang disembunyikan." : "Tidak ada produk yang cocok."}</p>
        </div>
      ) : (
        <div className="tbl wide">
          <table>
            <caption className="sr">Produk untuk dimoderasi</caption>
            <thead>
              <tr>
                <th scope="col">Produk</th>
                <th scope="col">Toko</th>
                <th scope="col">Kategori</th>
                <th scope="col">Status</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((product) => {
                const state = visibility(product);

                return (
                  <tr key={product.id}>
                    <td className="cell-clip">
                      <b>{product.name}</b>
                      <span className="cell-sub">Dibuat {formatDate(product.createdAt)}</span>
                    </td>
                    <td>{product.storeName}</td>
                    <td>{product.categoryName}</td>
                    <td>
                      <span className={`tag ${state.tone}`}>{state.text}</span>
                    </td>
                    <td>
                      <div className="act-wrap">
                        {product.hiddenByAdmin ? (
                          <form action={ubahTampilProdukAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <input type="hidden" name="tampil" value="1" />
                            <input type="hidden" name="kembali" value={here} />
                            <button className="btn alt sm" type="submit" aria-label={`Tampilkan ${product.name}`}>
                              Tampilkan
                            </button>
                          </form>
                        ) : (
                          <ConfirmActionButton
                            label="Sembunyikan"
                            ariaLabel={`Sembunyikan ${product.name}`}
                            title="Sembunyikan produk?"
                            message={`Produk “${product.name}” dari ${product.storeName} tidak lagi tampil di katalog. Penjual melihat penandanya di dashboard.`}
                            confirmLabel="Ya, sembunyikan"
                            action={ubahTampilProdukAction}
                            fields={{ id: product.id, tampil: "0", kembali: here }}
                            danger
                          />
                        )}

                        <ConfirmActionButton
                          label="Hapus"
                          ariaLabel={`Hapus ${product.name}`}
                          title="Hapus produk?"
                          message={`Produk “${product.name}” dari ${product.storeName} dihapus beserta favorit, ulasan, dan statistik kliknya. Tindakan ini tidak dapat dibatalkan.`}
                          confirmLabel="Ya, hapus"
                          action={hapusProdukAdminAction}
                          fields={{ id: product.id, kembali: here }}
                          danger
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminPager
        basePath="/admin/moderasi"
        params={{ q, tampil: filter === "disembunyikan" ? filter : "" }}
        page={page}
        totalPages={totalPages}
        label="Paginasi produk"
      />
    </>
  );
}

async function Reviews({ filter, page, here }: { filter: ModerationFilter; page: number; here: string }) {
  const { items, total } = await listReviewsForModeration({ filter, page });
  const totalPages = totalPagesFor(total, ADMIN_PAGE_SIZE);

  return (
    <>
      <p className="count" aria-live="polite">
        {total.toLocaleString("id-ID")} ulasan
      </p>

      {items.length === 0 ? (
        <div className="empty">
          <p>{filter === "disembunyikan" ? "Tidak ada ulasan yang disembunyikan." : "Belum ada ulasan."}</p>
        </div>
      ) : (
        <div className="tbl wide">
          <table>
            <caption className="sr">Ulasan untuk dimoderasi</caption>
            <thead>
              <tr>
                <th scope="col">Pembeli</th>
                <th scope="col">Produk</th>
                <th scope="col">Rating</th>
                <th scope="col">Komentar</th>
                <th scope="col">Status</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((review) => {
                const label = `ulasan ${review.userName} untuk ${review.productName}`;

                return (
                  <tr key={review.id}>
                    <td>
                      {review.userName}
                      <span className="cell-sub">{formatDate(review.createdAt)}</span>
                    </td>
                    <td className="cell-clip">
                      {review.productName}
                      <span className="cell-sub">{review.storeName}</span>
                    </td>
                    <td>
                      <Stars value={review.rating} />
                    </td>
                    <td className="cell-clip">{review.comment ? review.comment : <span className="note">Tanpa komentar</span>}</td>
                    <td>
                      <span className={`tag ${review.hidden ? "bad" : "ok"}`}>{review.hidden ? "Disembunyikan" : "Tampil"}</span>
                    </td>
                    <td>
                      <div className="act-wrap">
                        {review.hidden ? (
                          <form action={ubahTampilUlasanAction}>
                            <input type="hidden" name="id" value={review.id} />
                            <input type="hidden" name="tampil" value="1" />
                            <input type="hidden" name="kembali" value={here} />
                            <button className="btn alt sm" type="submit" aria-label={`Tampilkan ${label}`}>
                              Tampilkan
                            </button>
                          </form>
                        ) : (
                          <ConfirmActionButton
                            label="Sembunyikan"
                            ariaLabel={`Sembunyikan ${label}`}
                            title="Sembunyikan ulasan?"
                            message={`Ulasan dari ${review.userName} untuk “${review.productName}” tidak tampil lagi dan tidak dihitung dalam rating.`}
                            confirmLabel="Ya, sembunyikan"
                            action={ubahTampilUlasanAction}
                            fields={{ id: review.id, tampil: "0", kembali: here }}
                            danger
                          />
                        )}

                        <ConfirmActionButton
                          label="Hapus"
                          ariaLabel={`Hapus ${label}`}
                          title="Hapus ulasan?"
                          message={`Ulasan dari ${review.userName} untuk “${review.productName}” dihapus. Tindakan ini tidak dapat dibatalkan.`}
                          confirmLabel="Ya, hapus"
                          action={hapusUlasanAction}
                          fields={{ id: review.id, kembali: here }}
                          danger
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminPager
        basePath="/admin/moderasi"
        params={{ bagian: "ulasan", tampil: filter === "disembunyikan" ? filter : "" }}
        page={page}
        totalPages={totalPages}
        label="Paginasi ulasan"
      />
    </>
  );
}
