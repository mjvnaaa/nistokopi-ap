import type { Role } from "@/lib/authz";

/** Terima hanya jalur internal (diawali satu "/"). Mencegah open redirect lewat parameter `lanjut`. */
export function safeNext(value: string | null | undefined): string {
  if (!value || value.length > 200) return "";
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "";
  if (/[\u0000-\u001f]/.test(value)) return "";
  return value;
}

/** Halaman awal setelah masuk, menurut peran. */
export function homeFor(role: Role): string {
  return role === "SELLER" ? "/seller" : "/";
}
