import { Suspense } from "react";
import { AdminFlash, AdminHeader } from "@/components/AdminNav";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import { ConfirmActionButton } from "@/components/ConfirmActionButton";
import { flashFor } from "@/lib/admin-flash";
import { listAdminCategories } from "@/lib/admin-queries";
import type { SearchParams } from "@/lib/catalog";
import { requireAdmin } from "@/lib/guards";
import { geserKategoriAction, hapusKategoriAction, tambahKategoriAction, ubahNamaKategoriAction } from "../actions";

export const metadata = { title: "Kategori" };

export default function AdminCategoriesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin("/admin/kategori");
  const [categories, params] = await Promise.all([listAdminCategories(), searchParams]);
  const here = "/admin/kategori";

  return (
    <>
      <AdminHeader current="kategori" title="Kategori" lead="Penjual memilih kategori dari daftar ini. Urutan di sini menjadi urutan pill di katalog." />
      <AdminFlash flash={flashFor(params.info)} />

      <section className="panel" aria-labelledby="judul-tambah">
        <h2 id="judul-tambah">Tambah kategori</h2>
        <form action={tambahKategoriAction} className="search-row">
          <input type="hidden" name="kembali" value={here} />
          <div className="field">
            <label htmlFor="nama-baru">Nama kategori</label>
            <input id="nama-baru" name="nama" type="text" required minLength={2} maxLength={40} autoComplete="off" aria-describedby="nama-baru-h" />
            <p className="note field-hint" id="nama-baru-h">
              2 sampai 40 karakter. Contoh: Green bean.
            </p>
          </div>
          <button className="btn" type="submit">
            Tambah
          </button>
        </form>
      </section>

      {categories.length === 0 ? (
        <div className="empty">Belum ada kategori. Tambahkan kategori pertama di atas.</div>
      ) : (
        <div className="tbl wide">
          <table>
            <caption className="sr">Daftar kategori menurut urutan tampil</caption>
            <thead>
              <tr>
                <th scope="col">Urutan</th>
                <th scope="col">Nama</th>
                <th scope="col">Produk</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id}>
                  <td>
                    <div className="act-wrap">
                      <span>{index + 1}</span>
                      {(["up", "down"] as const).map((direction) => {
                        const edge = direction === "up" ? index === 0 : index === categories.length - 1;
                        const label = direction === "up" ? "Naik" : "Turun";

                        return (
                          <form action={geserKategoriAction} key={direction}>
                            <input type="hidden" name="id" value={category.id} />
                            <input type="hidden" name="arah" value={direction} />
                            <input type="hidden" name="kembali" value={here} />
                            <button className="btn alt sm" type="submit" disabled={edge} aria-label={`${label}kan ${category.name}`}>
                              {label}
                            </button>
                          </form>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    <form action={ubahNamaKategoriAction} className="inline-form">
                      <input type="hidden" name="id" value={category.id} />
                      <input type="hidden" name="kembali" value={here} />
                      <label className="sr" htmlFor={`nama-${category.id}`}>
                        Nama kategori {category.name}
                      </label>
                      <input id={`nama-${category.id}`} name="nama" type="text" defaultValue={category.name} required minLength={2} maxLength={40} autoComplete="off" />
                      <button className="btn alt sm" type="submit" aria-label={`Simpan nama untuk ${category.name}`}>
                        Simpan nama
                      </button>
                    </form>
                    <span className="cell-sub">Alamat filter: ?kategori={category.slug}</span>
                  </td>
                  <td>{category.productCount.toLocaleString("id-ID")}</td>
                  <td>
                    {category.productCount > 0 ? (
                      <span className="note">Dipakai {category.productCount.toLocaleString("id-ID")} produk, belum dapat dihapus</span>
                    ) : (
                      <ConfirmActionButton
                        label="Hapus"
                        ariaLabel={`Hapus kategori ${category.name}`}
                        title="Hapus kategori?"
                        message={`Kategori “${category.name}” dihapus. Tindakan ini tidak dapat dibatalkan.`}
                        confirmLabel="Ya, hapus"
                        action={hapusKategoriAction}
                        fields={{ id: category.id, kembali: here }}
                        danger
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
