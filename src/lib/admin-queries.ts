import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { ApprovalStatus, Role } from "@/lib/authz";
import { ADMIN_PAGE_SIZE, LOG_PAGE_SIZE } from "@/lib/admin-rules";
import { publicProductWhere } from "@/lib/queries";

/** Query khusus area admin. Hanya dipanggil setelah requireAdmin() di halaman. */

const DAY = 24 * 60 * 60 * 1000;

export interface PlatformOverview {
  usersByRole: Record<Role, number>;
  totalUsers: number;
  pendingSellers: number;
  totalProducts: number;
  publicProducts: number;
  hiddenProducts: number;
  clicks7: number;
  clicks30: number;
}

/** Ringkasan platform (ADM-05). */
export async function getPlatformOverview(): Promise<PlatformOverview> {
  const since7 = new Date(Date.now() - 7 * DAY);
  const since30 = new Date(Date.now() - 30 * DAY);

  const [roles, pendingSellers, totalProducts, publicProducts, hiddenProducts, clicks7, clicks30] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.sellerProfile.count({ where: { approvalStatus: "PENDING" } }),
    prisma.product.count(),
    prisma.product.count({ where: publicProductWhere }),
    prisma.product.count({ where: { hiddenByAdmin: true } }),
    prisma.orderClick.count({ where: { createdAt: { gte: since7 } } }),
    prisma.orderClick.count({ where: { createdAt: { gte: since30 } } }),
  ]);

  const usersByRole: Record<Role, number> = { ADMIN: 0, SELLER: 0, BUYER: 0 };
  for (const row of roles) usersByRole[row.role] = row._count._all;

  return {
    usersByRole,
    totalUsers: usersByRole.ADMIN + usersByRole.SELLER + usersByRole.BUYER,
    pendingSellers,
    totalProducts,
    publicProducts,
    hiddenProducts,
    clicks7,
    clicks30,
  };
}

/* ---------- Antrean seller ---------- */

export type SellerFilter = ApprovalStatus | "ALL";
export const SELLER_FILTERS: readonly SellerFilter[] = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED", "ALL"];

export function parseSellerFilter(value: string | string[] | undefined): SellerFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  return (SELLER_FILTERS as readonly string[]).includes(raw ?? "") ? (raw as SellerFilter) : "PENDING";
}

export interface SellerApplication {
  id: string;
  storeName: string;
  slug: string;
  city: string | null;
  whatsapp: string;
  description: string | null;
  approvalStatus: ApprovalStatus;
  reviewNote: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  ownerName: string;
  ownerEmail: string;
  productCount: number;
}

export async function listSellerApplications(filter: SellerFilter, page: number) {
  const where: Prisma.SellerProfileWhereInput = filter === "ALL" ? {} : { approvalStatus: filter };

  const [total, rows, grouped] = await Promise.all([
    prisma.sellerProfile.count({ where }),
    prisma.sellerProfile.findMany({
      where,
      // Antrean menunggu: yang paling lama mendaftar lebih dulu. Daftar lain: terbaru dulu.
      orderBy: { createdAt: filter === "PENDING" ? "asc" : "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        storeName: true,
        slug: true,
        city: true,
        whatsapp: true,
        description: true,
        approvalStatus: true,
        reviewNote: true,
        reviewedAt: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        _count: { select: { products: true } },
      },
    }),
    prisma.sellerProfile.groupBy({ by: ["approvalStatus"], _count: { _all: true } }),
  ]);

  const counts: Record<SellerFilter, number> = { PENDING: 0, APPROVED: 0, REJECTED: 0, SUSPENDED: 0, ALL: 0 };
  for (const row of grouped) {
    counts[row.approvalStatus] = row._count._all;
    counts.ALL += row._count._all;
  }

  const items: SellerApplication[] = rows.map((row) => ({
    id: row.id,
    storeName: row.storeName,
    slug: row.slug,
    city: row.city,
    whatsapp: row.whatsapp,
    description: row.description,
    approvalStatus: row.approvalStatus,
    reviewNote: row.reviewNote,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
    ownerName: row.user.name,
    ownerEmail: row.user.email,
    productCount: row._count.products,
  }));

  return { items, total, counts };
}

