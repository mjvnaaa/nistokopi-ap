import { Suspense } from "react";
import Link from "next/link";
import { ProfileForm } from "@/components/ProfileForm";
import { requireSeller } from "@/lib/guards";
import { sellerMode } from "@/lib/seller-status";

export const metadata = { title: "Profil toko" };

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const { profile } = await requireSeller("/seller/profil");

  return (
    <>
      <p className="crumbs">
        <Link href="/seller">Dashboard toko</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Profil toko</span>
      </p>
      <section className="panel" aria-labelledby="judul-profil-toko">
        <h1 className="panel-title" id="judul-profil-toko" tabIndex={-1}>
          Profil toko
        </h1>
        <ProfileForm
          readOnly={sellerMode(profile.approvalStatus) === "read-only"}
          profile={{
            storeName: profile.storeName,
            description: profile.description ?? "",
            city: profile.city ?? "",
            whatsapp: profile.whatsapp,
          }}
        />
      </section>
    </>
  );
}
