"use server";

import { redirect } from "next/navigation";
import { getActor } from "@/lib/actor";
import {
  canAccessAdminArea,
  canChangeUserRole,
  canDecideSeller,
  canDeleteUser,
  canManageCategories,
  canModerateProduct,
  canModerateReview,
  canSetUserStatus,
} from "@/lib/authz";
import {
  SELLER_ACTION_AUDIT,
  canAssignRole,
  categoryNameSchema,
  moveId,
  nextSellerStatus,
  parseRole,
  parseSellerAction,
  requiresNote,
  reviewNoteSchema,
} from "@/lib/admin-rules";
import { writeAudit } from "@/lib/audit";
import { deleteBlobs } from "@/lib/blob";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { FlashCode } from "@/lib/admin-flash";
import { str } from "@/lib/form";
import { safeNext } from "@/lib/redirect";
import { slugify, uniqueSlug } from "@/lib/text";

/**
 * Semua aksi admin: cek peran dari database di SETIAP panggilan (bukan percaya tampilan), lakukan
 * perubahan dan catatan audit dalam satu transaksi, lalu kembali ke halaman asal dengan pesan singkat.
 */

async function gate() {
  const actor = await getActor();
  if (!actor) redirect("/masuk?pesan=sesi");
  if (!canAccessAdminArea(actor)) redirect("/akses-ditolak?untuk=admin");
  return actor;
}

/** Kembali ke halaman asal (hanya jalur /admin) dengan kode pesan. */
function back(formData: FormData, fallback: string, code: FlashCode): never {
  const raw = safeNext(str(formData, "kembali"));
  const url = new URL(raw || fallback, "http://localhost");
  const base = url.pathname.startsWith("/admin") ? url : new URL(fallback, "http://localhost");

  base.searchParams.set("info", code);
  redirect(base.pathname + base.search);
}

const SERIALIZABLE = { isolationLevel: Prisma.TransactionIsolationLevel.Serializable } as const;

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

function isForeignKeyViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2003";
}

/* ---------------------------------------------------------------- Seller (ADM-01) */

export async function putusanSellerAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/seller";

  const id = str(formData, "id");
  const action = parseSellerAction(str(formData, "aksi"));
  if (!canDecideSeller(actor) || !id || !action) back(formData, fallback, "gagal");

  const note = reviewNoteSchema.safeParse(str(formData, "catatan"));
  if (!note.success || (requiresNote(action) && note.data === "")) back(formData, fallback, "catatan-wajib");

  let code: FlashCode;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const seller = await tx.sellerProfile.findUnique({
        where: { id },
        select: { id: true, storeName: true, approvalStatus: true },
      });
      if (!seller) return "tidak-ditemukan";

      const next = nextSellerStatus(seller.approvalStatus, action);
      if (!next) return "status-berubah";

      // Syarat status lama di klausa where: dua admin yang menekan tombol bersamaan tidak saling menimpa.
      const keepNote = action === "reject" || action === "suspend";
      const changed = await tx.sellerProfile.updateMany({
        where: { id, approvalStatus: seller.approvalStatus },
        data: {
          approvalStatus: next,
          reviewNote: keepNote && note.data ? note.data : null,
          reviewedAt: new Date(),
        },
      });
      if (changed.count !== 1) return "status-berubah";

      await writeAudit(tx, {
        actorId: actor.id,
        action: SELLER_ACTION_AUDIT[action],
        entityType: "SellerProfile",
        entityId: id,
        meta: { targetName: seller.storeName, from: seller.approvalStatus, to: next, note: note.data || null },
      });

      const done: Record<typeof action, FlashCode> = {
        approve: "seller-disetujui",
        reject: "seller-ditolak",
        suspend: "seller-ditangguhkan",
        reactivate: "seller-diaktifkan",
      };
      return done[action];
    });
  } catch (error) {
    console.error("Gagal memutuskan status seller", error);
    code = "gagal";
  }

  back(formData, fallback, code);
}

/* --------------------------------------------------------------- Pengguna (ADM-02) */

