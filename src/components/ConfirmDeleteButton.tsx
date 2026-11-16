"use client";

import { useRef } from "react";

/** Hapus dengan dialog konfirmasi yang menyebut nama produk. Fokus awal pada tombol aman ("Batal"). */
export function ConfirmDeleteButton({
  id,
  name,
  action,
}: {
  id: string;
  name: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button type="button" className="btn danger sm" aria-label={`Hapus ${name}`} onClick={() => dialogRef.current?.showModal()}>
        Hapus
      </button>

      <dialog ref={dialogRef} aria-labelledby={`hapus-${id}`}>
        <h2 id={`hapus-${id}`}>Hapus produk?</h2>
        <p>
          Produk “{name}” akan dihapus beserta favorit dan ulasannya. Tindakan ini tidak dapat dibatalkan.
        </p>
        <form action={action} className="row-actions end">
          <input type="hidden" name="id" value={id} />
          <button type="button" className="btn alt" autoFocus onClick={() => dialogRef.current?.close()}>
            Batal
          </button>
          <button type="submit" className="btn danger">
            Ya, hapus
          </button>
        </form>
      </dialog>
    </>
  );
}
