import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAdminToken } from "./jwt";
import { COOKIE_NAME } from "./session";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) redirect("/admin/login");

  let payload: { sub: string; email: string };
  try {
    payload = await verifyAdminToken(token);
  } catch {
    redirect("/admin/login");
  }

  if (payload.email !== process.env.ADMIN_EMAIL) redirect("/admin/login");

  return { id: payload.sub, email: payload.email };
}
