import { redirect } from "next/navigation";

export function redirectAdminSection<T extends Record<string, string>>(
  map: T,
  section: string | string[] | undefined,
  fallbackKey: keyof T,
): never {
  const key = typeof section === "string" ? section : undefined;
  const dest = (key && key in map ? map[key] : undefined) ?? map[fallbackKey];
  redirect(dest);
}
