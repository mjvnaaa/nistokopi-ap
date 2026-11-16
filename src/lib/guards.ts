import { redirect } from "next/navigation";
import { getActor } from "@/lib/actor";
import { canAccessAdminArea, canAccessSellerArea } from "@/lib/authz";
import { prisma } from "@/lib/db";

/**
 * Gerbang area seller untuk setiap halaman (bukan hanya proxy). Tamu atau sesi habis ke Masuk,
 * peran lain ke halaman "tidak berhak". Mengembalikan pelaku dan profil toko lengkap.
 */
export async function requireSeller(returnTo = "/seller") {
  const actor = await getActor();

  if (!actor) redirect(`/masuk?lanjut=${encodeURIComponent(returnTo)}&pesan=sesi`);
  if (!canAccessSellerArea(actor)) redirect("/akses-ditolak?untuk=penjual");

  const profile = await prisma.sellerProfile.findUnique({ where: { userId: actor.id } });
  if (!profile) redirect("/akses-ditolak?untuk=penjual");

  return { actor, profile };
}

/**
 * Gerbang area admin untuk setiap halaman (bukan hanya proxy). Tamu atau sesi habis ke Masuk,
 * peran lain atau akun tidak aktif ke halaman "tidak berhak". Peran dibaca dari database (getActor).
 */
export async function requireAdmin(returnTo = "/admin") {
  const actor = await getActor();

  if (!actor) redirect(`/masuk?lanjut=${encodeURIComponent(returnTo)}&pesan=sesi`);
  if (!canAccessAdminArea(actor)) redirect("/akses-ditolak?untuk=admin");

  return actor;
}
