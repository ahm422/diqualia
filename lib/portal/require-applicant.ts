import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";

import { loadPortalSessionFromToken } from "./load-portal-session";
import { PORTAL_COOKIE_NAME, type PortalSession } from "./session";

/** Server-component guard — redirects to /portal/login when unauthenticated. */
export async function requireApplicant(): Promise<PortalSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) redirect("/portal/login");

  const session = await loadPortalSessionFromToken(token);
  if (!session) redirect("/portal/login");
  return session;
}

/** Route-handler guard — returns 401 JSON instead of redirecting. */
export async function requireApplicantApi(): Promise<PortalSession | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PORTAL_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const session = await loadPortalSessionFromToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return session;
}
