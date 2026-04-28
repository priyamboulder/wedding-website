// proxy.ts
// Auth guards for protected routes.
// Uses Supabase session cookie to verify authentication server-side.
// Unauthenticated requests to protected routes are redirected to /signup.

import { NextResponse, type NextRequest } from "next/server";

// Routes that require authentication
// NOTE: /guests, /checklist, /registry, /studio, /dashboard, /workspace are
// intentionally NOT listed here. They use localStorage-backed Zustand stores
// seeded with demo data, so they work without a Supabase session. Auth is
// handled at the component level by FirstRunGate (which prompts but never hard-blocks).
const PROTECTED_PREFIXES = [
  "/app/",
  "/vendor/",
  "/creator/",
  "/admin/",
  "/seller/",
  "/coordination",
  "/documents",
  "/planner",
];

// Routes always accessible without auth
const PUBLIC_PREFIXES = [
  "/api/",
  "/_next/",
  "/favicon",
  "/signup",
  "/for-vendors",
  "/creators/apply",
  "/discovery",
  "/marketplace",
  "/community",
  "/platform",
  "/vendors",
  "/stationery",
  "/one-looks",
  "/lookbook",
];

function isProtected(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  if (pathname === "/") return false;
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) return NextResponse.next();

  // Check for Supabase auth token in cookies.
  // Supabase stores the session as `sb-<project-ref>-auth-token`.
  // NOTE: this is a presence check only — it does NOT cryptographically verify
  // the JWT. Full JWT verification happens inside each API route via requireAuth().
  // The purpose here is to redirect unauthenticated browser requests to /signup
  // before they hit the page shell. API routes under /api/ bypass this check
  // entirely (see PUBLIC_PREFIXES) and enforce their own auth.
  const cookies = request.cookies;
  const hasSession = Array.from(cookies.getAll()).some(
    (c) => c.name.includes("-auth-token") && c.value.length > 0,
  );

  if (!hasSession) {
    const loginUrl = new URL("/signup", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/vendor/:path*",
    "/creator/:path*",
    "/admin/:path*",
    "/seller/:path*",
    "/coordination/:path*",
    "/documents/:path*",
    "/planner/:path*",
  ],
};
