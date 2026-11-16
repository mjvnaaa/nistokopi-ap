import { describe, it, expect } from "vitest";
import {
  nextSellerStatus,
  requiresNote,
  parseSellerAction,
  canAssignRole,
  moveId,
  categoryNameSchema,
  reviewNoteSchema,
  describeMeta,
  auditLabel,
  parsePage,
  totalPagesFor,
} from "../src/lib/admin-rules";

describe("peralihan status seller", () => {
  it("menyetujui dari Menunggu dan Ditolak saja", () => {
    expect(nextSellerStatus("PENDING", "approve")).toBe("APPROVED");
    expect(nextSellerStatus("REJECTED", "approve")).toBe("APPROVED");
    expect(nextSellerStatus("APPROVED", "approve")).toBeNull();
    expect(nextSellerStatus("SUSPENDED", "approve")).toBeNull();
  });

  it("menolak hanya dari Menunggu", () => {
    expect(nextSellerStatus("PENDING", "reject")).toBe("REJECTED");
    expect(nextSellerStatus("APPROVED", "reject")).toBeNull();
    expect(nextSellerStatus("SUSPENDED", "reject")).toBeNull();
  });

  it("menangguhkan hanya dari Disetujui", () => {
    expect(nextSellerStatus("APPROVED", "suspend")).toBe("SUSPENDED");
    expect(nextSellerStatus("PENDING", "suspend")).toBeNull();
    expect(nextSellerStatus("REJECTED", "suspend")).toBeNull();
  });

  it("mengaktifkan kembali hanya dari Ditangguhkan", () => {
    expect(nextSellerStatus("SUSPENDED", "reactivate")).toBe("APPROVED");
    expect(nextSellerStatus("PENDING", "reactivate")).toBeNull();
    expect(nextSellerStatus("APPROVED", "reactivate")).toBeNull();
  });

  it("hanya menolak yang wajib bercatatan", () => {
    expect(requiresNote("reject")).toBe(true);
    expect(requiresNote("suspend")).toBe(false);
    expect(requiresNote("approve")).toBe(false);
  });

  it("menolak aksi yang tidak dikenal", () => {
    expect(parseSellerAction("approve")).toBe("approve");
    expect(parseSellerAction("delete")).toBeNull();
    expect(parseSellerAction("")).toBeNull();
  });

  it("membatasi panjang catatan", () => {
    expect(reviewNoteSchema.safeParse("a".repeat(300)).success).toBe(true);
    expect(reviewNoteSchema.safeParse("a".repeat(301)).success).toBe(false);
  });
});

describe("penetapan peran", () => {
  it("admin dan pembeli saling dapat ditukar", () => {
    expect(canAssignRole({ role: "BUYER", hasSellerProfile: false }, "ADMIN")).toBe(true);
    expect(canAssignRole({ role: "ADMIN", hasSellerProfile: false }, "BUYER")).toBe(true);
  });

  it("tidak mengubah ke peran yang sama", () => {
    expect(canAssignRole({ role: "BUYER", hasSellerProfile: false }, "BUYER")).toBe(false);
  });

  it("tidak menetapkan Seller dan tidak mengubah seller", () => {
    expect(canAssignRole({ role: "BUYER", hasSellerProfile: false }, "SELLER")).toBe(false);
    expect(canAssignRole({ role: "SELLER", hasSellerProfile: true }, "ADMIN")).toBe(false);
    expect(canAssignRole({ role: "SELLER", hasSellerProfile: true }, "BUYER")).toBe(false);
  });
});

describe("urutan kategori", () => {
  const ids = ["a", "b", "c"];

  it("menggeser ke atas dan ke bawah", () => {
    expect(moveId(ids, "b", "up")).toEqual(["b", "a", "c"]);
    expect(moveId(ids, "b", "down")).toEqual(["a", "c", "b"]);
  });

  it("tidak melewati ujung dan tidak mengubah masukan", () => {
    expect(moveId(ids, "a", "up")).toBeNull();
    expect(moveId(ids, "c", "down")).toBeNull();
    expect(moveId(ids, "x", "up")).toBeNull();
    expect(ids).toEqual(["a", "b", "c"]);
  });
});

describe("nama kategori", () => {
  it("2 sampai 40 karakter setelah dipangkas", () => {
    expect(categoryNameSchema.safeParse("  Robusta ").data).toBe("Robusta");
    expect(categoryNameSchema.safeParse("A").success).toBe(false);
    expect(categoryNameSchema.safeParse(" ".repeat(5)).success).toBe(false);
    expect(categoryNameSchema.safeParse("a".repeat(41)).success).toBe(false);
  });
});

describe("audit log", () => {
  it("memberi label bahasa Indonesia dan menampilkan kode asli bila tak dikenal", () => {
    expect(auditLabel("seller.approve")).toBe("Menyetujui toko");
    expect(auditLabel("fitur.baru")).toBe("fitur.baru");
  });

  it("meringkas meta menjadi teks datar", () => {
    expect(describeMeta({ targetName: "Toko A", from: "PENDING", to: "APPROVED" })).toBe(
      "Sasaran: Toko A · Dari: PENDING · Menjadi: APPROVED",
    );
    expect(describeMeta(null)).toBe("");
    expect(describeMeta([1, 2])).toBe("");
    expect(describeMeta({ note: "" })).toBe("");
  });

  it("tidak mengubah teks berisi markup (di-escape oleh React saat tampil)", () => {
    expect(describeMeta({ targetName: "<img onerror=x>" })).toBe("Sasaran: <img onerror=x>");
  });
});

describe("paginasi admin", () => {
  it("halaman tidak valid kembali ke 1", () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage("abc")).toBe(1);
    expect(parsePage("-3")).toBe(1);
    expect(parsePage("4")).toBe(4);
    expect(parsePage(["2", "9"])).toBe(2);
  });

  it("menghitung jumlah halaman, minimal satu", () => {
    expect(totalPagesFor(0, 20)).toBe(1);
    expect(totalPagesFor(20, 20)).toBe(1);
    expect(totalPagesFor(21, 20)).toBe(2);
  });
});
