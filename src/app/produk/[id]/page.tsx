import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RatingSummary, Stars } from "@/components/Stars";
import { formatRatingValue } from "@/lib/catalog";
import { getPublicProduct } from "@/lib/queries";
import { formatRupiah, stockStatus, waLink } from "@/lib/whatsapp";

const ICONS: Record<string, string> = {
  robusta: "☕",
  arabika: "☕",
  specialty: "✨",
  paket: "🎁",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" });

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="empty" aria-busy="true">
          <p>Memuat produk…</p>
        </div>
      }
    >
      <ProductContent params={params} />
    </Suspense>
  );
}

async function ProductContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getPublicProduct(id);

  if (!product) notFound();

  const stock = stockStatus(product.stock);
  const messageHref = `/api/klik/${product.id}?wa=${encodeURIComponent(waLink(product, product.store.whatsapp))}`;
  const icon = ICONS[product.category.slug] ?? "☕";

  return (
    <>
      <p className="crumbs">
        <Link href="/">Beranda</Link>
        <span aria-hidden="true">›</span>
        <Link href="/">Katalog</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">{product.name}</span>
      </p>

      <div className="product">
        <div className="product-media">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL Blob bebas host, validasi dilakukan di server.
            <img src={product.imageUrl} alt={`Foto ${product.name}`} />
          ) : (
            <span aria-hidden="true">{icon}</span>
          )}
          {product.featured ? <span className="badge">Unggulan</span> : null}
        </div>

        <div className="product-info">
          <div className="sub">
            <span className="cat-pill">{product.category.name}</span>
            <span className={`stock ${stock.level}`}>{stock.label}</span>
          </div>

          <h1 tabIndex={-1}>{product.name}</h1>

          <p className="note">
            Dijual oleh{" "}
            <Link className="store" href={`/toko/${product.store.slug}`}>
              {product.store.name}
            </Link>
            {product.store.city ? ` · ${product.store.city}` : ""}
          </p>

          {product.ratingAvg !== null ? <RatingSummary value={product.ratingAvg} count={product.reviewCount} /> : null}

          <p className="product-price">{formatRupiah(product.price)}</p>
          <p className="product-desc">{product.description}</p>

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

          <p className="note">
            Pesanan diteruskan ke WhatsApp penjual. Aplikasi tidak memproses pembayaran atau pengiriman.
          </p>
        </div>
      </div>

      <section className="panel" aria-labelledby="judul-ulasan">
        <h2 id="judul-ulasan">Ulasan</h2>

        {product.ratingAvg !== null ? (
          <p className="rating-summary">
            <Stars value={product.ratingAvg} />
            <span>
              {formatRatingValue(product.ratingAvg)} dari 5 · {product.reviewCount} ulasan
            </span>
          </p>
        ) : (
          <p className="note">Belum ada ulasan untuk produk ini.</p>
        )}

        {product.reviews.length > 0 ? (
          <ul className="review-list">
            {product.reviews.map((review) => (
              <li className="review" key={review.id}>
                <div className="review-head">
                  <strong>{review.userName}</strong>
                  <time dateTime={review.createdAt.toISOString()}>{dateFormatter.format(review.createdAt)}</time>
                  <Stars value={review.rating} label={`Rating ${review.rating} dari 5`} />
                </div>
                {review.comment ? <p>{review.comment}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p>
        <Link className="btn alt" href="/">
          Kembali ke katalog
        </Link>
      </p>
    </>
  );
}
