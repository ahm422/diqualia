import { NextResponse, type NextRequest } from "next/server";

import { verifyAdminToken } from "@/lib/auth/jwt";
import { getTokenFromRequest } from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const isLoginPage = pathname === "/admin/login";
  const token = getTokenFromRequest(request);

  let user: { email: string } | null = null;
  if (token) {
    try {
      user = await verifyAdminToken(token);
    } catch { /* invalid or expired */ }
  }

  const isValidAdmin = user?.email === process.env.ADMIN_EMAIL;

  if (isLoginPage && isValidAdmin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (!isLoginPage && !isValidAdmin) {
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
