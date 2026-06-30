"use client";

import { createContext, useContext, useMemo } from "react";
import { getPermissions, type Permissions } from "@/lib/permissions";

export type Role = "admin" | "pm" | "creative" | "finance";

export type EntityKind = "client" | "project" | "task";
export type AppRoute = "/" | "/clients" | "/projects" | "/team" | "/tasks";

/** The signed-in account, resolved server-side and handed to the provider. */
export type SessionUser = {
  id: string;
  username: string;
  name: string | null;
  role: Role;
  /** The TeamMember this account acts as, if any (drives creative scoping). */
  teamMemberId: string | null;
};

export const ROLE_ACCESS: Record<
  Role,
  { routes: ReadonlyArray<AppRoute>; entities: ReadonlyArray<EntityKind> }
> = {
  admin: {
    routes: ["/", "/clients", "/projects", "/team", "/tasks"],
    entities: ["client", "project", "task"],
  },
  pm: {
    routes: ["/", "/clients", "/projects", "/team", "/tasks"],
    entities: ["client", "project", "task"],
  },
  creative: {
    routes: ["/", "/projects", "/tasks"],
    entities: ["project", "task"],
  },
  finance: {
    routes: ["/", "/clients", "/projects"],
    entities: ["client", "project"],
  },
};

export const ROLE_META: Record<
  Role,
  { label: string; eyebrow: string; avatar: string; desc: string }
> = {
  admin: {
    label: "Admin / Owner",
    eyebrow: "Admin / Owner",
    avatar: "AO",
    desc: "Studio-wide overview of clients, projects, and deadlines.",
  },
  pm: {
    label: "Project Manager",
    eyebrow: "Project Manager",
    avatar: "PM",
    desc: "Your projects, deadlines, and team workload.",
  },
  creative: {
    label: "Creative",
    eyebrow: "Creative",
    avatar: "CR",
    desc: "Your assigned tasks and what is due next.",
  },
  finance: {
    label: "Finance",
    eyebrow: "Finance",
    avatar: "FN",
    desc: "Billing position across active projects.",
  },
};

type Ctx = {
  role: Role;
  currentUserId: string | null;
  currentUser: { id: string; name: string } | null;
  user: SessionUser | null;
};
const RoleContext = createContext<Ctx | null>(null);

export function RoleProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser | null;
}) {
  const value = useMemo<Ctx>(() => {
    const role: Role = user?.role ?? "admin";
    const currentUserId = user?.teamMemberId ?? null;
    const currentUser =
      user && user.teamMemberId
        ? { id: user.teamMemberId, name: user.name ?? user.username }
        : null;
    return { role, currentUserId, currentUser, user };
  }, [user]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used inside RoleProvider");
  return ctx;
}

export function usePermissions(): Permissions {
  const { role, currentUserId } = useRole();
  return useMemo(() => getPermissions(role, currentUserId), [role, currentUserId]);
}
