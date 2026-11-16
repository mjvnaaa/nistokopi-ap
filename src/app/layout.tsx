import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Figtree, Fraunces } from "next/font/google";
import Link from "next/link";
import { MainNav } from "@/components/MainNav";
import "./globals.css";

const sans = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NistoKopi – Biji Kopi Banyuwangi",
    template: "%s – NistoKopi",
  },
  description:
    "Katalog digital biji kopi khas Banyuwangi. Pilih produk, lalu pesan langsung ke penjual lewat WhatsApp.",
};

export const viewport: Viewport = {
  themeColor: "#2a1a10",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html lang="id" className={`${sans.variable} ${serif.variable}`}>
      <body>
        {isProduction ? null : (
          <div className="strip">Data contoh. Seluruh produk dan toko di halaman ini fiktif.</div>
        )}

        <header className="top">
          <div className="wrap">
            <Link className="brand" href="/">
              NistoKopi
            </Link>
            <Suspense
              fallback={
                <nav className="main" aria-label="Navigasi utama">
                  <Link href="/" aria-current="page">
                    Katalog
                  </Link>
                </nav>
              }
            >
              <MainNav />
            </Suspense>
          </div>
        </header>

        <main className="wrap">{children}</main>

        <footer className="foot">
          <div className="wrap">
            NistoKopi. Katalog biji kopi khas Banyuwangi. Pemesanan diteruskan lewat WhatsApp; aplikasi tidak
            memproses pembayaran atau pengiriman. Seluruh data produk dan toko adalah contoh fiktif.
          </div>
        </footer>
      </body>
    </html>
  );
}
