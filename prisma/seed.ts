/**
 * Seed data dummy NistoKopi. Idempoten: aman dijalankan berulang kali.
 * Hanya untuk development dan staging. Semua data FIKTIF.
 *
 * Jalankan: npx prisma db seed
 * Wajib: SEED_PASSWORD (minimal 12 karakter) di environment.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { normalizeWA } from "../src/lib/whatsapp";

if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PRODUCTION !== "true") {
  console.error("Seed ditolak di production. Gunakan database development atau staging.");
  process.exit(1);
}
const password = process.env.SEED_PASSWORD;
if (!password || password.length < 12) {
  console.error("Isi SEED_PASSWORD (minimal 12 karakter) di environment sebelum menjalankan seed.");
  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

type Role = "ADMIN" | "SELLER" | "BUYER";
const NOTE = " Data contoh.";

const USERS: { key: string; name: string; email: string; role: Role }[] = [
  { key: "admin", name: "Admin NistoKopi", email: "admin@nistokopi.example", role: "ADMIN" },
  { key: "sari", name: "Sari Wulandari", email: "sari@nistokopi.example", role: "SELLER" },
  { key: "budi", name: "Budi Santoso", email: "budi@nistokopi.example", role: "SELLER" },
  { key: "dewi", name: "Dewi Lestari", email: "dewi@nistokopi.example", role: "SELLER" },
  { key: "rina", name: "Rina Pratama", email: "rina@nistokopi.example", role: "BUYER" },
  { key: "agus", name: "Agus Setiawan", email: "agus@nistokopi.example", role: "BUYER" },
  { key: "putri", name: "Putri Ayu", email: "putri@nistokopi.example", role: "BUYER" },
  { key: "hendra", name: "Hendra Gunawan", email: "hendra@nistokopi.example", role: "BUYER" },
];

const STORES = [
  { user: "sari", storeName: "Kopi Sari Banyuwangi", slug: "kopi-sari-banyuwangi", wa: "081200000001", status: "APPROVED", description: "Toko contoh untuk Arabika, specialty, dan paket kopi." },
  { user: "budi", storeName: "Warung Robusta Timur", slug: "warung-robusta-timur", wa: "081200000002", status: "APPROVED", description: "Toko contoh untuk Robusta dalam berbagai tingkat sangrai." },
  { user: "dewi", storeName: "Sangrai Pagi", slug: "sangrai-pagi", wa: "081200000003", status: "PENDING", description: "Toko contoh yang masih menunggu persetujuan admin." },
] as const;

const CATEGORIES = [
  { name: "Robusta", slug: "robusta" },
  { name: "Arabika", slug: "arabika" },
  { name: "Specialty", slug: "specialty" },
  { name: "Paket", slug: "paket" },
];

// [pemilik, kategori, nama, deskripsi, harga, stok, unggulan]
type P = [string, string, string, string, number, number, boolean];
const PRODUCTS: P[] = [
  // Kopi Sari Banyuwangi (8)
  ["sari", "arabika", "Arabika Ijen Medium Roast 200 g", "Biji kopi Arabika Ijen, roasting medium, kemasan 200 g.", 85000, 18, true],
  ["sari", "arabika", "Arabika Ijen Light Roast 200 g", "Biji kopi Arabika Ijen, roasting light, kemasan 200 g.", 85000, 0, false],
  ["sari", "arabika", "Arabika Ijen Dark Roast 200 g", "Biji kopi Arabika Ijen, roasting dark, kemasan 200 g.", 85000, 4, false],
  ["sari", "arabika", "Arabika Ijen Biji Mentah 500 g", "Biji kopi Arabika Ijen mentah (green bean), kemasan 500 g.", 140000, 10, false],
  ["sari", "specialty", "Specialty Banyuwangi 100 g", "Biji kopi kelas specialty, kemasan 100 g. Detail lot dan skor cupping belum tersedia.", 120000, 12, true],
  ["sari", "specialty", "Specialty Banyuwangi Biji Mentah 250 g", "Biji kopi kelas specialty mentah, kemasan 250 g. Detail lot belum tersedia.", 210000, 7, false],
  ["sari", "paket", "Paket Cicip Biji Kopi 3 × 100 g", "Paket berisi Robusta, Arabika Ijen, dan specialty masing-masing 100 g.", 150000, 8, false],
  ["sari", "paket", "Paket Hadiah Dua Kopi 2 × 200 g", "Paket hadiah berisi dua kemasan biji kopi 200 g.", 160000, 14, false],
  // Warung Robusta Timur (8)
  ["budi", "robusta", "Robusta Banyuwangi Medium Roast 250 g", "Biji kopi Robusta khas Banyuwangi, roasting medium, kemasan 250 g.", 55000, 30, true],
  ["budi", "robusta", "Robusta Banyuwangi Dark Roast 250 g", "Biji kopi Robusta khas Banyuwangi, roasting dark, kemasan 250 g.", 55000, 22, false],
  ["budi", "robusta", "Robusta Banyuwangi Biji Mentah 1 kg", "Biji kopi Robusta mentah (green bean) untuk disangrai sendiri, kemasan 1 kg.", 90000, 5, false],
  ["budi", "robusta", "Robusta Banyuwangi Medium Roast 500 g", "Biji kopi Robusta, roasting medium, kemasan 500 g.", 100000, 16, false],
  ["budi", "robusta", "Robusta Banyuwangi Dark Roast 500 g", "Biji kopi Robusta, roasting dark, kemasan 500 g.", 100000, 11, false],
  ["budi", "robusta", "Robusta Banyuwangi Giling Halus 250 g", "Kopi Robusta bubuk giling halus, kemasan 250 g.", 58000, 20, false],
  ["budi", "robusta", "Robusta Banyuwangi Biji Mentah 500 g", "Biji kopi Robusta mentah (green bean), kemasan 500 g.", 50000, 25, false],
  ["budi", "paket", "Paket Robusta Hemat 3 × 250 g", "Paket tiga kemasan Robusta 250 g.", 150000, 6, true],
  // Sangrai Pagi (menunggu persetujuan, tidak tampil publik)
  ["dewi", "arabika", "Biji Kopi Sangrai Pagi Medium 150 g", "Biji kopi sangrai medium, kemasan 150 g.", 70000, 15, false],
  ["dewi", "paket", "Paket Sangrai Pagi Mini 2 × 50 g", "Paket mini dua kemasan 50 g.", 60000, 20, false],
];

// [pembeli, produk, rating, komentar] (komentar netral: tanpa klaim rasa atau asal kebun)
const REVIEWS: [string, string, number, string][] = [
  ["rina", "Robusta Banyuwangi Medium Roast 250 g", 5, "Penjual cepat membalas pesan. Kemasan rapi."],
  ["agus", "Robusta Banyuwangi Medium Roast 250 g", 4, "Informasi stok sesuai dengan yang tampil di katalog."],
  ["putri", "Arabika Ijen Medium Roast 200 g", 5, "Pemesanan lewat WhatsApp mudah."],
  ["hendra", "Arabika Ijen Medium Roast 200 g", 4, "Harga sesuai yang tertera."],
  ["rina", "Paket Cicip Biji Kopi 3 × 100 g", 5, "Paket cocok untuk mencoba beberapa jenis."],
  ["agus", "Specialty Banyuwangi 100 g", 3, "Kemasan kecil, pengiriman agak lama."],
];

const FAVORITES: [string, string][] = [
  ["rina", "Arabika Ijen Medium Roast 200 g"],
  ["rina", "Robusta Banyuwangi Medium Roast 250 g"],
  ["agus", "Paket Robusta Hemat 3 × 250 g"],
  ["putri", "Specialty Banyuwangi 100 g"],
  ["hendra", "Robusta Banyuwangi Dark Roast 500 g"],
];

async function main() {
  // Kategori
  const cat: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: i },
      create: { ...c, sortOrder: i },
    });
    cat[c.slug] = row.id;
  }

  // Pengguna + akun kredensial
  const uid: Record<string, string> = {};
  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, status: "ACTIVE" },
      create: { name: u.name, email: u.email, role: u.role, emailVerified: true },
    });
    uid[u.key] = user.id;
    const existing = await prisma.account.findFirst({ where: { userId: user.id, providerId: "credential" } });
    const hash = await hashPassword(password!);
    if (existing) {
      await prisma.account.update({ where: { id: existing.id }, data: { password: hash } });
    } else {
      await prisma.account.create({
        data: { userId: user.id, accountId: user.id, providerId: "credential", password: hash },
      });
    }
  }

  // Toko
  const sid: Record<string, string> = {};
  for (const s of STORES) {
    const wa = normalizeWA(s.wa);
    if (!wa) throw new Error(`Nomor WhatsApp seed tidak valid: ${s.wa}`);
    const row = await prisma.sellerProfile.upsert({
      where: { userId: uid[s.user] },
      update: { storeName: s.storeName, slug: s.slug, description: s.description, city: "Banyuwangi", whatsapp: wa, approvalStatus: s.status },
      create: {
        userId: uid[s.user], storeName: s.storeName, slug: s.slug, description: s.description,
        city: "Banyuwangi", whatsapp: wa, approvalStatus: s.status,
        reviewedAt: s.status === "APPROVED" ? new Date() : null,
      },
    });
    sid[s.user] = row.id;
  }

  // Produk
  const pid: Record<string, string> = {};
  for (const [owner, c, name, desc, price, stock, featured] of PRODUCTS) {
    const nameKey = name.toLowerCase();
    const row = await prisma.product.upsert({
      where: { sellerId_nameKey: { sellerId: sid[owner], nameKey } },
      update: { name, description: desc + NOTE, price, stock, featured, categoryId: cat[c] },
      create: { sellerId: sid[owner], categoryId: cat[c], name, nameKey, description: desc + NOTE, price, stock, featured },
    });
    pid[name] = row.id;
  }

  // Ulasan dan favorit
  for (const [u, p, rating, comment] of REVIEWS) {
    await prisma.review.upsert({
      where: { userId_productId: { userId: uid[u], productId: pid[p] } },
      update: { rating, comment: comment + NOTE },
      create: { userId: uid[u], productId: pid[p], rating, comment: comment + NOTE },
    });
  }
  for (const [u, p] of FAVORITES) {
    await prisma.favorite.upsert({
      where: { userId_productId: { userId: uid[u], productId: pid[p] } },
      update: {},
      create: { userId: uid[u], productId: pid[p] },
    });
  }

  // Klik WhatsApp (hanya dibuat jika tabel masih kosong)
  if ((await prisma.orderClick.count()) === 0) {
    const buyers = ["rina", "agus", "putri", "hendra"];
    const approvedNames = PRODUCTS.filter((p) => p[0] !== "dewi" && p[5] > 0).map((p) => p[2]);
    const clicks: { productId: string; userId: string | null; createdAt: Date }[] = [];
    approvedNames.forEach((name, i) => {
      const n = ((i * 3) % 7) + 1;
      for (let k = 0; k < n; k++) {
        const daysAgo = (i + k * 2) % 14;
        clicks.push({
          productId: pid[name],
          userId: k % 3 === 2 ? null : uid[buyers[(i + k) % buyers.length]],
          createdAt: new Date(Date.now() - daysAgo * 86_400_000),
        });
      }
    });
    await prisma.orderClick.createMany({ data: clicks });
  }

  // Catatan audit
  if ((await prisma.auditLog.count({ where: { action: "seller.approve" } })) === 0) {
    await prisma.auditLog.createMany({
      data: [
        { actorId: uid.admin, action: "seller.approve", entityType: "SellerProfile", entityId: sid.sari },
        { actorId: uid.admin, action: "seller.approve", entityType: "SellerProfile", entityId: sid.budi },
      ],
    });
  }

  const [users, products, visible] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.product.count({ where: { seller: { approvalStatus: "APPROVED" } } }),
  ]);
  console.log(`Seed selesai: ${users} pengguna, ${products} produk (${visible} tampil publik).`);
  console.log("Masuk dengan admin@nistokopi.example, sari@..., budi@..., rina@... memakai SEED_PASSWORD.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
