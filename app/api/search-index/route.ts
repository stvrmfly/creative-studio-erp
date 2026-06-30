import { NextResponse } from "next/server";
import { hasDbEnv, prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDbEnv()) return NextResponse.json([]);

  const [clients, projects, tasks] = await Promise.all([
    prisma.client.findMany({
      select: { id: true, companyName: true, contactPerson: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.project.findMany({
      select: {
        id: true,
        name: true,
        client: { select: { companyName: true } },
        tasks: { select: { assigneeId: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      select: {
        id: true,
        name: true,
        assigneeId: true,
        project: { select: { name: true } },
      },
      where: { status: { not: "completed" } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const items = [
    ...clients.map((c) => ({
      id: c.id,
      type: "client" as const,
      label: c.companyName,
      sub: c.contactPerson,
      href: `/clients/${c.id}`,
      assigneeIds: [] as string[],
    })),
    ...projects.map((p) => ({
      id: p.id,
      type: "project" as const,
      label: p.name,
      sub: p.client.companyName,
      href: `/projects/${p.id}`,
      assigneeIds: Array.from(
        new Set(p.tasks.map((t) => t.assigneeId).filter((v): v is string => !!v))
      ),
    })),
    ...tasks.map((t) => ({
      id: t.id,
      type: "task" as const,
      label: t.name,
      sub: t.project.name,
      href: `/tasks`,
      assigneeIds: t.assigneeId ? [t.assigneeId] : [],
    })),
  ];

  return NextResponse.json(items);
}
