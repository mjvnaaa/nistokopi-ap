"use client";

import { useEffect, useRef, useState } from "react";
import { keluarAction } from "@/app/auth-actions";

/** Menu akun: tombol dengan aria-expanded, tutup dengan Escape atau klik di luar. */
export function AccountMenu({ name, roleLabel }: { name: string; roleLabel: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onPointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div className="acct" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="btn alt sm"
        aria-expanded={open}
        aria-controls="menu-akun"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="acct-name">{name}</span>
        <span aria-hidden="true">▾</span>
      </button>

      {open ? (
        <div className="acct-menu" id="menu-akun">
          <p className="acct-role">{roleLabel}</p>
          <form action={keluarAction}>
            <button className="btn alt sm" type="submit">
              Keluar
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
