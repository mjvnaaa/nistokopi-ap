import type { ApprovalStatus } from "@/lib/authz";

/** full: semua fitur toko. profile-only: hanya profil. read-only: hanya lihat. (SPEC-v2 SLR-05) */
export type SellerMode = "full" | "profile-only" | "read-only";

export function sellerMode(status: ApprovalStatus): SellerMode {
  if (status === "APPROVED") return "full";
  if (status === "SUSPENDED") return "read-only";
  return "profile-only";
}

export const STATUS_LABEL: Record<ApprovalStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  SUSPENDED: "Ditangguhkan",
};

export const STATUS_TONE: Record<ApprovalStatus, "warn" | "ok" | "bad"> = {
  PENDING: "warn",
  APPROVED: "ok",
  REJECTED: "bad",
  SUSPENDED: "bad",
};

/** Teks banner di atas dashboard. APPROVED tidak memakai banner. */
export function statusBanner(status: ApprovalStatus, note?: string | null): { title: string; text: string } | null {
  const extra = note?.trim() ? ` Catatan admin: ${note.trim()}` : "";

  switch (status) {
    case "PENDING":
      return { title: "Toko sedang ditinjau", text: "Toko Anda sedang ditinjau admin. Produk belum tampil di katalog. Sementara itu, Anda dapat melengkapi profil toko." };
    case "REJECTED":
      return { title: "Toko belum disetujui", text: `Toko Anda belum disetujui, sehingga belum tampil di katalog.${extra} Anda masih dapat memperbarui profil toko.` };
    case "SUSPENDED":
      return { title: "Toko ditangguhkan", text: `Toko Anda ditangguhkan, produknya disembunyikan dari katalog, dan dashboard hanya dapat dilihat.${extra}` };
    default:
      return null;
  }
}
