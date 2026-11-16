/** Bentuk keadaan formulir server action (dipakai useActionState). Kata sandi tidak pernah dikembalikan. */
export interface FormState {
  error?: string;
  ok?: boolean;
  fieldErrors?: Record<string, string[] | undefined>;
  values?: Record<string, string>;
}

export function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export function valuesFrom(formData: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, str(formData, key)]));
}
