"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/AccountMenu";

export interface NavLink {
  href: string;
  label: string;
}

interface Props {
  links: NavLink[];
  user: { name: string; roleLabel: string } | null;
}

export function MainNav({ links, user }: Props) {
  const pathname = usePathname();

  const isCurrent = (href: string) => {
    if (href === "/") return pathname === "/" || pathname.startsWith("/produk/") || pathname.startsWith("/toko/");
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="top-right">
      <nav className="main" aria-label="Navigasi utama">
        {links.map((link) => (
          <Link key={link.href} href={link.href} aria-current={isCurrent(link.href) ? "page" : undefined}>
            {link.label}
          </Link>
        ))}
      </nav>

      {user ? (
        <AccountMenu name={user.name} roleLabel={user.roleLabel} />
      ) : (
        <div className="auth-links">
          <Link className="btn alt sm" href="/masuk">
            Masuk
          </Link>
          <Link className="btn sm" href="/daftar">
            Daftar
          </Link>
        </div>
      )}
    </div>
  );
}
