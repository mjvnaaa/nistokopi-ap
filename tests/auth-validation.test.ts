import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/auth-validation";
import { homeFor, safeNext } from "@/lib/redirect";

const buyer = { peran: "BUYER", name: "Rina", email: "Rina@Contoh.id ", password: "kata-sandi-aman" };
const seller = { ...buyer, peran: "SELLER", storeName: "Toko Uji", whatsapp: "0812-3456-7890" };

describe("registerSchema", () => {
  it("pembeli valid, email dinormalkan huruf kecil", () => {
    const r = registerSchema.safeParse(buyer);
    expect(r.success && r.data.email).toBe("rina@contoh.id");
  });

  it("penjual valid, WhatsApp dinormalkan", () => {
    const r = registerSchema.safeParse(seller);
    expect(r.success && r.data.peran === "SELLER" && r.data.whatsapp).toBe("6281234567890");
  });

  it("penjual wajib punya nama toko dan WhatsApp valid", () => {
    expect(registerSchema.safeParse({ ...buyer, peran: "SELLER" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...seller, whatsapp: "123" }).success).toBe(false);
  });

  it("peran ADMIN tidak dapat didaftarkan sendiri (AKN-04)", () => {
    expect(registerSchema.safeParse({ ...buyer, peran: "ADMIN" }).success).toBe(false);
  });

  it("kata sandi minimal 10 karakter", () => {
    expect(registerSchema.safeParse({ ...buyer, password: "pendek" }).success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("menolak email tidak valid", () => {
    expect(loginSchema.safeParse({ email: "bukan-email", password: "x" }).success).toBe(false);
  });
});

describe("safeNext", () => {
  it.each(["/seller", "/seller/produk/baru?x=1"])("menerima %s", (v) => expect(safeNext(v)).toBe(v));
  it.each(["https://jahat.example", "//jahat.example", "/\\jahat", "seller", "", "/a\nb"])("menolak %j", (v) =>
    expect(safeNext(v)).toBe(""),
  );
});

describe("homeFor", () => {
  it("seller ke dashboard toko, admin ke dashboard admin, pembeli ke katalog", () => {
    expect(homeFor("SELLER")).toBe("/seller");
    expect(homeFor("BUYER")).toBe("/");
    expect(homeFor("ADMIN")).toBe("/admin");
  });
});
