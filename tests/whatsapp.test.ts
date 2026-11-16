import { describe, it, expect } from "vitest";
import { normalizeWA, waLink, formatRupiah, stockStatus } from "../src/lib/whatsapp";

describe("normalizeWA", () => {
  it.each(["0812-3456-7890", "+62 812-3456-7890", "812 3456 7890", "6281234567890", "62081234567890"])(
    "menormalkan %s",
    (v) => expect(normalizeWA(v)).toBe("6281234567890"),
  );
  it.each(["", "123", "abc", "0812"])("menolak %s", (v) => expect(normalizeWA(v)).toBe(""));
});

describe("waLink dan format", () => {
  it("memuat nomor seller, nama, dan harga", () => {
    const url = waLink({ name: "Robusta 250 g", price: 55000 }, "6281200000002");
    expect(url.startsWith("https://wa.me/6281200000002?text=")).toBe(true);
    const text = decodeURIComponent(url.split("text=")[1]);
    expect(text).toContain("Robusta 250 g");
    expect(text).toContain("Rp55.000");
  });
  it("format rupiah Indonesia", () => expect(formatRupiah(150000)).toBe("Rp150.000"));
});

describe("stockStatus", () => {
  it("tiga tingkat stok", () => {
    expect(stockStatus(30)).toEqual({ level: "ok", label: "Stok 30" });
    expect(stockStatus(5)).toEqual({ level: "low", label: "Stok tinggal 5" });
    expect(stockStatus(1).level).toBe("low");
    expect(stockStatus(0)).toEqual({ level: "out", label: "Stok habis" });
  });
});
