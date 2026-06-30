import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { hasDbEnv, prisma } from "./prisma";
import type { Role, SessionUser } from "@/components/role-context";

/**
 * Tiny session layer. There's no auth provider — a login sets a signed,
 * httpOnly cookie holding the user id; every server render verifies it. The
 * signature (HMAC-SHA256) stops the id from being forged client-side. The
 * matching edge-side verification lives in middleware.ts and must stay in sync.
 */
export const SESSION_COOKIE = "studio-erp.session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SECRET = process.env.AUTH_SECRET ?? "citrus-dev-secret-change-me";

function sign(userId: string): string {
  const sig = createHmac("sha256", SECRET).update(userId).digest("hex");
  return `${userId}.${sig}`;
}

function unsign(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const i = raw.lastIndexOf(".");
  if (i < 0) return null;
  const userId = raw.slice(0, i);
  const sig = raw.slice(i + 1);
  const expected = createHmac("sha256", SECRET).update(userId).digest("hex");
  if (sig.length !== expected.length) return null;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) ? userId : null;
}

export function setSession(userId: string) {
  cookies().set(SESSION_COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}

/** The current signed-in user, or null. Reads + verifies the session cookie. */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (!hasDbEnv()) return null;
  const userId = unsign(cookies().get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { teamMember: { select: { id: true, name: true } } },
    });
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      role: user.role as Role,
      teamMemberId: user.teamMemberId,
      name: user.teamMember?.name ?? null,
    };
  } catch {
    return null;
  }
}
