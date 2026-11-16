import { Suspense } from "react";
import Link from "next/link";
import type { SearchParams } from "@/lib/catalog";

export const metadata = { title: "Tidak berhak" };

const ROLES: Record<string, string> = { penjual: "penjual", admin: "admin", pembeli: "pembeli" };

export default function AksesDitolakPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={null}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const raw = (await searchParams).untuk;
  const key = Array.isArray(raw) ? raw[0] : raw;
  const role = (key && ROLES[key]) || "pengguna yang berhak";

  return (
    <div className="empty">
      <h1 tabIndex={-1}>Halaman ini hanya untuk {role}</h1>
      <p>Akun Anda tidak memiliki akses ke halaman itu. Masuk dengan akun yang sesuai, atau kembali ke katalog.</p>
      <p>
        <Link className="btn" href="/">
          Kembali ke katalog
        </Link>{" "}
        <Link className="btn alt" href="/masuk">
          Masuk
        </Link>
      </p>
    </div>
  );
}
