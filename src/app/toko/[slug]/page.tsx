import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CatalogSection } from "@/components/CatalogSection";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import { getPublicStore } from "@/lib/queries";
import type { SearchParams } from "@/lib/catalog";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

export default function StorePage(props: Props) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <StoreContent {...props} />
    </Suspense>
  );
}

async function StoreContent({ params, searchParams }: Props) {
  const { slug } = await params;
  const store = await getPublicStore(slug);

  if (!store) notFound();

  const message = `Halo, saya ingin bertanya tentang produk di ${store.name}.`;

  return (
    <>
      <p className="crumbs">
        <Link href="/">Beranda</Link>
        <span aria-hidden="true">›</span>
        <Link href="/">Katalog</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{store.name}</span>
      </p>

      <section className="store-head" aria-labelledby="judul-toko">
        <div>
          <h1 id="judul-toko" tabIndex={-1}>
            {store.name}
          </h1>
          <p className="note">
            {store.city ? `${store.city} · ` : ""}
            {store.description ?? "Toko biji kopi di katalog NistoKopi."}
          </p>
        </div>
        <a
          className="btn alt"
          href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Hubungi toko lewat WhatsApp
        </a>
      </section>

      <CatalogSection
        basePath={`/toko/${store.slug}`}
        searchParams={searchParams}
        storeSlug={store.slug}
        showStoreFilter={false}
      />
    </>
  );
}
