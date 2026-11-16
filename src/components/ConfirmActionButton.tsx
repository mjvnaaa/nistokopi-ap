"use client";

import { useId, useRef, type ReactNode } from "react";

interface Props {
  /** Teks tombol di tabel, contoh: "Tangguhkan". */
  label: string;
  /** Label lengkap untuk pembaca layar, menyebut sasaran. */
  ariaLabel: string;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  /** Isian tersembunyi yang dikirim (id, aksi, kembali, ...). */
  fields: Record<string, string>;
  danger?: boolean;
  /** Bila ada, dialog memuat kolom catatan. */
  note?: { label: string; required: boolean; hint?: string };
  small?: boolean;
}

/**
 * Dialog konfirmasi untuk aksi admin yang berdampak (UI-SPEC-v2 bagian 3): menyebut nama sasaran
 * di kalimatnya, fokus awal pada tombol aman "Batal", dan dapat memuat catatan (wajib atau opsional).
 */
export function ConfirmActionButton({ label, ariaLabel, title, message, confirmLabel, action, fields, danger, note, small = true }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const uid = useId();
  const titleId = `d-${uid}`;
  const noteId = `n-${uid}`;

  return (
    <>
      <button
        type="button"
        className={`btn ${danger ? "danger" : "alt"}${small ? " sm" : ""}`}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        onClick={() => dialogRef.current?.showModal()}
      >
        {label}
      </button>

      <dialog ref={dialogRef} aria-labelledby={titleId}>
        <h2 id={titleId}>{title}</h2>
        <p>{message}</p>
        <form
          action={action}
          className={note ? "dialog-note" : undefined}
          onSubmit={() => {
            // Tutup setelah formulir terkirim agar dialog tidak tertinggal terbuka di halaman yang sama.
            window.setTimeout(() => dialogRef.current?.close(), 0);
          }}
        >
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}

          {note ? (
            <div className="field">
              <label htmlFor={noteId}>{note.label}</label>
              <textarea id={noteId} name="catatan" className="plain" maxLength={300} required={note.required} aria-describedby={`${noteId}-h`} />
              <p className="note field-hint" id={`${noteId}-h`}>
                {note.hint ?? "Maksimal 300 karakter."}
              </p>
            </div>
          ) : null}

          <div className="row-actions end">
            <button type="button" className="btn alt" autoFocus onClick={() => dialogRef.current?.close()}>
              Batal
            </button>
            <button type="submit" className={`btn${danger ? " danger" : ""}`}>
              {confirmLabel}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
