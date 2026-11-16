import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/ProductForm";
import { requireSeller } from "@/lib/guards";
import { listCategories } from "@/lib/seller-queries";
import { sellerMode } from "@/lib/seller-status";

export const metadata = { title: "Tambah produk" };

export default function NewProductPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const { profile } = await requireSeller("/seller/produk/baru");
  if (sellerMode(profile.approvalStatus) !== "full") redirect("/seller");

  const categories = await listCategories();

  return (
    <>
      <p className="crumbs">
        <Link href="/seller">Dashboard toko</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Tambah produk</span>
      </p>
      <section className="panel" aria-labelledby="judul-baru">
        <h1 className="panel-title" id="judul-baru" tabIndex={-1}>
          Tambah produk
        </h1>
        <ProductForm categories={categories} />
      </section>
    </>
  );
}
