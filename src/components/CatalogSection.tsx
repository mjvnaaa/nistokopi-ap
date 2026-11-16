import Link from "next/link";
import {
  catalogHref,
  hasActiveFilters,
  paginate,
  parseCatalogFilters,
  sortProducts,
  type SearchParams,
} from "@/lib/catalog";
import { countPublicProducts, listCatalogProducts, listCategoryCounts, listStoreOptions } from "@/lib/queries";
import { CatalogToolbar } from "./CatalogToolbar";
import { CategoryPills } from "./CategoryPills";
import { Pagination } from "./Pagination";
import { ProductCard } from "./ProductCard";

interface Props {
  basePath: string;
  searchParams: Promise<SearchParams>;
  storeSlug?: string;
  showStoreFilter?: boolean;
}

export async function CatalogSection({ basePath, searchParams, storeSlug, showStoreFilter = false }: Props) {
  const parsed = parseCatalogFilters(await searchParams);
  const filters = { ...parsed, toko: storeSlug ? "" : parsed.toko };

  const [products, categories, allCount, stores] = await Promise.all([
    listCatalogProducts(filters, storeSlug),
    listCategoryCounts(storeSlug),
    countPublicProducts(parseCatalogFilters({}), storeSlug),
    showStoreFilter ? listStoreOptions() : Promise.resolve([]),
  ]);

  const sorted = sortProducts(products, filters.urut);
  const page = paginate(sorted, filters.halaman);
  const filtered = hasActiveFilters(filters);

  const countText =
    page.total === 0
      ? "Tidak ada produk yang cocok"
      : `Menampilkan ${page.start}–${page.end} dari ${page.total} produk`;

  return (
    <>
      <CategoryPills basePath={basePath} filters={filters} categories={categories} total={allCount} />

      <p className="count" aria-live="polite">
        {countText}
      </p>

      <CatalogToolbar basePath={basePath} filters={filters} stores={stores} showStoreFilter={showStoreFilter} />

      {page.items.length > 0 ? (
        <div className="grid">
          {page.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty">
          {filtered ? (
            <>
              <p>Tidak ada produk yang cocok. Ubah kata kunci atau pilih kategori lain.</p>
              <Link
                className="btn alt sm"
                href={catalogHref(basePath, filters, {
                  q: "",
                  kategori: "",
                  toko: "",
                  tersedia: false,
                  halaman: 1,
                })}
              >
                Hapus filter
              </Link>
            </>
          ) : storeSlug ? (
            <p>Toko ini belum menampilkan produk.</p>
          ) : (
            <p>Katalog masih kosong. Produk akan tampil setelah penjual menambahkannya.</p>
          )}
        </div>
      )}

      <Pagination basePath={basePath} filters={filters} page={page.page} totalPages={page.totalPages} />
    </>
  );
}
