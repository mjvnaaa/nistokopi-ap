import { describe, expect, it } from "vitest";
import { nameKey, slugify, uniqueSlug } from "@/lib/text";

describe("nameKey", () => {
  it("huruf kecil dan dipangkas", () => {
    expect(nameKey("  Arabika IJEN 200 g ")).toBe("arabika ijen 200 g");
  });
});

describe("slugify", () => {
  it.each([
    ["Kopi Sari Banyuwangi", "kopi-sari-banyuwangi"],
    ["  Warung   Robusta & Timur!! ", "warung-robusta-timur"],
    ["Café Ijên", "cafe-ijen"],
    ["!!!", "toko"],
    ["", "toko"],
  ])("%s -> %s", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });

  it("dibatasi 50 karakter tanpa tanda hubung di ujung", () => {
    const slug = slugify("a".repeat(49) + " b");
    expect(slug.length).toBeLessThanOrEqual(50);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("uniqueSlug", () => {
  it("memakai base bila bebas", async () => {
    expect(await uniqueSlug("toko", async () => false)).toBe("toko");
  });

  it("menambah akhiran bila sudah dipakai", async () => {
    const taken = new Set(["toko", "toko-2"]);
    expect(await uniqueSlug("toko", async (s) => taken.has(s))).toBe("toko-3");
  });
});
