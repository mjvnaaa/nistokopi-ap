import type { ApprovalStatus } from "@/lib/authz";
import { STATUS_LABEL, STATUS_TONE, statusBanner } from "@/lib/seller-status";

export function StatusBadge({ status }: { status: ApprovalStatus }) {
  return <span className={`tag ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>;
}

/** Banner status seller. Tidak tampil untuk APPROVED. Selalu berisi teks, bukan warna saja. */
export function SellerBanner({ status, note }: { status: ApprovalStatus; note?: string | null }) {
  const banner = statusBanner(status, note);
  if (!banner) return null;

  return (
    <div className={`banner ${STATUS_TONE[status]}`} role="status">
      <p className="banner-title">
        <StatusBadge status={status} /> {banner.title}
      </p>
      <p>{banner.text}</p>
    </div>
  );
}