/* ---------- Pengguna ---------- */

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: Date;
  store: { name: string; approvalStatus: ApprovalStatus } | null;
}

export async function listUsers(params: { q: string; role: Role | ""; page: number }) {
  const where: Prisma.UserWhereInput = {
    ...(params.role ? { role: params.role } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { email: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, rows, activeAdminCount] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      skip: (params.page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        sellerProfile: { select: { storeName: true, approvalStatus: true } },
      },
    }),
    prisma.user.count({ where: { role: "ADMIN", status: "ACTIVE" } }),
  ]);

  const items: UserRow[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt,
    store: row.sellerProfile ? { name: row.sellerProfile.storeName, approvalStatus: row.sellerProfile.approvalStatus } : null,
  }));

  return { items, total, activeAdminCount };
}

/* ---------- Kategori ---------- */

export async function listAdminCategories() {
  const rows = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
  });

  return rows.map((row) => ({ id: row.id, name: row.name, slug: row.slug, productCount: row._count.products }));
}

/* ---------- Moderasi ---------- */

export type ModerationFilter = "semua" | "disembunyikan";

export const parseModerationFilter = (value: string | string[] | undefined): ModerationFilter =>
  (Array.isArray(value) ? value[0] : value) === "disembunyikan" ? "disembunyikan" : "semua";

export interface ModerationProduct {
  id: string;
  name: string;
  storeName: string;
  categoryName: string;
  isActive: boolean;
  hiddenByAdmin: boolean;
  storeApproved: boolean;
  createdAt: Date;
}

export async function listProductsForModeration(params: { q: string; filter: ModerationFilter; page: number }) {
  const where: Prisma.ProductWhereInput = {
    ...(params.filter === "disembunyikan" ? { hiddenByAdmin: true } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { seller: { storeName: { contains: params.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: [{ hiddenByAdmin: "desc" }, { createdAt: "desc" }],
      skip: (params.page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        isActive: true,
        hiddenByAdmin: true,
        createdAt: true,
        category: { select: { name: true } },
        seller: { select: { storeName: true, approvalStatus: true, user: { select: { status: true } } } },
      },
    }),
  ]);

  const items: ModerationProduct[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    storeName: row.seller.storeName,
    categoryName: row.category.name,
    isActive: row.isActive,
    hiddenByAdmin: row.hiddenByAdmin,
    storeApproved: row.seller.approvalStatus === "APPROVED" && row.seller.user.status === "ACTIVE",
    createdAt: row.createdAt,
  }));

  return { items, total };
}

export interface ModerationReview {
  id: string;
  rating: number;
  comment: string | null;
  hidden: boolean;
  createdAt: Date;
  userName: string;
  productName: string;
  storeName: string;
}

export async function listReviewsForModeration(params: { filter: ModerationFilter; page: number }) {
  const where: Prisma.ReviewWhereInput = params.filter === "disembunyikan" ? { hidden: true } : {};

  const [total, rows] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      orderBy: [{ hidden: "desc" }, { createdAt: "desc" }],
      skip: (params.page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        rating: true,
        comment: true,
        hidden: true,
        createdAt: true,
        user: { select: { name: true } },
        product: { select: { name: true, seller: { select: { storeName: true } } } },
      },
    }),
  ]);

  const items: ModerationReview[] = rows.map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    hidden: row.hidden,
    createdAt: row.createdAt,
    userName: row.user.name,
    productName: row.product.name,
    storeName: row.product.seller.storeName,
  }));

  return { items, total };
}

/* ---------- Audit log ---------- */

export interface AuditRow {
  id: string;
  createdAt: Date;
  actorName: string | null;
  action: string;
  entityType: string;
  meta: unknown;
}

export async function listAuditLog(page: number) {
  const [total, rows] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * LOG_PAGE_SIZE,
      take: LOG_PAGE_SIZE,
      select: {
        id: true,
        createdAt: true,
        action: true,
        entityType: true,
        meta: true,
        actor: { select: { name: true } },
      },
    }),
  ]);

  const items: AuditRow[] = rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    actorName: row.actor?.name ?? null,
    action: row.action,
    entityType: row.entityType,
    meta: row.meta,
  }));

  return { items, total };
}
