"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/auth-validation";
import { prisma } from "@/lib/db";
import { str, valuesFrom, type FormState } from "@/lib/form";
import { homeFor, safeNext } from "@/lib/redirect";
import { slugify, uniqueSlug } from "@/lib/text";

const LOGIN_ERROR = "Email atau kata sandi salah.";

export async function masukAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = valuesFrom(formData, ["email"]);
  const parsed = loginSchema.safeParse({ email: str(formData, "email"), password: str(formData, "password") });
  if (!parsed.success) return { error: "Isi email dan kata sandi dengan benar.", values };

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email }, select: { role: true, status: true } });

  // Pesan sama untuk email tidak terdaftar, kata sandi salah, dan akun dinonaktifkan (AKN-03).
  if (user?.status === "SUSPENDED") return { error: LOGIN_ERROR, values };

  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch {
    return { error: LOGIN_ERROR, values };
  }

  // redirect() melempar pengecualian khusus, jadi harus di luar try/catch.
  redirect(safeNext(str(formData, "lanjut")) || homeFor(user?.role ?? "BUYER"));
}

export async function daftarAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = valuesFrom(formData, ["peran", "name", "email", "storeName", "city", "whatsapp", "description"]);
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, error: "Periksa isian yang bertanda.", values };
  }

  const data = parsed.data;

  try {
    // Peran tidak dikirim: pengguna baru selalu BUYER sampai server menaikkannya di bawah.
    await auth.api.signUpEmail({
      body: { name: data.name, email: data.email, password: data.password },
      headers: await headers(),
    });
  } catch {
    return { error: "Pendaftaran gagal. Periksa isian, atau gunakan email lain.", values };
  }

  if (data.peran === "SELLER") {
    const user = await prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
    if (!user) return { error: "Pendaftaran gagal. Coba lagi.", values };

    try {
      await prisma.$transaction(async (tx) => {
        const slug = await uniqueSlug(
          slugify(data.storeName),
          async (candidate) => !!(await tx.sellerProfile.findUnique({ where: { slug: candidate }, select: { id: true } })),
        );

        await tx.user.update({ where: { id: user.id }, data: { role: "SELLER" } });
        await tx.sellerProfile.create({
          data: {
            userId: user.id,
            storeName: data.storeName,
            slug,
            description: data.description || null,
            city: data.city || null,
            whatsapp: data.whatsapp,
            approvalStatus: "PENDING",
          },
        });
      });
    } catch (error) {
      console.error("Gagal membuat profil toko saat daftar", error);
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
      return { error: "Pendaftaran toko gagal. Coba lagi.", values };
    }
  }

  redirect(data.peran === "SELLER" ? "/seller" : "/");
}

export async function keluarAction() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {
    // Sesi sudah tidak ada: tujuannya tetap tercapai.
  }

  redirect("/");
}
