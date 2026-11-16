import type { ReactNode } from "react";

/** Atribut umum input: id=name, terhubung ke pesan galat, dan ditandai tidak valid bila ada galat. */
export function fieldProps(id: string, error?: string) {
  return {
    id,
    name: id,
    "aria-describedby": `e-${id}`,
    "aria-invalid": error ? (true as const) : undefined,
  };
}

/** Label terlihat + isian + pesan galat satu baris (aria-live). */
export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint ? <p className="note field-hint">{hint}</p> : null}
      <p className="err" id={`e-${id}`} aria-live="polite">
        {error ?? ""}
      </p>
    </div>
  );
}