export async function ubahPeranAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/pengguna";

  const id = str(formData, "id");
  const newRole = parseRole(str(formData, "peran"));
  if (!id || !newRole) back(formData, fallback, "gagal");

  let code: FlashCode;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const target = await tx.user.findUnique({
        where: { id },
        select: { id: true, name: true, role: true, sellerProfile: { select: { id: true } } },
      });
      if (!target) return "tidak-ditemukan";
      if (target.id === actor.id) return "pengguna-ditolak";
      if (!canAssignRole({ role: target.role, hasSellerProfile: !!target.sellerProfile }, newRole)) return "pengguna-ditolak";

      const activeAdmins = await tx.user.count({ where: { role: "ADMIN", status: "ACTIVE" } });
      if (!canChangeUserRole(actor, target, newRole, activeAdmins)) return "pengguna-ditolak";

      await tx.user.update({ where: { id }, data: { role: newRole } });
      await writeAudit(tx, {
        actorId: actor.id,
        action: "user.role",
        entityType: "User",
        entityId: id,
        meta: { targetName: target.name, from: target.role, to: newRole },
      });
      return "peran-diubah";
    }, SERIALIZABLE);
  } catch (error) {
    console.error("Gagal mengubah peran", error);
    code = "gagal";
  }

  back(formData, fallback, code);
}

export async function ubahStatusPenggunaAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/pengguna";

  const id = str(formData, "id");
  const raw = str(formData, "status");
  const newStatus = raw === "ACTIVE" || raw === "SUSPENDED" ? raw : null;
  if (!id || !newStatus) back(formData, fallback, "gagal");

  let code: FlashCode;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const target = await tx.user.findUnique({ where: { id }, select: { id: true, name: true, role: true, status: true } });
      if (!target) return "tidak-ditemukan";
      if (target.id === actor.id) return "pengguna-ditolak";
      if (target.status === newStatus) return "status-berubah";

      const activeAdmins = await tx.user.count({ where: { role: "ADMIN", status: "ACTIVE" } });
      if (!canSetUserStatus(actor, target, newStatus, activeAdmins)) return "pengguna-ditolak";

      await tx.user.update({ where: { id }, data: { status: newStatus } });
      await writeAudit(tx, {
        actorId: actor.id,
        action: newStatus === "SUSPENDED" ? "user.suspend" : "user.activate",
        entityType: "User",
        entityId: id,
        meta: { targetName: target.name, from: target.status, to: newStatus },
      });
      return newStatus === "SUSPENDED" ? "pengguna-dinonaktifkan" : "pengguna-diaktifkan";
    }, SERIALIZABLE);
  } catch (error) {
    console.error("Gagal mengubah status pengguna", error);
    code = "gagal";
  }

  back(formData, fallback, code);
}

export async function hapusPenggunaAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/pengguna";

  const id = str(formData, "id");
  if (!id) back(formData, fallback, "gagal");

  let code: FlashCode;
  let imagesToDelete: (string | null)[] = [];
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const target = await tx.user.findUnique({ where: { id }, select: { id: true, name: true, role: true } });
      if (!target) return "tidak-ditemukan";

      const activeAdmins = await tx.user.count({ where: { role: "ADMIN", status: "ACTIVE" } });
      if (!canDeleteUser(actor, target, activeAdmins)) return "pengguna-ditolak";

      // Foto semua produk toko pengguna ini ikut dibersihkan dari Blob setelah penghapusan berhasil.
      const photos = await tx.product.findMany({ where: { seller: { userId: id }, imageUrl: { not: null } }, select: { imageUrl: true } });
      imagesToDelete = photos.map((photo) => photo.imageUrl);

      // Sesi, akun, toko, produk, favorit, dan ulasan ikut terhapus (cascade). Klik dan log tetap, pelaku jadi kosong.
      await tx.user.delete({ where: { id } });
      await writeAudit(tx, {
        actorId: actor.id,
        action: "user.delete",
        entityType: "User",
        entityId: id,
        meta: { targetName: target.name, from: target.role },
      });
      return "pengguna-dihapus";
    }, SERIALIZABLE);
  } catch (error) {
    console.error("Gagal menghapus pengguna", error);
    code = "gagal";
  }

  if (code === "pengguna-dihapus") await deleteBlobs(imagesToDelete);
  back(formData, fallback, code);
}

/* ---------------------------------------------------------------- Kategori (ADM-03) */

