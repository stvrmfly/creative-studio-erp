import { PageHeader } from "@/components/ui/page-header";
import { EnvNotice } from "@/components/ui/env-notice";
import { hasDbEnv, prisma } from "@/lib/prisma";
import { TasksView } from "./tasks-view";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  if (!hasDbEnv()) {
    return (
      <div>
        <PageHeader eyebrow="Workspace" title="Tasks" />
        <EnvNotice />
      </div>
    );
  }

  const [tasks, projects, team] = await Promise.all([
    prisma.task.findMany({
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    }),
    prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.teamMember.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Tasks"
        description="What is in flight, due soon, and waiting on review."
      />
      <TasksView
        tasks={tasks}
        projects={projects}
        team={team}
        initialFilter={searchParams.filter}
      />
    </div>
  );
}
