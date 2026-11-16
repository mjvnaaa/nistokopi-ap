import { describe, it, expect } from "vitest";
import {
  type Actor,
  canAccessAdminArea,
  canCreateProduct,
  canEditProduct,
  canDeleteProduct,
  canModerateProduct,
  canReview,
  canChangeUserRole,
  canSetUserStatus,
  canDeleteUser,
  isProductPubliclyVisible,
} from "../src/lib/authz";

const admin: Actor = { id: "a1", role: "ADMIN", status: "ACTIVE" };
const buyer: Actor = { id: "b1", role: "BUYER", status: "ACTIVE" };
const sellerA: Actor = { id: "u-a", role: "SELLER", status: "ACTIVE", sellerProfileId: "sp-a", sellerApproval: "APPROVED" };
const sellerPending: Actor = { id: "u-p", role: "SELLER", status: "ACTIVE", sellerProfileId: "sp-p", sellerApproval: "PENDING" };
const productOfB = { sellerId: "sp-b" };
const productOfA = { sellerId: "sp-a" };

describe("akses area admin", () => {
  it("hanya admin aktif", () => {
    expect(canAccessAdminArea(admin)).toBe(true);
    expect(canAccessAdminArea(buyer)).toBe(false);
    expect(canAccessAdminArea(sellerA)).toBe(false);
    expect(canAccessAdminArea(null)).toBe(false);
    expect(canAccessAdminArea({ ...admin, status: "SUSPENDED" })).toBe(false);
  });
});

describe("kepemilikan produk", () => {
  it("seller tidak bisa mengubah atau menghapus produk seller lain", () => {
    expect(canEditProduct(sellerA, productOfB)).toBe(false);
    expect(canDeleteProduct(sellerA, productOfB)).toBe(false);
  });
  it("seller bisa mengubah produk miliknya", () => {
    expect(canEditProduct(sellerA, productOfA)).toBe(true);
  });
  it("seller yang belum disetujui tidak bisa membuat atau mengubah produk", () => {
    expect(canCreateProduct(sellerPending)).toBe(false);
    expect(canEditProduct(sellerPending, { sellerId: "sp-p" })).toBe(false);
  });
  it("seller ditangguhkan atau akun nonaktif ditolak", () => {
    expect(canCreateProduct({ ...sellerA, sellerApproval: "SUSPENDED" })).toBe(false);
    expect(canCreateProduct({ ...sellerA, status: "SUSPENDED" })).toBe(false);
  });
  it("pembeli dan tamu tidak bisa mengelola produk", () => {
    expect(canCreateProduct(buyer)).toBe(false);
    expect(canEditProduct(null, productOfA)).toBe(false);
  });
  it("hanya admin yang memoderasi produk", () => {
    expect(canModerateProduct(admin)).toBe(true);
    expect(canModerateProduct(sellerA)).toBe(false);
  });
});

describe("ulasan", () => {
  it("hanya pembeli aktif", () => {
    expect(canReview(buyer)).toBe(true);
    expect(canReview(sellerA)).toBe(false);
    expect(canReview(null)).toBe(false);
  });
});

describe("perlindungan admin terakhir", () => {
  const target = { id: "a1", role: "ADMIN" as const, status: "ACTIVE" as const };
  it("tidak boleh diturunkan, ditangguhkan, atau dihapus jika tinggal satu", () => {
    expect(canChangeUserRole(admin, target, "BUYER", 1)).toBe(false);
    expect(canSetUserStatus(admin, target, "SUSPENDED", 1)).toBe(false);
    expect(canDeleteUser(admin, { id: "a2", role: "ADMIN" }, 1)).toBe(false);
  });
  it("boleh jika ada admin lain", () => {
    expect(canChangeUserRole(admin, target, "BUYER", 2)).toBe(true);
    expect(canSetUserStatus(admin, target, "SUSPENDED", 2)).toBe(true);
  });
  it("tidak boleh menghapus akun sendiri", () => {
    expect(canDeleteUser(admin, { id: "a1", role: "ADMIN" }, 3)).toBe(false);
  });
  it("non-admin ditolak", () => {
    expect(canChangeUserRole(sellerA, { id: "x", role: "BUYER" }, "SELLER", 3)).toBe(false);
  });
});

describe("keterlihatan produk di katalog publik", () => {
  const ok = { isActive: true, hiddenByAdmin: false };
  const approved = { approvalStatus: "APPROVED" as const, userStatus: "ACTIVE" as const };
  it("tampil jika semua syarat terpenuhi", () => expect(isProductPubliclyVisible(ok, approved)).toBe(true));
  it("tersembunyi jika produk nonaktif, disembunyikan admin, atau seller belum disetujui", () => {
    expect(isProductPubliclyVisible({ ...ok, isActive: false }, approved)).toBe(false);
    expect(isProductPubliclyVisible({ ...ok, hiddenByAdmin: true }, approved)).toBe(false);
    expect(isProductPubliclyVisible(ok, { ...approved, approvalStatus: "PENDING" })).toBe(false);
    expect(isProductPubliclyVisible(ok, { ...approved, userStatus: "SUSPENDED" })).toBe(false);
  });
});
