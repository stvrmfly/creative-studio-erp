"use server";

import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/auth";

/**
 * Validate credentials and start a session. Plain-text compare — see the note
 * on the User model. Throws on failure so the form shows the message; on
 * success the cookie is set and the client navigates into the app.
 */
export async function login(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) throw new Error("Enter a username and password.");

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || user.password !== password) {
    throw new Error("Invalid username or password.");
  }
  setSession(user.id);
}

export async function logout() {
  clearSession();
}
