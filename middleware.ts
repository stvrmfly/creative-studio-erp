import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route gate. Logged-out visitors are sent to /login; logged-in visitors are
 * kept off /login. This runs on the edge runtime, so it verifies the session
 * cookie with Web Crypto — the HMAC must match lib/auth.ts (Node crypto). It
 * only checks the signature is valid; loading the actual user happens server
 * side in lib/auth.ts.
 */
const SESSION_COOKIE = "studio-erp.session";
const SECRET = process.env.AUTH_SECRET ?? "citrus-dev-secret-change-me";

const encoder = new TextEncoder();

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verify(raw: string | undefined): Promise<boolean> {
  if (!raw) return false;
  const i = raw.lastIndexOf(".");
  if (i < 0) return false;
  const userId = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expected = toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(userId)));
  return sig === expected;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = await verify(req.cookies.get(SESSION_COOKIE)?.value);
  const onLogin = pathname === "/login";

  if (!authed && !onLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (authed && onLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Skip Next internals and API routes; gate everything else (incl. /login).
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
