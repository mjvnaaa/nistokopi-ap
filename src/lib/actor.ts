import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Actor } from "@/lib/authz";

export interface CurrentUser extends Actor {
  name: string;
  email: string;
}

/**
 * Pelaku saat ini. Sesi hanya dipakai untuk mengetahui SIAPA penggunanya; peran, status akun,
 * dan status toko selalu dibaca dari database pada setiap permintaan (T-V2-12).
 * Akun SUSPENDED atau yang sudah dihapus dianggap tamu (null).
 */
export const getActor = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      sellerProfile: { select: { id: true, approvalStatus: true } },
    },
  });

  if (!user || user.status !== "ACTIVE") return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    sellerProfileId: user.sellerProfile?.id ?? null,
    sellerApproval: user.sellerProfile?.approvalStatus ?? null,
  };
});
