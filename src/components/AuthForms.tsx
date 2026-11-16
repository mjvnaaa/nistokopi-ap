"use client";

import { useActionState, useState } from "react";
import { daftarAction, masukAction } from "@/app/auth-actions";
import { Field, fieldProps } from "@/components/Field";
import type { FormState } from "@/lib/form";

const empty: FormState = {};

function PasswordInput({ id, autoComplete, error }: { id: string; autoComplete: string; error?: string }) {
  const [shown, setShown] = useState(false);

  return (
    <div className="pw">
      <input {...fieldProps(id, error)} type={shown ? "text" : "password"} autoComplete={autoComplete} required />
      <button type="button" className="btn alt sm" aria-pressed={shown} onClick={() => setShown((v) => !v)}>
        {shown ? "Sembunyikan" : "Tampilkan"}
        <span className="sr"> kata sandi</span>
      </button>
    </div>
  );
}

export function LoginForm({ lanjut }: { lanjut: string }) {
  const [state, action, pending] = useActionState(masukAction, empty);

  return (
    <form action={action} className="auth-form" noValidate>
      <input type="hidden" name="lanjut" value={lanjut} />

      <Field id="email" label="Email">
        <input {...fieldProps("email")} type="email" autoComplete="email" required defaultValue={state.values?.email ?? ""} />
      </Field>

      <Field id="password" label="Kata sandi">
        <PasswordInput id="password" autoComplete="current-password" />
      </Field>

      <p className="err form-err" role="alert">
        {state.error ?? ""}
      </p>

      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(daftarAction, empty);
  const [peran, setPeran] = useState<"BUYER" | "SELLER">(state.values?.peran === "SELLER" ? "SELLER" : "BUYER");
  const v = state.values ?? {};
  const fe = (key: string) => state.fieldErrors?.[key]?.[0];

  return (
    <form action={action} className="auth-form" noValidate>
      <fieldset className="choices">
        <legend>Saya mendaftar sebagai</legend>
        <label className="choice">
          <input type="radio" name="peran" value="BUYER" checked={peran === "BUYER"} onChange={() => setPeran("BUYER")} />
          <span>
            <strong>Saya pembeli</strong>
            <span className="note">Simpan favorit dan beri ulasan.</span>
          </span>
        </label>
        <label className="choice">
          <input type="radio" name="peran" value="SELLER" checked={peran === "SELLER"} onChange={() => setPeran("SELLER")} />
          <span>
            <strong>Saya penjual</strong>
            <span className="note">Buka toko dan kelola produk.</span>
          </span>
        </label>
      </fieldset>

      {peran === "SELLER" ? <p className="note">Toko tampil setelah disetujui admin.</p> : null}

      <Field id="name" label="Nama" error={fe("name")}>
        <input {...fieldProps("name", fe("name"))} type="text" autoComplete="name" required maxLength={80} defaultValue={v.name ?? ""} />
      </Field>

      <Field id="email" label="Email" error={fe("email")}>
        <input {...fieldProps("email", fe("email"))} type="email" autoComplete="email" required defaultValue={v.email ?? ""} />
      </Field>

      <Field id="password" label="Kata sandi" error={fe("password")} hint="Minimal 10 karakter.">
        <PasswordInput id="password" autoComplete="new-password" error={fe("password")} />
      </Field>

      {peran === "SELLER" ? (
        <>
          <Field id="storeName" label="Nama toko" error={fe("storeName")}>
            <input {...fieldProps("storeName", fe("storeName"))} type="text" autoComplete="organization" required maxLength={60} defaultValue={v.storeName ?? ""} />
          </Field>
          <Field id="city" label="Kota (opsional)" error={fe("city")}>
            <input {...fieldProps("city", fe("city"))} type="text" autoComplete="address-level2" maxLength={60} defaultValue={v.city ?? ""} />
          </Field>
          <Field
            id="whatsapp"
            label="Nomor WhatsApp toko"
            error={fe("whatsapp")}
            hint="Nomor ini tampil publik di halaman toko dan tombol pesan. Contoh: 0812-3456-7890."
          >
            <input {...fieldProps("whatsapp", fe("whatsapp"))} type="tel" inputMode="tel" autoComplete="tel" required defaultValue={v.whatsapp ?? ""} />
          </Field>
          <Field id="description" label="Deskripsi toko (opsional)" error={fe("description")}>
            <textarea {...fieldProps("description", fe("description"))} maxLength={300} className="plain" defaultValue={v.description ?? ""} />
          </Field>
        </>
      ) : null}

      <p className="err form-err" role="alert">
        {state.error ?? ""}
      </p>

      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Memproses…" : "Daftar"}
      </button>
    </form>
  );
}
