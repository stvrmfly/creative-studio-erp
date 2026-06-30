import { PageHeader } from "@/components/ui/page-header";
import { EnvNotice } from "@/components/ui/env-notice";
import { hasDbEnv, prisma } from "@/lib/prisma";
import type { ProjectStatus, TaskStatus } from "@/lib/types";
import { Dashboard, type DashboardData } from "./dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!hasDbEnv()) {
    return (
      <div>
        <PageHeader eyebrow="Workspace" title="Dashboard" />
        <EnvNotice />
      </div>
    );
  }

  const [clients, projects, tasks, team] = await Promise.all([
    prisma.client.findMany(),
    prisma.project.findMany({ include: { client: { select: { companyName: true } } } }),
    prisma.task.findMany({
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, name: true } },
      },
    }),
    prisma.teamMember.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
  ]);

  const projectsByStatus: Record<ProjectStatus, { count: number; budget: number }> = {
    planning: { count: 0, budget: 0 },
    active: { count: 0, budget: 0 },
    review: { count: 0, budget: 0 },
    completed: { count: 0, budget: 0 },
    cancelled: { count: 0, budget: 0 },
  };
  for (const p of projects) {
    projectsByStatus[p.status].count += 1;
    projectsByStatus[p.status].budget += p.budget ?? 0;
  }

  const tasksByStatus: Record<TaskStatus, number> = {
    todo: 0,
    in_progress: 0,
    review: 0,
    completed: 0,
  };
  for (const t of tasks) tasksByStatus[t.status] += 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);

  const tasksDueIn7d = tasks.filter(
    (t) => t.status !== "completed" && t.dueDate && t.dueDate <= in7
  ).length;

  const upcomingTasks = tasks
    .filter((t) => t.status !== "completed" && t.dueDate)
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .slice(0, 8)
    .map((t) => ({
      id: t.id,
      name: t.name,
      status: t.status,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      assigneeId: t.assigneeId,
      projectName: t.project.name,
      assigneeName: t.assignee?.name ?? null,
    }));

  // Action queue — counts of work that needs a human (drives the triage cards).
  const openTasks = tasks.filter((t) => t.status !== "completed");
  const queue = {
    overdue: openTasks.filter((t) => t.dueDate && t.dueDate < today).length,
    dueThisWeek: openTasks.filter((t) => t.dueDate && t.dueDate >= today && t.dueDate <= in7).length,
    review: tasks.filter((t) => t.status === "review").length,
    unassigned: openTasks.filter((t) => !t.assigneeId).length,
  };

  // Projects actually in motion, with task progress and an at-risk signal.
  const projectsInFlight = projects
    .filter((p) => p.status === "active" || p.status === "review")
    .map((p) => {
      const pts = tasks.filter((t) => t.projectId === p.id);
      const open = pts.filter((t) => t.status !== "completed");
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        clientName: p.client.companyName,
        openTasks: open.length,
        totalTasks: pts.length,
        overdueTasks: open.filter((t) => t.dueDate && t.dueDate < today).length,
        dueDate: p.dueDate ? p.dueDate.toISOString() : null,
      };
    })
    .sort((a, b) => b.overdueTasks - a.overdueTasks || b.openTasks - a.openTasks);

  const topByBudget = [...projects]
    .sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0))
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      budget: p.budget ?? 0,
      clientName: p.client.companyName,
    }));

  const teamWorkload = team
    .map((m) => ({
      id: m.id,
      name: m.name,
      openTasks: tasks.filter((t) => t.assigneeId === m.id && t.status !== "completed").length,
    }))
    .sort((a, b) => b.openTasks - a.openTasks || a.name.localeCompare(b.name));

  const creativeStats = team.map((m) => {
    const mine = tasks.filter((t) => t.assigneeId === m.id);
    return {
      id: m.id,
      name: m.name,
      openTasks: mine.filter((t) => t.status !== "completed").length,
      dueThisWeek: mine.filter(
        (t) => t.status !== "completed" && t.dueDate && t.dueDate <= in7
      ).length,
      inReview: mine.filter((t) => t.status === "review").length,
      completedTotal: mine.filter((t) => t.status === "completed").length,
    };
  });

  const projectsByAssignee: DashboardData["projectsByAssignee"] = {};
  for (const m of team) {
    const myTasks = tasks.filter((t) => t.assigneeId === m.id);
    const perProject = new Map<string, { open: number; total: number }>();
    for (const t of myTasks) {
      const cur = perProject.get(t.projectId) ?? { open: 0, total: 0 };
      cur.total += 1;
      if (t.status !== "completed") cur.open += 1;
      perProject.set(t.projectId, cur);
    }
    projectsByAssignee[m.id] = Array.from(perProject.entries())
      .map(([pid, counts]) => {
        const proj = projects.find((p) => p.id === pid);
        if (!proj) return null;
        return {
          id: proj.id,
          name: proj.name,
          clientName: proj.client.companyName,
          status: proj.status,
          myOpenCount: counts.open,
          myTotalCount: counts.total,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null)
      .sort((a, b) => b.myOpenCount - a.myOpenCount || a.name.localeCompare(b.name));
  }

  const data: DashboardData = {
    clients: {
      total: clients.length,
      active: clients.filter((c) => c.status === "active").length,
    },
    projects: projectsByStatus,
    tasks: tasksByStatus,
    tasksDueIn7d,
    queue,
    upcomingTasks,
    projectsInFlight,
    topByBudget,
    teamWorkload,
    creativeStats,
    projectsByAssignee,
  };

  return <Dashboard data={data} />;
}
