import { prisma } from "@/lib/db";

export interface SellerProductRow {
  id: string;
  name: string;
  price: number;
  stock: number;
  featured: boolean;
  isActive: boolean;
  hiddenByAdmin: boolean;
  categoryName: string;
  clicks7: number;
  clicks30: number;
}

export interface SellerOverview {
  productCount: number;
  totalStock: number;
  clicks7: number;
  clicks30: number;
  reviewCount: number;
  products: SellerProductRow[];
}

const DAY = 24 * 60 * 60 * 1000;

/** Statistik dan daftar produk satu toko (SLR-04). Hanya dipanggil setelah requireSeller(). */
export async function getSellerOverview(sellerId: string): Promise<SellerOverview> {
  const since7 = new Date(Date.now() - 7 * DAY);
  const since30 = new Date(Date.now() - 30 * DAY);

  const [products, c7, c30, reviewCount] = await Promise.all([
    prisma.product.findMany({
      where: { sellerId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        featured: true,
        isActive: true,
        hiddenByAdmin: true,
        category: { select: { name: true } },
      },
    }),
    prisma.orderClick.groupBy({
      by: ["productId"],
      where: { product: { sellerId }, createdAt: { gte: since7 } },
      _count: { _all: true },
    }),
    prisma.orderClick.groupBy({
      by: ["productId"],
      where: { product: { sellerId }, createdAt: { gte: since30 } },
      _count: { _all: true },
    }),
    prisma.review.count({ where: { product: { sellerId }, hidden: false } }),
  ]);

  const map7 = new Map(c7.map((row) => [row.productId, row._count._all]));
  const map30 = new Map(c30.map((row) => [row.productId, row._count._all]));

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    featured: p.featured,
    isActive: p.isActive,
    hiddenByAdmin: p.hiddenByAdmin,
    categoryName: p.category.name,
    clicks7: map7.get(p.id) ?? 0,
    clicks30: map30.get(p.id) ?? 0,
  }));

  return {
    productCount: rows.length,
    totalStock: rows.reduce((sum, p) => sum + p.stock, 0),
    clicks7: rows.reduce((sum, p) => sum + p.clicks7, 0),
    clicks30: rows.reduce((sum, p) => sum + p.clicks30, 0),
    reviewCount,
    products: rows,
  };
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });
}
