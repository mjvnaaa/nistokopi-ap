"use server";

import { redirect } from "next/navigation";
import { getActor } from "@/lib/actor";
import { canAccessSellerArea, canCreateProduct, canDeleteProduct, canEditProduct } from "@/lib/authz";
import { deleteBlobs, readImageUpload, uploadProductImage } from "@/lib/blob";
import { prisma } from "@/lib/db";
import { str, valuesFrom, type FormState } from "@/lib/form";
import { nameKey } from "@/lib/text";
import { productInputSchema, sellerProfileSchema } from "@/lib/validation";
import { z } from "zod";

const SESSION_ERROR = "Sesi berakhir. Masuk lagi untuk melanjutkan.";
const NOT_FOUND = "Produk tidak ditemukan.";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: string }).code === "P2002";
}

/** Angka dari formulir. Kosong atau bukan angka menjadi -1 agar memicu pesan galat rentang dari skema. */
function num(formData: FormData, key: string): number {
  const raw = str(formData, key).trim();
  const n = raw === "" ? Number.NaN : Number(raw);
  return Number.isFinite(n) ? n : -1;
}

/** Tambah (tanpa id) atau ubah (dengan id) produk MILIK SENDIRI. Otorisasi dicek di server. */
export async function simpanProdukAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values: Record<string, string> = {
    ...valuesFrom(formData, ["id", "name", "categoryId", "description", "price", "stock"]),
    featured: formData.get("featured") ? "1" : "",
    isActive: formData.get("isActive") ? "1" : "",
  };

  const actor = await getActor();
  if (!actor || !canAccessSellerArea(actor)) return { error: SESSION_ERROR, values };

  const id = values.id;
  const sellerId = actor.sellerProfileId;
  if (!sellerId) return { error: SESSION_ERROR, values };

  let oldImageUrl: string | null = null;
  if (id) {
    const existing = await prisma.product.findUnique({ where: { id }, select: { sellerId: true, imageUrl: true } });
    // Pesan sama untuk "tidak ada" dan "milik toko lain" agar tidak membocorkan keberadaan produk.
    if (!existing || !canEditProduct(actor, existing)) return { error: NOT_FOUND, values };
    oldImageUrl = existing.imageUrl;
  } else if (!canCreateProduct(actor)) {
    return { error: "Toko Anda belum dapat menambah produk.", values };
  }

  const parsed = productInputSchema.safeParse({
    name: values.name,
    categoryId: values.categoryId,
    description: values.description,
    price: num(formData, "price"),
    stock: num(formData, "stock"),
    featured: values.featured === "1",
    isActive: values.isActive === "1",
  });

  // Foto (opsional): ukuran dan isi berkas dicek di server, bukan hanya di peramban.
  const file = formData.get("foto");
  const photo = file instanceof File && file.size > 0 ? await readImageUpload(file) : null;
  const photoError = photo && !photo.ok ? photo.error : null;

  if (!parsed.success || photoError) {
    const fieldErrors = parsed.success ? {} : z.flattenError(parsed.error).fieldErrors;
    return {
      fieldErrors: { ...fieldErrors, ...(photoError ? { foto: [photoError] } : {}) },
      error: "Periksa isian yang bertanda.",
      values,
    };
  }

  const input = parsed.data;

  const category = await prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } });
  if (!category) return { fieldErrors: { categoryId: ["Pilih kategori."] }, error: "Periksa isian yang bertanda.", values };

  const key = nameKey(input.name);
  const duplicate = await prisma.product.findFirst({
    where: { sellerId, nameKey: key, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (duplicate) {
    return { fieldErrors: { name: ["Nama produk sudah ada di toko Anda. Gunakan nama yang berbeda."] }, error: "Periksa isian yang bertanda.", values };
  }

  // Unggah paling akhir, setelah semua pemeriksaan lolos, agar tidak ada foto yatim bila formulir ditolak.
  let newImageUrl: string | null = null;
  if (photo?.ok) {
    const uploaded = await uploadProductImage(sellerId, photo);
    if ("error" in uploaded) {
      return { fieldErrors: { foto: [uploaded.error] }, error: "Periksa isian yang bertanda.", values };
    }
    newImageUrl = uploaded.url;
  }
  const removePhoto = Boolean(id) && formData.get("hapusFoto") !== null;

  const data = {
    ...(newImageUrl ? { imageUrl: newImageUrl } : removePhoto ? { imageUrl: null } : {}),
    name: input.name,
    nameKey: key,
    categoryId: input.categoryId,
    description: input.description,
    price: input.price,
    stock: input.stock,
    featured: input.featured,
    isActive: input.isActive,
  };

  try {
    if (id) {
      await prisma.product.update({ where: { id, sellerId }, data });
    } else {
      await prisma.product.create({ data: { ...data, sellerId } });
    }
  } catch (error) {
    await deleteBlobs([newImageUrl]); // simpan gagal: jangan tinggalkan foto baru tanpa pemilik
    if (isUniqueViolation(error)) {
      return { fieldErrors: { name: ["Nama produk sudah ada di toko Anda. Gunakan nama yang berbeda."] }, error: "Periksa isian yang bertanda.", values };
    }
    console.error("Gagal menyimpan produk", error);
    return { error: "Produk belum tersimpan. Coba lagi.", values };
  }

  // Simpan berhasil: foto lama (diganti atau dihapus) tidak dipakai lagi.
  if (id && (newImageUrl || removePhoto)) await deleteBlobs([oldImageUrl]);

  redirect("/seller?info=disimpan");
}

export async function hapusProdukAction(formData: FormData): Promise<void> {
  const actor = await getActor();
  const id = str(formData, "id");
  if (!actor || !actor.sellerProfileId || !id) redirect("/seller?info=gagal");

  const existing = await prisma.product.findUnique({ where: { id }, select: { sellerId: true, imageUrl: true } });
  if (!existing || !canDeleteProduct(actor, existing)) redirect("/seller?info=gagal");

  const removed = await prisma.product.deleteMany({ where: { id, sellerId: existing.sellerId } });
  if (removed.count > 0) await deleteBlobs([existing.imageUrl]);
  redirect("/seller?info=dihapus");
}

/** Aktifkan atau nonaktifkan produk tanpa menghapusnya (SLR-02). */
export async function ubahAktifAction(formData: FormData): Promise<void> {
  const actor = await getActor();
  const id = str(formData, "id");
  if (!actor || !actor.sellerProfileId || !id) redirect("/seller?info=gagal");

  const existing = await prisma.product.findUnique({ where: { id }, select: { sellerId: true } });
  if (!existing || !canEditProduct(actor, existing)) redirect("/seller?info=gagal");

  await prisma.product.updateMany({
    where: { id, sellerId: existing.sellerId },
    data: { isActive: str(formData, "aktif") === "1" },
  });
  redirect("/seller?info=diubah");
}

/** Ubah profil toko sendiri. Boleh saat PENDING, REJECTED, APPROVED. Tidak saat SUSPENDED (SLR-05). */
export async function simpanProfilAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = valuesFrom(formData, ["storeName", "description", "city", "whatsapp"]);

  const actor = await getActor();
  if (!actor || !canAccessSellerArea(actor) || !actor.sellerProfileId) return { error: SESSION_ERROR, values };
  if (actor.sellerApproval === "SUSPENDED") {
    return { error: "Toko Anda ditangguhkan, jadi profil belum dapat diubah.", values };
  }

  const parsed = sellerProfileSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, error: "Periksa isian yang bertanda.", values };
  }

  try {
    // Slug sengaja tidak berubah agar tautan toko yang sudah dibagikan tetap berlaku.
    await prisma.sellerProfile.update({
      where: { id: actor.sellerProfileId },
      data: {
        storeName: parsed.data.storeName,
        description: parsed.data.description || null,
        city: parsed.data.city || null,
        whatsapp: parsed.data.whatsapp,
      },
    });
  } catch (error) {
    console.error("Gagal menyimpan profil toko", error);
    return { error: "Profil belum tersimpan. Coba lagi.", values };
  }

  return { ok: true, values: { ...values, whatsapp: parsed.data.whatsapp } };
}
