"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MainNav() {
  const pathname = usePathname();
  const inCatalog = pathname === "/" || pathname.startsWith("/produk/") || pathname.startsWith("/toko/");

  return (
    <nav className="main" aria-label="Navigasi utama">
      <Link href="/" aria-current={inCatalog ? "page" : undefined}>
        Katalog
      </Link>
    </nav>
  );
}
