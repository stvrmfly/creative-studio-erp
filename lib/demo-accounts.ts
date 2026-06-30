import type { Role } from "@/components/role-context";

/**
 * The fixed demo logins. These are the single source of truth for both the
 * seed (which creates the User rows) and the login page (which lists the
 * credentials on screen). Passwords are plain text on purpose — see the note
 * on the `User` model in schema.prisma.
 *
 * `teamMemberEmail` ties a login to a seeded TeamMember so role-scoped views
 * resolve to a real person (e.g. the creative login sees Priya's tasks).
 */
export type DemoAccount = {
  username: string;
  password: string;
  role: Role;
  label: string;
  blurb: string;
  /** Email of the seeded TeamMember this login acts as, if any. */
  teamMemberEmail?: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    label: "Admin / Owner",
    blurb: "Full studio-wide access to everything.",
  },
  {
    username: "pm",
    password: "pm123",
    role: "pm",
    label: "Project Manager",
    blurb: "Manages projects, tasks, and team workload.",
    teamMemberEmail: "hana@studio.test",
  },
  {
    username: "creative",
    password: "creative123",
    role: "creative",
    label: "Creative",
    blurb: "Sees only their own assigned tasks.",
    teamMemberEmail: "priya@studio.test",
  },
  {
    username: "finance",
    password: "finance123",
    role: "finance",
    label: "Finance",
    blurb: "Read-only billing view; can edit client info.",
  },
];
