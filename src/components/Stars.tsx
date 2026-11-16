import { formatRatingValue } from "@/lib/catalog";

/** Bintang rating. Nilai diumumkan sebagai teks, bukan hanya warna atau ikon. */
export function Stars({ value, label }: { value: number; label?: string }) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <span className="stars" role="img" aria-label={label ?? `Rating ${formatRatingValue(value)} dari 5`}>
      <span aria-hidden="true">
        {"★".repeat(filled)}
        {"☆".repeat(5 - filled)}
      </span>
    </span>
  );
}

export function RatingSummary({ value, count }: { value: number; count: number }) {
  return (
    <p className="rating">
      <Stars value={value} />
      <span>
        {formatRatingValue(value)} ({count})
      </span>
    </p>
  );
}
