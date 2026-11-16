import { describe, expect, it } from "vitest";
import {
  PAGE_SIZE,
  buildQuery,
  catalogHref,
  formatRatingValue,
  hasActiveFilters,
  pageHref,
  paginate,
  parseCatalogFilters,
  sortProducts,
} from "@/lib/catalog";

describe("parseCatalogFilters", () => {
  it("memakai nilai aman saat URL kosong", () => {
    expect(parseCatalogFilters({})).toEqual({
      q: "",
      kategori: "",
      toko: "",
      tersedia: false,
      urut: "nama",
      halaman: 1,
    });
  });

  it("membaca nilai dari URL dan memangkas spasi", () => {
    expect(
      parseCatalogFilters({
        q: "  arabika ",
        kategori: "arabika",
        toko: "kopi-ijen",
        tersedia: "1",
        urut: "murah",
        halaman: "3",
      }),
    ).toEqual({
      q: "arabika",
      kategori: "arabika",
      toko: "kopi-ijen",
      tersedia: true,
      urut: "murah",
      halaman: 3,
    });
  });

  it("mengabaikan urutan tidak dikenal dan halaman tidak valid", () => {
    const filters = parseCatalogFilters({ urut: "acak", halaman: "-2" });
    expect(filters.urut).toBe("nama");
    expect(filters.halaman).toBe(1);
  });

  it("mengambil nilai pertama bila parameter berulang", () => {
    expect(parseCatalogFilters({ kategori: ["robusta", "arabika"] }).kategori).toBe("robusta");
  });

  it("membatasi panjang kata kunci", () => {
    expect(parseCatalogFilters({ q: "a".repeat(200) }).q).toHaveLength(80);
  });
});

const products = [
  { name: "Robusta", price: 50000, featured: false, ratingAvg: 4, reviewCount: 2 },
  { name: "Arabika", price: 90000, featured: true, ratingAvg: 4.8, reviewCount: 5 },
  { name: "Paket", price: 50000, featured: false, ratingAvg: null, reviewCount: 0 },
];

describe("sortProducts", () => {
  it("mengurutkan nama secara alfabetis", () => {
    expect(sortProducts(products, "nama").map((item) => item.name)).toEqual(["Arabika", "Paket", "Robusta"]);
  });

  it("mengurutkan harga termurah lalu nama", () => {
    expect(sortProducts(products, "murah").map((item) => item.name)).toEqual(["Paket", "Robusta", "Arabika"]);
  });

  it("mengurutkan harga termahal", () => {
    expect(sortProducts(products, "mahal").map((item) => item.name)).toEqual(["Arabika", "Paket", "Robusta"]);
  });

  it("menaruh unggulan lebih dulu", () => {
    expect(sortProducts(products, "unggulan")[0].name).toBe("Arabika");
  });

  it("mengurutkan rating tertinggi dan menaruh tanpa rating di akhir", () => {
    expect(sortProducts(products, "rating").map((item) => item.name)).toEqual(["Arabika", "Robusta", "Paket"]);
  });

  it("tidak mengubah larik asal", () => {
    const before = products.map((item) => item.name);
    sortProducts(products, "mahal");
    expect(products.map((item) => item.name)).toEqual(before);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 10 }, (_, index) => index + 1);

  it("memotong sesuai halaman", () => {
    const result = paginate(items, 2, 4);
    expect(result.items).toEqual([5, 6, 7, 8]);
    expect(result).toMatchObject({ page: 2, totalPages: 3, total: 10, start: 5, end: 8 });
  });

  it("menjepit halaman di luar rentang", () => {
    expect(paginate(items, 99, 4).page).toBe(3);
    expect(paginate(items, 0, 4).page).toBe(1);
  });

  it("menangani daftar kosong", () => {
    expect(paginate([], 1)).toEqual({ items: [], page: 1, totalPages: 1, total: 0, start: 0, end: 0 });
  });

  it("memakai ukuran halaman bawaan", () => {
    const many = Array.from({ length: PAGE_SIZE + 1 }, (_, index) => index);
    expect(paginate(many, 1).items).toHaveLength(PAGE_SIZE);
    expect(paginate(many, 2).items).toHaveLength(1);
  });
});

describe("buildQuery dan tautan", () => {
  it("membuang nilai kosong dan bawaan", () => {
    expect(buildQuery({ q: "", kategori: undefined, tersedia: false, urut: "murah" })).toBe("?urut=murah");
    expect(buildQuery({})).toBe("");
  });

  it("menyusun tautan katalog tanpa parameter bawaan", () => {
    const filters = parseCatalogFilters({});
    expect(catalogHref("/", filters)).toBe("/");
    expect(catalogHref("/", filters, { kategori: "robusta", halaman: 2 })).toBe("/?kategori=robusta&halaman=2");
  });

  it("mempertahankan filter lain saat pindah halaman", () => {
    const filters = parseCatalogFilters({ q: "kopi", urut: "murah", halaman: "3" });
    const href = pageHref("/", filters, 2);
    expect(href).toContain("q=kopi");
    expect(href).toContain("urut=murah");
    expect(href).toContain("halaman=2");
  });
});

describe("pembantu tampilan", () => {
  it("memformat angka rating gaya Indonesia", () => {
    expect(formatRatingValue(4.5)).toBe("4,5");
    expect(formatRatingValue(5)).toBe("5,0");
  });

  it("mendeteksi filter aktif", () => {
    expect(hasActiveFilters(parseCatalogFilters({}))).toBe(false);
    expect(hasActiveFilters(parseCatalogFilters({ tersedia: "1" }))).toBe(true);
    expect(hasActiveFilters(parseCatalogFilters({ q: "kopi" }))).toBe(true);
  });
});
