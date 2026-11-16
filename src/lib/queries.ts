import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import type { CatalogFilters } from "@/lib/catalog";

/** Hanya produk yang terlihat publik (KAT-03): aktif, tidak disembunyikan admin, toko disetujui, akun aktif. */
export const publicProductWhere: Prisma.ProductWhereInput = {
  isActive: true,
  hiddenByAdmin: false,
  seller: {
    approvalStatus: "APPROVED",
    user: { status: "ACTIVE" },
  },
};

export interface CatalogProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  featured: boolean;
  imageUrl: string | null;
  category: { name: string; slug: string };
  store: { name: string; slug: string; whatsapp: string; city: string | null };
  ratingAvg: number | null;
  reviewCount: number;
}

export interface CategoryCount {
  name: string;
  slug: string;
  count: number;
}

export interface StoreOption {
  name: string;
  slug: string;
}

export interface StoreProfile {
  name: string;
  slug: string;
  description: string | null;
  city: string | null;
  whatsapp: string;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  userName: string;
}

export interface ProductDetail extends CatalogProduct {
  reviews: ProductReview[];
}

function catalogConditions(filters: Pick<CatalogFilters, "q" | "kategori" | "toko" | "tersedia">): Prisma.ProductWhereInput[] {
  const conditions: Prisma.ProductWhereInput[] = [];

  if (filters.q) {
    conditions.push({
      OR: [
        { name: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  if (filters.kategori) conditions.push({ category: { slug: filters.kategori } });
  if (filters.toko) conditions.push({ seller: { slug: filters.toko } });
  if (filters.tersedia) conditions.push({ stock: { gt: 0 } });

  return conditions;
}

function publicWhereFor(
  filters: Pick<CatalogFilters, "q" | "kategori" | "toko" | "tersedia">,
  storeSlug?: string,
): Prisma.ProductWhereInput {
  const conditions = catalogConditions({ ...filters, toko: storeSlug ?? filters.toko });

  return { AND: [publicProductWhere, ...conditions] };
}

/**
 * Ambil semua produk yang cocok (tanpa paginasi) lalu hitung rating.
 * Jumlah katalog prototype masih kecil; pengurutan rating butuh agregat yang tidak
 * bisa dipakai langsung sebagai `orderBy` Prisma.
 */
export async function listCatalogProducts(filters: CatalogFilters, storeSlug?: string): Promise<CatalogProduct[]> {
  const rows = await prisma.product.findMany({
    where: publicWhereFor(filters, storeSlug),
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      featured: true,
      imageUrl: true,
      category: { select: { name: true, slug: true } },
      seller: { select: { storeName: true, slug: true, whatsapp: true, city: true } },
    },
  });

  if (rows.length === 0) return [];

  const ratings = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: rows.map((row) => row.id) }, hidden: false },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const summary = new Map(ratings.map((item) => [item.productId, item]));

  return rows.map((row) => {
    const rating = summary.get(row.id);

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      stock: row.stock,
      featured: row.featured,
      imageUrl: row.imageUrl,
      category: row.category,
      store: {
        name: row.seller.storeName,
        slug: row.seller.slug,
        whatsapp: row.seller.whatsapp,
        city: row.seller.city,
      },
      ratingAvg: rating?._avg.rating ?? null,
      reviewCount: rating?._count._all ?? 0,
    };
  });
}

/** Jumlah produk terlihat publik untuk filter tertentu, dipakai pill "Semua". */
export async function countPublicProducts(filters: CatalogFilters, storeSlug?: string): Promise<number> {
  return prisma.product.count({ where: publicWhereFor(filters, storeSlug) });
}

/** Jumlah produk terlihat per kategori, untuk badge pada pill kategori. */
export async function listCategoryCounts(storeSlug?: string): Promise<CategoryCount[]> {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      name: true,
      slug: true,
      _count: {
        select: {
          products: {
            where: publicProductWhere,
          },
        },
      },
    },
  });

  if (!storeSlug) {
    return categories.map((category) => ({
      name: category.name,
      slug: category.slug,
      count: category._count.products,
    }));
  }

  const inStore = await Promise.all(
    categories.map((category) =>
      prisma.product.count({
        where: {
          AND: [publicProductWhere, { category: { slug: category.slug } }, { seller: { slug: storeSlug } }],
        },
      }),
    ),
  );

  return categories.map((category, index) => ({
    name: category.name,
    slug: category.slug,
    count: inStore[index] ?? 0,
  }));
}

/** Toko yang bisa difilter di katalog: sudah disetujui dan akunnya aktif. */
export async function listStoreOptions(): Promise<StoreOption[]> {
  const stores = await prisma.sellerProfile.findMany({
    where: { approvalStatus: "APPROVED", user: { status: "ACTIVE" } },
    orderBy: { storeName: "asc" },
    select: { storeName: true, slug: true },
  });

  return stores.map((store) => ({ name: store.storeName, slug: store.slug }));
}

/** Profil toko yang boleh tampil publik. */
export async function getPublicStore(slug: string): Promise<StoreProfile | null> {
  const store = await prisma.sellerProfile.findFirst({
    where: { slug, approvalStatus: "APPROVED", user: { status: "ACTIVE" } },
    select: { storeName: true, slug: true, description: true, city: true, whatsapp: true },
  });

  if (!store) return null;

  return {
    name: store.storeName,
    slug: store.slug,
    description: store.description,
    city: store.city,
    whatsapp: store.whatsapp,
  };
}

/** Detail produk publik beserta ulasan yang tidak disembunyikan. */
export async function getPublicProduct(id: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: { AND: [publicProductWhere, { id }] },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      stock: true,
      featured: true,
      imageUrl: true,
      category: { select: { name: true, slug: true } },
      seller: { select: { storeName: true, slug: true, whatsapp: true, city: true } },
      reviews: {
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!product) return null;

  const reviewCount = product.reviews.length;
  const ratingAvg =
    reviewCount === 0 ? null : product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    featured: product.featured,
    imageUrl: product.imageUrl,
    category: product.category,
    store: {
      name: product.seller.storeName,
      slug: product.seller.slug,
      whatsapp: product.seller.whatsapp,
      city: product.seller.city,
    },
    ratingAvg,
    reviewCount,
    reviews: product.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      userName: review.user.name,
    })),
  };
}

export interface ClickTarget {
  name: string;
  price: number;
  whatsapp: string;
}

/** Data minimal untuk mencatat klik WhatsApp dan menyusun tautan pesan. */
export async function getClickTarget(id: string): Promise<ClickTarget | null> {
  const product = await prisma.product.findFirst({
    where: { AND: [publicProductWhere, { id }] },
    select: { name: true, price: true, seller: { select: { whatsapp: true } } },
  });

  if (!product) return null;

  return { name: product.name, price: product.price, whatsapp: product.seller.whatsapp };
}

/** Catat satu klik "Pesan lewat WhatsApp". Kegagalan dicatat oleh pemanggil, bukan penghalang. */
export async function recordOrderClick(productId: string): Promise<void> {
  await prisma.orderClick.create({ data: { productId } });
}
