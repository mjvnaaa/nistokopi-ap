"use client";

import { useActionState } from "react";
import { simpanProfilAction } from "@/app/seller/actions";
import { Field, fieldProps } from "@/components/Field";
import type { FormState } from "@/lib/form";

export interface ProfileDefaults {
  storeName: string;
  description: string;
  city: string;
  whatsapp: string;
}

const empty: FormState = {};

export function ProfileForm({ profile, readOnly }: { profile: ProfileDefaults; readOnly: boolean }) {
  const [state, action, pending] = useActionState(simpanProfilAction, empty);
  const v = state.values ?? profile;
  const fe = (key: string) => state.fieldErrors?.[key]?.[0];

  return (
    <form action={action} className="form" noValidate>
      <fieldset className="full plain-fieldset" disabled={readOnly}>
        <div className="form">
          <Field id="storeName" label="Nama toko" error={fe("storeName")}>
            <input {...fieldProps("storeName", fe("storeName"))} type="text" required maxLength={60} defaultValue={v.storeName} />
          </Field>

          <Field id="city" label="Kota (opsional)" error={fe("city")}>
            <input {...fieldProps("city", fe("city"))} type="text" maxLength={60} defaultValue={v.city} />
          </Field>

          <Field
            id="whatsapp"
            label="Nomor WhatsApp toko"
            error={fe("whatsapp")}
            hint="Nomor ini tampil publik di halaman toko dan pada tombol pesan. Contoh: 0812-3456-7890."
          >
            <input {...fieldProps("whatsapp", fe("whatsapp"))} type="tel" inputMode="tel" required defaultValue={v.whatsapp} />
          </Field>

          <div className="full">
            <Field id="description" label="Deskripsi toko (opsional)" error={fe("description")} hint="Maksimal 300 karakter.">
              <textarea {...fieldProps("description", fe("description"))} className="plain" maxLength={300} defaultValue={v.description} />
            </Field>
          </div>
        </div>
      </fieldset>

      <p className="err form-err full" role="alert">
        {state.error ?? ""}
      </p>
      {state.ok ? (
        <p className="flash full" role="status">
          Profil toko tersimpan.
        </p>
      ) : null}

      {readOnly ? (
        <p className="note full">Toko ditangguhkan, jadi profil hanya dapat dilihat.</p>
      ) : (
        <div className="full row-actions">
          <button className="btn" type="submit" disabled={pending}>
            {pending ? "Menyimpan…" : "Simpan profil"}
          </button>
        </div>
      )}
    </form>
  );
}
