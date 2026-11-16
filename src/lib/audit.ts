import type { Prisma } from "@/generated/prisma/client";

export interface AuditEntry {
  actorId: string;
  /** Kode aksi, contoh: seller.approve. Daftar label ada di admin-rules.ts. */
  action: string;
  entityType: "SellerProfile" | "User" | "Category" | "Product" | "Review";
  entityId: string;
  /** Data pendukung. Selalu sertakan targetName agar log tetap terbaca setelah sasaran dihapus. */
  meta?: Prisma.InputJsonObject;
}

/**
 * Catat aksi admin (ADM-06). Dipanggil di dalam transaksi yang sama dengan perubahannya,
 * sehingga tidak ada perubahan tanpa catatan. Aplikasi hanya menulis, tidak pernah mengubah atau menghapus log.
 */
export async function writeAudit(tx: Prisma.TransactionClient, entry: AuditEntry): Promise<void> {
  await tx.auditLog.create({
    data: {
      actorId: entry.actorId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      meta: entry.meta,
    },
  });
}
