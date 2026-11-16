import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/AuthForms";
import { getActor } from "@/lib/actor";
import type { SearchParams } from "@/lib/catalog";
import { homeFor, safeNext } from "@/lib/redirect";

export const metadata = { title: "Masuk" };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));

export default function MasukPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={null}>
      <MasukContent searchParams={searchParams} />
    </Suspense>
  );
}

async function MasukContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const actor = await getActor();
  const lanjut = safeNext(first(params.lanjut));

  if (actor) redirect(lanjut || homeFor(actor.role));

  const pesan = first(params.pesan);

  return (
    <section className="auth-card panel" aria-labelledby="judul-masuk">
      <h1 id="judul-masuk" tabIndex={-1}>
        Masuk
      </h1>
      {pesan === "sesi" ? <p className="note" role="status">Sesi berakhir. Masuk lagi untuk melanjutkan.</p> : null}
      {pesan === "masuk" ? <p className="note" role="status">Masuk dulu untuk membuka halaman itu.</p> : null}
      <LoginForm lanjut={lanjut} />
      <p className="note">
        Belum punya akun? <Link href="/daftar">Daftar</Link>
      </p>
    </section>
  );
}
