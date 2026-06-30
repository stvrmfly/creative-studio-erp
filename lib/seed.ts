import type { PrismaClient } from "@prisma/client";
import { DEMO_ACCOUNTS } from "./demo-accounts";

export async function wipeAll(prisma: PrismaClient) {
  await prisma.user.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.client.deleteMany();
}

/**
 * Canonical demo seed: 5 talents, each with exactly one assignment —
 * 2 manage a project, 3 own a task. Dates are relative to seed time so the
 * dashboard always looks fresh (1 overdue, work due this week, one in review).
 */
export async function seed(prisma: PrismaClient) {
  await wipeAll(prisma);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  // Clients — one per project
  const lumen = await prisma.client.create({
    data: {
      companyName: "Lumen Coffee Co.",
      contactPerson: "Sari Wijaya",
      email: "sari@lumencoffee.id",
      phone: "+62 811 2233 4455",
      industry: "F&B",
      notes: "Specialty roaster, rebrand in progress.",
      status: "active",
    },
  });
  const northwind = await prisma.client.create({
    data: {
      companyName: "Northwind Tech",
      contactPerson: "David Tan",
      email: "david@northwind.tech",
      phone: "+62 812 9988 7766",
      industry: "Technology",
      notes: "B2B SaaS launching a product film.",
      status: "active",
    },
  });

  // Talents (5) — each gets exactly one assignment below
  const hana = await prisma.teamMember.create({
    data: { name: "Hana Okada", role: "Project Manager", email: "hana@studio.test", status: "active" },
  });
  const alex = await prisma.teamMember.create({
    data: { name: "Alex Mercer", role: "Creative Director", email: "alex@studio.test", status: "active" },
  });
  const priya = await prisma.teamMember.create({
    data: { name: "Priya Shah", role: "Senior Designer", email: "priya@studio.test", status: "active" },
  });
  const mateo = await prisma.teamMember.create({
    data: { name: "Mateo Reyes", role: "Motion Designer", email: "mateo@studio.test", status: "active" },
  });
  const dina = await prisma.teamMember.create({
    data: { name: "Dina Larsen", role: "Copywriter", email: "dina@studio.test", status: "active" },
  });

  // Projects (2) — Hana and Alex each manage one
  const aurora = await prisma.project.create({
    data: {
      name: "Aurora Rebrand",
      description: "Full identity refresh: logo, palette, packaging.",
      clientId: lumen.id,
      managerId: hana.id,
      budget: 120_000_000,
      startDate: day(-30),
      dueDate: day(45),
      status: "active",
    },
  });
  const launch = await prisma.project.create({
    data: {
      name: "Launch Film",
      description: "90-second hero film for the Q3 product launch.",
      clientId: northwind.id,
      managerId: alex.id,
      budget: 180_000_000,
      startDate: day(-40),
      dueDate: day(20),
      status: "review",
    },
  });

  // Demo login accounts — one per role. The pm/creative logins act as a real
  // team member so their role-scoped views resolve to actual people.
  const byEmail: Record<string, string> = {
    [hana.email!]: hana.id,
    [priya.email!]: priya.id,
  };
  for (const acc of DEMO_ACCOUNTS) {
    await prisma.user.create({
      data: {
        username: acc.username,
        password: acc.password,
        role: acc.role,
        teamMemberId: acc.teamMemberEmail ? byEmail[acc.teamMemberEmail] ?? null : null,
      },
    });
  }

  // Tasks (3) — Priya, Mateo, Dina each own one
  await prisma.task.createMany({
    data: [
      {
        name: "Logo direction studies",
        description: "Three directions, six variants each.",
        projectId: aurora.id,
        assigneeId: priya.id,
        dueDate: day(-3),
        priority: "high",
        status: "in_progress",
      },
      {
        name: "Storyboard v2",
        description: "Apply director feedback from v1.",
        projectId: launch.id,
        assigneeId: mateo.id,
        dueDate: day(4),
        priority: "high",
        status: "in_progress",
      },
      {
        name: "Campaign tagline",
        description: "Shortlist of taglines for the rebrand.",
        projectId: aurora.id,
        assigneeId: dina.id,
        dueDate: day(6),
        priority: "medium",
        status: "review",
      },
    ],
  });
}
