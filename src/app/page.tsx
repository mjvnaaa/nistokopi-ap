import { Suspense } from "react";
import Link from "next/link";
import { CatalogSection } from "@/components/CatalogSection";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import type { SearchParams } from "@/lib/catalog";

export const metadata = {
  title: "Katalog Biji Kopi Banyuwangi",
};

export default function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <>
      <p className="crumbs">
        <Link href="/">Beranda</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Katalog</span>
      </p>

      <section className="hero hero-catalog" aria-labelledby="judul-katalog">
        <h1 id="judul-katalog" tabIndex={-1}>
          Biji Kopi Banyuwangi
        </h1>
        <p>
          Biji kopi Robusta, Arabika Ijen, dan specialty khas Banyuwangi. Pilih produk, lalu kirim pesanan
          langsung ke penjual lewat WhatsApp.
        </p>
      </section>

      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogSection basePath="/" searchParams={searchParams} showStoreFilter />
      </Suspense>
    </>
  );
}
