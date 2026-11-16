import { describe, expect, it } from "vitest";
import { sellerMode, statusBanner } from "@/lib/seller-status";

describe("sellerMode (SLR-05)", () => {
  it("APPROVED penuh, PENDING dan REJECTED hanya profil, SUSPENDED hanya baca", () => {
    expect(sellerMode("APPROVED")).toBe("full");
    expect(sellerMode("PENDING")).toBe("profile-only");
    expect(sellerMode("REJECTED")).toBe("profile-only");
    expect(sellerMode("SUSPENDED")).toBe("read-only");
  });
});

describe("statusBanner", () => {
  it("tidak ada banner untuk APPROVED", () => {
    expect(statusBanner("APPROVED")).toBeNull();
  });

  it("PENDING menjelaskan produk belum tampil", () => {
    expect(statusBanner("PENDING")?.text).toContain("Produk belum tampil di katalog");
  });

  it("REJECTED dan SUSPENDED menyertakan catatan admin bila ada", () => {
    expect(statusBanner("REJECTED", "Lengkapi deskripsi")?.text).toContain("Catatan admin: Lengkapi deskripsi");
    expect(statusBanner("SUSPENDED", " ")?.text).not.toContain("Catatan admin");
  });
});
