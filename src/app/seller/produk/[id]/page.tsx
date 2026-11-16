import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { canEditProduct } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { requireSeller } from "@/lib/guards";
import { listCategories } from "@/lib/seller-queries";
import { sellerMode } from "@/lib/seller-status";

export const metadata = { title: "Ubah produk" };

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { actor, profile } = await requireSeller(`/seller/produk/${id}`);
  if (sellerMode(profile.approvalStatus) !== "full") redirect("/seller");

  const product = await prisma.product.findUnique({ where: { id } });
  // 404 yang sama untuk "tidak ada" dan "milik toko lain".
  if (!product || !canEditProduct(actor, product)) notFound();

  const categories = await listCategories();

  return (
    <>
      <p className="crumbs">
        <Link href="/seller">Dashboard toko</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Ubah produk</span>
      </p>
      <section className="panel" aria-labelledby="judul-ubah">
        <h1 className="panel-title" id="judul-ubah" tabIndex={-1}>
          Ubah produk
        </h1>
        <ProductForm
          categories={categories}
          product={{
            id: product.id,
            name: product.name,
            categoryId: product.categoryId,
            description: product.description,
            price: product.price,
            stock: product.stock,
            featured: product.featured,
            isActive: product.isActive,
          }}
        />
      </section>
    </>
  );
}
