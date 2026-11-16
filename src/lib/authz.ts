/**
 * Aturan otorisasi murni (tanpa database dan tanpa framework) agar mudah diuji.
 * Dipanggil di SERVER pada setiap route dan server action. Menyembunyikan menu tidak cukup.
 */
export type Role = "ADMIN" | "SELLER" | "BUYER";
export type UserStatus = "ACTIVE" | "SUSPENDED";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface Actor {
  id: string;
  role: Role;
  status: UserStatus;
  sellerProfileId?: string | null;
  sellerApproval?: ApprovalStatus | null;
}
type MaybeActor = Actor | null | undefined;

const live = (a: MaybeActor): a is Actor => !!a && a.status === "ACTIVE";

export const isAdmin = (a: MaybeActor): boolean => live(a) && a.role === "ADMIN";

export const isApprovedSeller = (a: MaybeActor): boolean =>
  live(a) && a.role === "SELLER" && a.sellerApproval === "APPROVED" && !!a.sellerProfileId;

export const canAccessAdminArea = isAdmin;
export const canAccessSellerArea = (a: MaybeActor): boolean => live(a) && a.role === "SELLER";
export const canCreateProduct = isApprovedSeller;

/** Seller hanya boleh mengubah, menghapus, dan menonaktifkan produk MILIKNYA. */
export const canEditProduct = (a: MaybeActor, product: { sellerId: string }): boolean =>
  isApprovedSeller(a) && (a as Actor).sellerProfileId === product.sellerId;
export const canDeleteProduct = canEditProduct;

export const canModerateProduct = isAdmin;
export const canModerateReview = isAdmin;
export const canDecideSeller = isAdmin;
export const canManageCategories = isAdmin;
export const canReadAuditLog = isAdmin;

export const canFavorite = (a: MaybeActor): boolean => live(a) && a.role === "BUYER";
export const canReview = (a: MaybeActor): boolean => live(a) && a.role === "BUYER";

/** Admin terakhir yang aktif tidak boleh diturunkan perannya. */
export function canChangeUserRole(
  actor: MaybeActor,
  target: { id: string; role: Role },
  newRole: Role,
  activeAdminCount: number,
): boolean {
  if (!isAdmin(actor)) return false;
  if (target.role === "ADMIN" && newRole !== "ADMIN" && activeAdminCount <= 1) return false;
  return true;
}

/** Admin terakhir yang aktif tidak boleh ditangguhkan. */
export function canSetUserStatus(
  actor: MaybeActor,
  target: { id: string; role: Role; status: UserStatus },
  newStatus: UserStatus,
  activeAdminCount: number,
): boolean {
  if (!isAdmin(actor)) return false;
  if (target.role === "ADMIN" && target.status === "ACTIVE" && newStatus === "SUSPENDED" && activeAdminCount <= 1) {
    return false;
  }
  return true;
}

/** Admin terakhir dan akun sendiri tidak boleh dihapus. */
export function canDeleteUser(
  actor: MaybeActor,
  target: { id: string; role: Role },
  activeAdminCount: number,
): boolean {
  if (!isAdmin(actor)) return false;
  if ((actor as Actor).id === target.id) return false;
  if (target.role === "ADMIN" && activeAdminCount <= 1) return false;
  return true;
}

/** Produk tampil publik hanya jika aktif, tidak disembunyikan admin, dan sellernya disetujui serta aktif. */
export function isProductPubliclyVisible(
  product: { isActive: boolean; hiddenByAdmin: boolean },
  seller: { approvalStatus: ApprovalStatus; userStatus: UserStatus },
): boolean {
  return (
    product.isActive &&
    !product.hiddenByAdmin &&
    seller.approvalStatus === "APPROVED" &&
    seller.userStatus === "ACTIVE"
  );
}
