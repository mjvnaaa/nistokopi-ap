"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { catalogHref, type CatalogFilters, type SortKey } from "@/lib/catalog";
import type { StoreOption } from "@/lib/queries";

interface Props {
  basePath: string;
  filters: CatalogFilters;
  stores: StoreOption[];
  showStoreFilter: boolean;
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "nama", label: "Nama A–Z" },
  { value: "murah", label: "Harga termurah" },
  { value: "mahal", label: "Harga termahal" },
  { value: "unggulan", label: "Unggulan dulu" },
  { value: "rating", label: "Rating tertinggi" },
];

export function CatalogToolbar({ basePath, filters, stores, showStoreFilter }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(filters.q);
  const [syncedQuery, setSyncedQuery] = useState(filters.q);

  // Ikuti perubahan dari URL (misalnya tombol kembali) tanpa efek yang memicu render berantai.
  if (filters.q !== syncedQuery) {
    setSyncedQuery(filters.q);
    setQuery(filters.q);
  }

  useEffect(() => {
    if (query === filters.q) return;

    const timer = setTimeout(() => {
      const href = catalogHref(basePath, filters, { q: query, halaman: 1 });
      startTransition(() => router.replace(href, { scroll: false }));
    }, 350);

    return () => clearTimeout(timer);
  }, [query, filters, basePath, router]);

  const navigate = (overrides: Partial<CatalogFilters>) => {
    const href = catalogHref(basePath, filters, { halaman: 1, q: query, ...overrides });
    startTransition(() => router.replace(href, { scroll: false }));
  };

  return (
    <form
      className="toolbar"
      action={basePath}
      method="get"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate({ q: query });
      }}
    >
      <input type="hidden" name="kategori" value={filters.kategori} />
      {!showStoreFilter && filters.toko ? <input type="hidden" name="toko" value={filters.toko} /> : null}

      <div className="qbox">
        <label htmlFor="q" className="sr">
          Cari produk
        </label>
        <input
          id="q"
          type="search"
          name="q"
          autoComplete="off"
          placeholder="Cari nama atau deskripsi produk"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <label className="chk">
        <input
          type="checkbox"
          name="tersedia"
          value="1"
          checked={filters.tersedia}
          onChange={(event) => navigate({ tersedia: event.target.checked })}
        />
        Hanya yang tersedia
      </label>

      {showStoreFilter ? (
        <div className="sortbox">
          <label htmlFor="toko">Toko</label>
          <select id="toko" name="toko" value={filters.toko} onChange={(event) => navigate({ toko: event.target.value })}>
            <option value="">Semua toko</option>
            {stores.map((store) => (
              <option key={store.slug} value={store.slug}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="sortbox">
        <label htmlFor="urut">Urutkan</label>
        <select
          id="urut"
          name="urut"
          value={filters.urut}
          onChange={(event) => navigate({ urut: event.target.value as SortKey })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button className="sr" type="submit">
        Cari
      </button>

      <span className="sr" aria-live="polite">
        {isPending ? "Memuat hasil pencarian." : ""}
      </span>
    </form>
  );
}
