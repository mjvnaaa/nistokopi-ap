/**
 * Aturan admin yang murni (tanpa database dan tanpa framework) agar mudah diuji.
 * Dipakai server action di src/app/admin/actions.ts dan tes di tests/admin-rules.test.ts.
 */
import { z } from "zod";
import type { ApprovalStatus, Role } from "@/lib/authz";

/* ---------- Keputusan seller (ADM-01) ---------- */

export const SELLER_ACTIONS = ["approve", "reject", "suspend", "reactivate"] as const;
export type SellerAction = (typeof SELLER_ACTIONS)[number];

export function parseSellerAction(value: string): SellerAction | null {
  return (SELLER_ACTIONS as readonly string[]).includes(value) ? (value as SellerAction) : null;
}

/**
 * Status berikutnya, atau null bila peralihan tidak diizinkan.
 * - Setujui: dari Menunggu atau Ditolak (admin boleh meninjau ulang).
 * - Tolak: hanya dari Menunggu. Toko yang sudah tampil ditangguhkan, bukan ditolak.
 * - Tangguhkan: hanya dari Disetujui.
 * - Aktifkan kembali: hanya dari Ditangguhkan.
 */
export function nextSellerStatus(current: ApprovalStatus, action: SellerAction): ApprovalStatus | null {
  switch (action) {
    case "approve":
      return current === "PENDING" || current === "REJECTED" ? "APPROVED" : null;
    case "reject":
      return current === "PENDING" ? "REJECTED" : null;
    case "suspend":
      return current === "APPROVED" ? "SUSPENDED" : null;
    case "reactivate":
      return current === "SUSPENDED" ? "APPROVED" : null;
  }
}

/** Tolak wajib memakai catatan. Tangguhkan boleh tanpa catatan. */
export const requiresNote = (action: SellerAction): boolean => action === "reject";

export const SELLER_ACTION_AUDIT: Record<SellerAction, string> = {
  approve: "seller.approve",
  reject: "seller.reject",
  suspend: "seller.suspend",
  reactivate: "seller.reactivate",
};

export const reviewNoteSchema = z
  .string()
  .trim()
  .max(300, "Catatan maksimal 300 karakter.");

/* ---------- Pengguna (ADM-02) ---------- */

export const ROLE_LABEL: Record<Role, string> = { ADMIN: "Admin", SELLER: "Penjual", BUYER: "Pembeli" };

/**
 * Peran seller terikat pada profil toko, jadi tidak diubah lewat daftar pengguna
 * (gunakan Tangguhkan di antrean seller). Admin dan pembeli saling dapat ditukar.
 */
export function canAssignRole(target: { role: Role; hasSellerProfile: boolean }, newRole: Role): boolean {
  if (newRole === "SELLER") return false;
  if (target.role === "SELLER" || target.hasSellerProfile) return false;
  return target.role !== newRole;
}

export const parseRole = (value: string): Role | null =>
  value === "ADMIN" || value === "SELLER" || value === "BUYER" ? value : null;

/* ---------- Kategori (ADM-03) ---------- */

export const categoryNameSchema = z
  .string()
  .trim()
  .min(2, "Nama kategori minimal 2 karakter.")
  .max(40, "Nama kategori maksimal 40 karakter.");

/** Geser satu id ke atas atau bawah. Mengembalikan urutan baru, atau null bila tidak bisa digeser. */
export function moveId(ids: readonly string[], id: string, direction: "up" | "down"): string[] | null {
  const index = ids.indexOf(id);
  if (index === -1) return null;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= ids.length) return null;

  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/* ---------- Audit log (ADM-06) ---------- */

export const AUDIT_LABEL: Record<string, string> = {
  "seller.approve": "Menyetujui toko",
  "seller.reject": "Menolak toko",
  "seller.suspend": "Menangguhkan toko",
  "seller.reactivate": "Mengaktifkan kembali toko",
  "user.role": "Mengubah peran pengguna",
  "user.suspend": "Menonaktifkan pengguna",
  "user.activate": "Mengaktifkan pengguna",
  "user.delete": "Menghapus pengguna",
  "category.create": "Menambah kategori",
  "category.rename": "Mengubah nama kategori",
  "category.reorder": "Mengatur urutan kategori",
  "category.delete": "Menghapus kategori",
  "product.hide": "Menyembunyikan produk",
  "product.show": "Menampilkan produk",
  "product.delete": "Menghapus produk",
  "review.hide": "Menyembunyikan ulasan",
  "review.show": "Menampilkan ulasan",
  "review.delete": "Menghapus ulasan",
};

export const auditLabel = (action: string): string => AUDIT_LABEL[action] ?? action;

const META_LABEL: Record<string, string> = {
  targetName: "Sasaran",
  from: "Dari",
  to: "Menjadi",
  note: "Catatan",
};

/** Ringkas meta audit menjadi teks datar (tanpa HTML) untuk tabel log. */
export function describeMeta(meta: unknown): string {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return "";

  return Object.entries(meta as Record<string, unknown>)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .map(([key, value]) => `${META_LABEL[key] ?? key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
    .join(" · ")
    .slice(0, 300);
}

/* ---------- Daftar ber-halaman di admin ---------- */

export const ADMIN_PAGE_SIZE = 20;
export const LOG_PAGE_SIZE = 30;

export function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 100000) : 1;
}

export const totalPagesFor = (total: number, size: number): number => Math.max(1, Math.ceil(total / size));

/** Tanggal (dan jam) dalam bahasa Indonesia, zona waktu Jawa. Contoh: "16 Nov 2026, 14.05". */
export function formatDate(date: Date, withTime = false): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Asia/Jakarta",
  }).format(date);
}
