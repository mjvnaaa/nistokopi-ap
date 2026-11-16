import Link from "next/link";
import "./admin.css";

export type AdminSection = "ringkasan" | "seller" | "pengguna" | "kategori" | "moderasi" | "log";

const SECTIONS: { key: AdminSection; href: string; label: string }[] = [
  { key: "ringkasan", href: "/admin", label: "Ringkasan" },
  { key: "seller", href: "/admin/seller", label: "Antrean seller" },
  { key: "pengguna", href: "/admin/pengguna", label: "Pengguna" },
  { key: "kategori", href: "/admin/kategori", label: "Kategori" },
  { key: "moderasi", href: "/admin/moderasi", label: "Moderasi" },
  { key: "log", href: "/admin/log", label: "Audit log" },
];

/** Menu bagian admin. Satu halaman per bagian (UI-SPEC-v2 bagian 2). */
export function AdminNav({ current }: { current: AdminSection }) {
  return (
    <nav aria-label="Bagian admin">
      <ul className="subnav">
        {SECTIONS.map((section) => (
          <li key={section.key}>
            <Link href={section.href} aria-current={section.key === current ? "page" : undefined}>
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Kepala halaman admin: remah roti, judul, dan menu bagian. */
export function AdminHeader({ current, title, lead }: { current: AdminSection; title: string; lead?: string }) {
  return (
    <>
      <p className="crumbs">
        <Link href="/">Beranda</Link>
        <span aria-hidden="true">›</span>
        {current === "ringkasan" ? (
          <span aria-current="page">Admin</span>
        ) : (
          <>
            <Link href="/admin">Admin</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{title}</span>
          </>
        )}
      </p>

      <section className="hero" aria-labelledby="judul-admin">
        <h1 id="judul-admin" tabIndex={-1}>
          {title}
        </h1>
        {lead ? <p>{lead}</p> : null}
      </section>

      <AdminNav current={current} />
    </>
  );
}

export function AdminFlash({ flash }: { flash: { text: string; bad: boolean } | null }) {
  if (!flash) return null;

  return (
    <p className={flash.bad ? "flash bad" : "flash"} role="status">
      {flash.text}
    </p>
  );
}
