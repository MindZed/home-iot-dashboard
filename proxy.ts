// proxy.ts
// Runs on EVERY request at the Edge before any page or API route loads.
// Checks for a valid JWT in the session cookie. Redirects to /login if missing/invalid.

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

// Paths that should be accessible WITHOUT authentication
const PUBLIC_PATHS = [
  "/login",
  "/api/auth",   // /api/auth/login, /api/auth/logout
];

// Static assets and framework paths to skip
const SKIP_PREFIXES = [
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/icon-",      // PWA icons
  "/sw.js",      // Service worker
  "/workbox-",   // Workbox scripts
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and framework internals
  if (SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for valid session token
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  const payload = await verifyToken(token);

  if (!payload) {
    // Token expired or tampered — clear it and redirect
    const response = redirectToLogin(request);
    response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return response;
  }

  // Authenticated — let the request through
  return NextResponse.next();
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

// Apply middleware to all routes
export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
