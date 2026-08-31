import { NextResponse, type NextRequest } from "next/server";

import { verifyAdminToken } from "@/lib/auth/jwt";
import { getTokenFromRequest } from "@/lib/auth/session";
import { getPortalTokenFromRequest } from "@/lib/portal/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Applicant portal — auth-only, mirrors the /admin branch. The edge cannot
  // verify PORTAL_JWT_SECRET (build-time inlined), so bounce only when there is
  // no cookie at all; the shell layout's requireApplicant() is the real gate.
  if (pathname.startsWith("/portal")) {
    if (pathname === "/portal/login") return NextResponse.next();
    if (!getPortalTokenFromRequest(request)) {
      const next = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/portal/login?next=${next}`, request.url));
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const isLoginPage = pathname === "/admin/login";
  const token = getTokenFromRequest(request);

  // Next.js edge middleware inlines `process.env.*` at build time. Wrangler
  // secrets (JWT_SECRET) exist only at Worker runtime, so JWT verify here often
  // no-ops in production. Never treat a missing env var as a valid session
  // (`undefined === undefined` caused /admin ↔ /admin/login). Do not query D1
  // from middleware — requireAdmin loads the user + role on the server.
  let isValidAdmin = false;
  if (token && process.env.JWT_SECRET) {
    try {
      await verifyAdminToken(token);
      isValidAdmin = true;
    } catch {
      /* invalid or expired */
    }
  }

  if (isLoginPage && isValidAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Cookie present but unverifiable on the edge: let the server (requireAdmin)
  // decide with runtime secrets. Only bounce when there is no session cookie.
  if (!isLoginPage && !isValidAdmin && !token) {
    const next = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/admin/login?next=${next}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