export async function tambahKategoriAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/kategori";
  if (!canManageCategories(actor)) back(formData, fallback, "gagal");

  const name = categoryNameSchema.safeParse(str(formData, "nama"));
  if (!name.success) back(formData, fallback, "kategori-nama");

  let code: FlashCode;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const same = await tx.category.findFirst({ where: { name: { equals: name.data, mode: "insensitive" } }, select: { id: true } });
      if (same) return "kategori-ganda";

      const slug = await uniqueSlug(slugify(name.data), async (candidate) => !!(await tx.category.findUnique({ where: { slug: candidate }, select: { id: true } })));
      const last = await tx.category.aggregate({ _max: { sortOrder: true } });

      const created = await tx.category.create({
        data: { name: name.data, slug, sortOrder: (last._max.sortOrder ?? -1) + 1 },
        select: { id: true },
      });
      await writeAudit(tx, {
        actorId: actor.id,
        action: "category.create",
        entityType: "Category",
        entityId: created.id,
        meta: { targetName: name.data },
      });
      return "kategori-ditambah";
    }, SERIALIZABLE);
  } catch (error) {
    if (isUniqueViolation(error)) code = "kategori-ganda";
    else {
      console.error("Gagal menambah kategori", error);
      code = "gagal";
    }
  }

  back(formData, fallback, code);
}

export async function ubahNamaKategoriAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/kategori";
  const id = str(formData, "id");
  if (!canManageCategories(actor) || !id) back(formData, fallback, "gagal");

  const name = categoryNameSchema.safeParse(str(formData, "nama"));
  if (!name.success) back(formData, fallback, "kategori-nama");

  let code: FlashCode;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const current = await tx.category.findUnique({ where: { id }, select: { id: true, name: true } });
      if (!current) return "tidak-ditemukan";

      const same = await tx.category.findFirst({
        where: { name: { equals: name.data, mode: "insensitive" }, NOT: { id } },
        select: { id: true },
      });
      if (same) return "kategori-ganda";

      // Slug sengaja tidak berubah agar tautan filter kategori yang sudah dibagikan tetap berlaku.
      await tx.category.update({ where: { id }, data: { name: name.data } });
      await writeAudit(tx, {
        actorId: actor.id,
        action: "category.rename",
        entityType: "Category",
        entityId: id,
        meta: { targetName: name.data, from: current.name, to: name.data },
      });
      return "kategori-diubah";
    }, SERIALIZABLE);
  } catch (error) {
    if (isUniqueViolation(error)) code = "kategori-ganda";
    else {
      console.error("Gagal mengubah kategori", error);
      code = "gagal";
    }
  }

  back(formData, fallback, code);
}

export async function geserKategoriAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/kategori";
  const id = str(formData, "id");
  const raw = str(formData, "arah");
  const direction = raw === "up" || raw === "down" ? raw : null;
  if (!canManageCategories(actor) || !id || !direction) back(formData, fallback, "gagal");

  let code: FlashCode;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const rows = await tx.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } });
      const next = moveId(rows.map((row) => row.id), id, direction);
      if (!next) return "kategori-diurutkan"; // sudah di ujung: tidak ada yang berubah

      // Tulis ulang seluruh urutan 0..n-1 agar nomor urut yang kembar dari data lama ikut rapi.
      for (const [index, categoryId] of next.entries()) {
        await tx.category.update({ where: { id: categoryId }, data: { sortOrder: index } });
      }
      await writeAudit(tx, {
        actorId: actor.id,
        action: "category.reorder",
        entityType: "Category",
        entityId: id,
        meta: { targetName: rows.find((row) => row.id === id)?.name ?? "", to: direction === "up" ? "naik" : "turun" },
      });
      return "kategori-diurutkan";
    }, SERIALIZABLE);
  } catch (error) {
    console.error("Gagal mengurutkan kategori", error);
    code = "gagal";
  }

  back(formData, fallback, code);
}

export async function hapusKategoriAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/kategori";
  const id = str(formData, "id");
  if (!canManageCategories(actor) || !id) back(formData, fallback, "gagal");

  let code: FlashCode;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const category = await tx.category.findUnique({
        where: { id },
        select: { id: true, name: true, _count: { select: { products: true } } },
      });
      if (!category) return "tidak-ditemukan";
      if (category._count.products > 0) return "kategori-dipakai";

      await tx.category.delete({ where: { id } });
      await writeAudit(tx, {
        actorId: actor.id,
        action: "category.delete",
        entityType: "Category",
        entityId: id,
        meta: { targetName: category.name },
      });
      return "kategori-dihapus";
    }, SERIALIZABLE);
  } catch (error) {
    // Lapis kedua: basis data menolak (restrict) bila produk baru dipasang tepat saat dihapus.
    if (isForeignKeyViolation(error)) code = "kategori-dipakai";
    else {
      console.error("Gagal menghapus kategori", error);
      code = "gagal";
    }
  }

  back(formData, fallback, code);
}

