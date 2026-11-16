"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { simpanProdukAction } from "@/app/seller/actions";
import { Field, fieldProps } from "@/components/Field";
import type { FormState } from "@/lib/form";
import { IMAGE_ACCEPT, IMAGE_HINT, MAX_IMAGE_BYTES } from "@/lib/image";
import "./photo-field.css";

export interface ProductDefaults {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  price: number;
  stock: number;
  featured: boolean;
  isActive: boolean;
  imageUrl?: string | null;
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

  // Pratinjau foto pilihan. Pemeriksaan di peramban hanya kemudahan; server tetap memeriksa isi dan ukuran.
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function onPickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(null);
    setFileError(null);
    if (!file) return;

    if (!(IMAGE_ACCEPT.split(",") as string[]).includes(file.type)) {
      setFileError("Berkas bukan foto JPG, PNG, atau WebP. Pilih foto dengan jenis tersebut.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setFileError("Foto lebih dari 2 MB. Perkecil ukurannya, lalu pilih lagi.");
      event.target.value = "";
      return;
    }

    setRemovePhoto(false);
    setPreview(URL.createObjectURL(file));
  }

  const hasNewFile = preview !== null;
  const currentUrl = product?.imageUrl && !removePhoto ? product.imageUrl : null;
  const shown = preview ?? currentUrl;

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

      <div className="full">
        <Field id="foto" label="Foto produk (opsional)" error={fileError ?? fe("foto")} hint={IMAGE_HINT}>
          <div className="photo">
            <div className="photo-preview">
              {shown ? (
                // eslint-disable-next-line @next/next/no-img-element -- pratinjau berkas lokal (blob:) dan URL Blob, tidak cocok untuk next/image.
                <img src={shown} alt={hasNewFile ? "Pratinjau foto yang dipilih" : "Foto produk saat ini"} />
              ) : (
                <span>Belum ada foto</span>
              )}
            </div>
            <div className="photo-controls">
              <input {...fieldProps("foto", fileError ?? fe("foto"))} ref={fileRef} type="file" accept={IMAGE_ACCEPT} onChange={onPickFile} />
              {product?.imageUrl && !hasNewFile ? (
                <label className="chk">
                  <input type="checkbox" name="hapusFoto" checked={removePhoto} onChange={(event) => setRemovePhoto(event.target.checked)} /> Hapus foto saat ini
                </label>
              ) : null}
              <p className="photo-status" role="status">
                {pending && hasNewFile ? "Mengunggah…" : ""}
              </p>
            </div>
          </div>
        </Field>
        {state.error && !state.ok && fe("foto") ? <p className="note">Pilih ulang foto Anda setelah memperbaiki isian. Peramban tidak menyimpan pilihan berkas.</p> : null}
      </div>

      <p className="err form-err full" role="alert">
        {state.error ?? ""}
      </p>

      <div className="full row-actions">
        <button className="btn" type="submit" disabled={pending}>
          {pending ? (hasNewFile ? "Mengunggah…" : "Menyimpan…") : "Simpan produk"}
        </button>
        <Link className="btn alt" href="/seller">
          Batal
        </Link>
      </div>
    </form>
  );
}
