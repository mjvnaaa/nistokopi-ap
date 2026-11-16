import Link from "next/link";
import { formatRatingValue } from "@/lib/catalog";
import type { CatalogProduct } from "@/lib/queries";
import { formatRupiah, stockStatus, waLink } from "@/lib/whatsapp";
import { Stars } from "./Stars";

const ICONS: Record<string, string> = {
  robusta: "☕",
  arabika: "☕",
  specialty: "✨",
  paket: "🎁",
};

export function ProductCard({ product }: { product: CatalogProduct }) {
  const stock = stockStatus(product.stock);
  const href = `/produk/${product.id}`;
  const messageHref = `/api/klik/${product.id}?wa=${encodeURIComponent(waLink(product, product.store.whatsapp))}`;
  const icon = ICONS[product.category.slug] ?? "☕";

  return (
    <article className="card">
      <div className="tile">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL Blob bebas host, validasi dilakukan di server.
          <img src={product.imageUrl} alt={`Foto ${product.name}`} loading="lazy" />
        ) : (
          <span aria-hidden="true">{icon}</span>
        )}
        {product.featured ? <span className="badge">Unggulan</span> : null}
      </div>

      <div className="body">
        <div className="sub">
          <span className="cat-pill">{product.category.name}</span>
          <span className={`stock ${stock.level}`}>{stock.label}</span>
        </div>

        <h2>
          <Link href={href}>{product.name}</Link>
        </h2>

        <Link className="store" href={`/toko/${product.store.slug}`}>
          {product.store.name}
        </Link>

        {product.ratingAvg !== null ? (
          <p className="rating">
            <Stars value={product.ratingAvg} />
            <span>
              {formatRatingValue(product.ratingAvg)} ({product.reviewCount})
            </span>
          </p>
        ) : null}

        <p className="desc">{product.description}</p>
        <span className="price">{formatRupiah(product.price)}</span>

        {stock.level === "out" ? (
          <button className="btn" type="button" disabled aria-disabled="true">
            Tidak tersedia
          </button>
        ) : (
          <a
            className="btn"
            href={messageHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Pesan ${product.name} lewat WhatsApp (buka di tab baru)`}
          >
            Pesan lewat WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}