/* ---------------------------------------------------------------- Moderasi (ADM-04) */

export async function ubahTampilProdukAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/moderasi";
  const id = str(formData, "id");
  if (!canModerateProduct(actor) || !id) back(formData, fallback, "gagal");

  const hide = str(formData, "tampil") === "0";

  let code: FlashCode;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const product = await tx.product.findUnique({ where: { id }, select: { id: true, name: true, seller: { select: { storeName: true } } } });
      if (!product) return "tidak-ditemukan";

      await tx.product.update({ where: { id }, data: { hiddenByAdmin: hide } });
      await writeAudit(tx, {
        actorId: actor.id,
        action: hide ? "product.hide" : "product.show",
        entityType: "Product",
        entityId: id,
        meta: { targetName: `${product.name} (${product.seller.storeName})` },
      });
      return hide ? "produk-disembunyikan" : "produk-ditampilkan";
    });
  } catch (error) {
    console.error("Gagal memoderasi produk", error);
    code = "gagal";
  }

  back(formData, fallback, code);
}

export async function hapusProdukAdminAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/moderasi";
  const id = str(formData, "id");
  if (!canModerateProduct(actor) || !id) back(formData, fallback, "gagal");

  let code: FlashCode;
  let imageToDelete: string | null = null;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const product = await tx.product.findUnique({
        where: { id },
        select: { id: true, name: true, imageUrl: true, seller: { select: { storeName: true } } },
      });
      if (!product) return "tidak-ditemukan";
      imageToDelete = product.imageUrl;

      // Favorit, ulasan, dan klik produk ikut terhapus (cascade).
      await tx.product.delete({ where: { id } });
      await writeAudit(tx, {
        actorId: actor.id,
        action: "product.delete",
        entityType: "Product",
        entityId: id,
        meta: { targetName: `${product.name} (${product.seller.storeName})` },
      });
      return "produk-dihapus";
    });
  } catch (error) {
    console.error("Gagal menghapus produk", error);
    code = "gagal";
  }

  if (code === "produk-dihapus") await deleteBlobs([imageToDelete]);
  back(formData, fallback, code);
}

export async function ubahTampilUlasanAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/moderasi?bagian=ulasan";
  const id = str(formData, "id");
  if (!canModerateReview(actor) || !id) back(formData, fallback, "gagal");

  const hide = str(formData, "tampil") === "0";

  let code: FlashCode;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const review = await tx.review.findUnique({
        where: { id },
        select: { id: true, user: { select: { name: true } }, product: { select: { name: true } } },
      });
      if (!review) return "tidak-ditemukan";

      await tx.review.update({ where: { id }, data: { hidden: hide } });
      await writeAudit(tx, {
        actorId: actor.id,
        action: hide ? "review.hide" : "review.show",
        entityType: "Review",
        entityId: id,
        meta: { targetName: `Ulasan ${review.user.name} untuk ${review.product.name}` },
      });
      return hide ? "ulasan-disembunyikan" : "ulasan-ditampilkan";
    });
  } catch (error) {
    console.error("Gagal memoderasi ulasan", error);
    code = "gagal";
  }

  back(formData, fallback, code);
}

export async function hapusUlasanAction(formData: FormData): Promise<void> {
  const actor = await gate();
  const fallback = "/admin/moderasi?bagian=ulasan";
  const id = str(formData, "id");
  if (!canModerateReview(actor) || !id) back(formData, fallback, "gagal");

  let code: FlashCode;
  try {
    code = await prisma.$transaction(async (tx): Promise<FlashCode> => {
      const review = await tx.review.findUnique({
        where: { id },
        select: { id: true, user: { select: { name: true } }, product: { select: { name: true } } },
      });
      if (!review) return "tidak-ditemukan";

      await tx.review.delete({ where: { id } });
      await writeAudit(tx, {
        actorId: actor.id,
        action: "review.delete",
        entityType: "Review",
        entityId: id,
        meta: { targetName: `Ulasan ${review.user.name} untuk ${review.product.name}` },
      });
      return "ulasan-dihapus";
    });
  } catch (error) {
    console.error("Gagal menghapus ulasan", error);
    code = "gagal";
  }

  back(formData, fallback, code);
}
