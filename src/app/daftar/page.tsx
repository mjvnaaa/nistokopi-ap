import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/AuthForms";
import { getActor } from "@/lib/actor";
import { homeFor } from "@/lib/redirect";

export const metadata = { title: "Daftar" };

export default function DaftarPage() {
  return (
    <Suspense fallback={null}>
      <DaftarContent />
    </Suspense>
  );
}

async function DaftarContent() {
  const actor = await getActor();
  if (actor) redirect(homeFor(actor.role));

  return (
    <section className="auth-card panel" aria-labelledby="judul-daftar">
      <h1 id="judul-daftar" tabIndex={-1}>
        Daftar
      </h1>
      <RegisterForm />
      <p className="note">
        Sudah punya akun? <Link href="/masuk">Masuk</Link>
      </p>
    </section>
  );
}
