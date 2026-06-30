import type { PrismaClient } from "@prisma/client";
import type { ProjectStatus, TaskPriority, TaskStatus } from "@prisma/client";

const COMPANY_PREFIXES = [
  "Aurora", "Beacon", "Cascade", "Drift", "Ember", "Foundry",
  "Glow", "Halo", "Indigo", "Junction", "Kestrel", "Lantern",
];
const COMPANY_SUFFIXES = ["Studio", "Labs", "Works", "Collective", "Group", "Co.", "House", "Bureau"];
const INDUSTRIES = ["F&B", "Technology", "Retail", "Media", "Healthcare", "Education", "Fashion", "Hospitality"];

const FIRST_NAMES = [
  "Alex", "Bea", "Caleb", "Dina", "Eli", "Fae", "Gus", "Hana",
  "Ines", "Juno", "Kira", "Leo", "Mira", "Nico", "Ola", "Pim",
];
const LAST_NAMES = [
  "Wijaya", "Tan", "Putri", "Cahyo", "Mercer", "Shah", "Reyes",
  "Okada", "Lin", "Sato", "Chen", "Park",
];

const TEAM_ROLES = [
  "Designer",
  "Senior Designer",
  "Junior Designer",
  "Motion Designer",
  "Art Director",
  "Creative Director",
  "Project Manager",
  "Producer",
  "Copywriter",
  "Strategist",
];

const PROJECT_PATTERNS = [
  (c: string) => `${c} Rebrand`,
  (c: string) => `${c} Website Refresh`,
  (c: string) => `${c} Launch Campaign`,
  (c: string) => `${c} Identity System`,
  (c: string) => `${c} Pitch Deck`,
  (c: string) => `${c} Annual Report`,
];

const TASK_VERBS = ["Draft", "Review", "Finalize", "Polish", "Sketch", "Approve", "Refine", "Compile", "Ship"];
const TASK_NOUNS = [
  "mood board", "wireframes", "color palette", "type spec",
  "presentation deck", "asset pack", "edit cut", "storyboard",
  "social post", "case study", "internal review",
];

const PROJECT_STATUSES: ProjectStatus[] = ["planning", "active", "active", "review"];
const TASK_STATUSES: TaskStatus[] = ["todo", "todo", "in_progress", "review"];
const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "medium", "high", "urgent"];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysFromNow(min: number, max: number): Date {
  const days = Math.floor(Math.random() * (max - min + 1)) + min;
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function addRandomTeamMember(prisma: PrismaClient) {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  return prisma.teamMember.create({
    data: {
      name: `${first} ${last}`,
      role: pick(TEAM_ROLES),
      email: `${first.toLowerCase()}.${last.toLowerCase()}@studio.test`,
      status: "active",
    },
  });
}

export async function addRandomClient(prisma: PrismaClient) {
  const companyName = `${pick(COMPANY_PREFIXES)} ${pick(COMPANY_SUFFIXES)}`;
  const contactPerson = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  return prisma.client.create({
    data: {
      companyName,
      contactPerson,
      email: `${contactPerson.toLowerCase().replace(/\s/g, ".")}@${companyName.toLowerCase().replace(/\s|\.|&/g, "")}.test`,
      industry: pick(INDUSTRIES),
      status: "active",
    },
  });
}

export async function addRandomProject(prisma: PrismaClient) {
  const clients = await prisma.client.findMany({ where: { status: "active" } });
  const team = await prisma.teamMember.findMany({ where: { status: "active" } });
  if (clients.length === 0) throw new Error("No active clients — add a client first.");

  const client = pick(clients);
  const manager = team.length > 0 ? pick(team) : null;
  const name = pick(PROJECT_PATTERNS)(client.companyName.split(" ")[0]);

  return prisma.project.create({
    data: {
      name,
      description: `Auto-generated demo project for ${client.companyName}.`,
      clientId: client.id,
      managerId: manager?.id ?? null,
      budget: Math.floor(Math.random() * 200 + 20) * 1_000_000,
      startDate: daysFromNow(-14, 7),
      dueDate: daysFromNow(30, 90),
      status: pick(PROJECT_STATUSES),
    },
  });
}

export async function addRandomTasks(prisma: PrismaClient, count: number) {
  const projects = await prisma.project.findMany({
    where: { status: { in: ["planning", "active", "review"] } },
  });
  const team = await prisma.teamMember.findMany({ where: { status: "active" } });
  if (projects.length === 0) throw new Error("No active projects — add one first.");

  const created = [];
  for (let i = 0; i < count; i++) {
    const project = pick(projects);
    const assignee = team.length > 0 ? pick(team) : null;
    const task = await prisma.task.create({
      data: {
        name: `${pick(TASK_VERBS)} ${pick(TASK_NOUNS)}`,
        projectId: project.id,
        assigneeId: assignee?.id ?? null,
        dueDate: daysFromNow(-2, 21),
        priority: pick(TASK_PRIORITIES),
        status: pick(TASK_STATUSES),
      },
    });
    created.push(task);
  }
  return created;
}
