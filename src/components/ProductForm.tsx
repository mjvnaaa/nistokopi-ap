"use client";

import Link from "next/link";
import { useActionState } from "react";
import { simpanProdukAction } from "@/app/seller/actions";
import { Field, fieldProps } from "@/components/Field";
import type { FormState } from "@/lib/form";

export interface ProductDefaults {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  stock: number;
  featured: boolean;
  isActive: boolean;
}

const empty: FormState = {};

export function ProductForm({
  categories,
  product,
}: {
  categories: { id: string; name: string }[];
  product?: ProductDefaults;
}) {
  const [state, action, pending] = useActionState(simpanProdukAction, empty);
  const v = state.values;
  const fe = (key: string) => state.fieldErrors?.[key]?.[0];

  return (
    <form action={action} className="form" noValidate>
      <input type="hidden" name="id" value={product?.id ?? ""} />

      <Field id="name" label="Nama produk" error={fe("name")}>
        <input {...fieldProps("name", fe("name"))} type="text" maxLength={80} required defaultValue={v?.name ?? product?.name ?? ""} />
      </Field>

      <Field id="categoryId" label="Kategori" error={fe("categoryId")}>
        <select {...fieldProps("categoryId", fe("categoryId"))} required defaultValue={v?.categoryId ?? product?.categoryId ?? ""}>
          <option value="">Pilih kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <Field id="price" label="Harga (Rp)" error={fe("price")}>
        <input {...fieldProps("price", fe("price"))} type="number" inputMode="numeric" min={1} max={1000000000} step={500} required defaultValue={v?.price ?? product?.price ?? ""} />
      </Field>

      <Field id="stock" label="Stok" error={fe("stock")}>
        <input {...fieldProps("stock", fe("stock"))} type="number" inputMode="numeric" min={0} max={1000000} step={1} required defaultValue={v?.stock ?? product?.stock ?? ""} />
      </Field>

      <div className="full">
        <Field id="description" label="Deskripsi" error={fe("description")} hint="Maksimal 240 karakter. Cantumkan hanya informasi yang dapat dibuktikan.">
          <textarea {...fieldProps("description", fe("description"))} className="plain" maxLength={240} required defaultValue={v?.description ?? product?.description ?? ""} />
        </Field>
      </div>

      <div className="full checks">
        <label className="chk">
          <input type="checkbox" name="featured" defaultChecked={v ? v.featured === "1" : (product?.featured ?? false)} /> Tandai sebagai produk unggulan
        </label>
        <label className="chk">
          <input type="checkbox" name="isActive" defaultChecked={v ? v.isActive === "1" : (product?.isActive ?? true)} /> Tampil di katalog (aktif)
        </label>
      </div>

      <p className="err form-err full" role="alert">
        {state.error ?? ""}
      </p>

      <div className="full row-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan produk"}
        </button>
        <Link className="btn alt" href="/seller">
          Batal
        </Link>
      </div>
    </form>
  );
}
