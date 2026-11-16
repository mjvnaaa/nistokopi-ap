/**
 * Logika katalog yang murni (tanpa database dan tanpa framework) agar mudah diuji.
 * Dipakai halaman katalog, halaman toko, dan tes di `tests/catalog.test.ts`.
 */

export const PAGE_SIZE = 24;

export const SORT_KEYS = ["nama", "murah", "mahal", "unggulan", "rating"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export type SearchParams = Record<string, string | string[] | undefined>;

export interface CatalogFilters {
  q: string;
  kategori: string;
  toko: string;
  tersedia: boolean;
  urut: SortKey;
  halaman: number;
}

function first(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

/** Baca filter dari URL. Nilai yang tidak dikenal kembali ke nilai aman. */
export function parseCatalogFilters(params: SearchParams): CatalogFilters {
  const urutRaw = first(params.urut);
  const urut = (SORT_KEYS as readonly string[]).includes(urutRaw) ? (urutRaw as SortKey) : "nama";
  const halamanRaw = Number.parseInt(first(params.halaman), 10);

  return {
    q: first(params.q).trim().slice(0, 80),
    kategori: first(params.kategori).trim().slice(0, 80),
    toko: first(params.toko).trim().slice(0, 80),
    tersedia: first(params.tersedia) === "1",
    urut,
    halaman: Number.isFinite(halamanRaw) && halamanRaw > 0 ? halamanRaw : 1,
  };
}

type SortableProduct = {
  name: string;
  price: number;
  featured: boolean;
  ratingAvg: number | null;
  reviewCount: number;
};

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "id");

/** Urutkan daftar produk. Hasil selalu salinan baru. */
export function sortProducts<T extends SortableProduct>(items: readonly T[], urut: SortKey): T[] {
  const list = [...items];

  switch (urut) {
    case "murah":
      list.sort((a, b) => a.price - b.price || byName(a, b));
      break;
    case "mahal":
      list.sort((a, b) => b.price - a.price || byName(a, b));
      break;
    case "unggulan":
      list.sort((a, b) => Number(b.featured) - Number(a.featured) || byName(a, b));
      break;
    case "rating":
      list.sort(
        (a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) || b.reviewCount - a.reviewCount || byName(a, b),
      );
      break;
    default:
      list.sort(byName);
  }

  return list;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  start: number;
  end: number;
}

/** Bagi hasil ke halaman. `halaman` di luar rentang dijepit ke halaman yang ada. */
export function paginate<T>(items: readonly T[], halaman: number, size = PAGE_SIZE): PageResult<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const page = Math.min(Math.max(1, Math.trunc(halaman) || 1), totalPages);
  const from = (page - 1) * size;
  const slice = items.slice(from, from + size);

  return {
    items: slice,
    page,
    totalPages,
    total,
    start: total === 0 ? 0 : from + 1,
    end: Math.min(from + size, total),
  };
}

/** Susun query string, membuang nilai default agar URL tetap pendek. */
export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === false || value === 0) continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

/** Tautan katalog dengan filter saat ini dan penimpaan opsional. */
export function catalogHref(
  basePath: string,
  filters: CatalogFilters,
  overrides: Partial<CatalogFilters> = {},
): string {
  const merged = { ...filters, ...overrides };

  return (
    basePath +
    buildQuery({
      q: merged.q,
      kategori: merged.kategori,
      toko: merged.toko,
      tersedia: merged.tersedia ? "1" : "",
      urut: merged.urut === "nama" ? "" : merged.urut,
      halaman: merged.halaman > 1 ? merged.halaman : "",
    })
  );
}

/** Tautan halaman tertentu tanpa mempertahankan nomor halaman lama. */
export function pageHref(basePath: string, filters: CatalogFilters, halaman: number): string {
  return catalogHref(basePath, filters, { halaman });
}

/** Angka rating gaya Indonesia: 4,5. */
export function formatRatingValue(avg: number): string {
  return avg.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(filters.q || filters.kategori || filters.toko || filters.tersedia);
}
