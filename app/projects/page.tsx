import { PageHeader } from "@/components/ui/page-header";
import { EnvNotice } from "@/components/ui/env-notice";
import { hasDbEnv, prisma } from "@/lib/prisma";
import type { Task } from "@/lib/types";
import { ProjectsView } from "./projects-view";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  if (!hasDbEnv()) {
    return (
      <div>
        <PageHeader eyebrow="Workspace" title="Projects" />
        <EnvNotice />
      </div>
    );
  }

  const [projects, clients, team, taskOwnership] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.client.findMany({ select: { id: true, companyName: true }, orderBy: { companyName: "asc" } }),
    prisma.teamMember.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    // Used client-side to compute "projects the current creative is on"
    prisma.task.findMany({ select: { projectId: true, assigneeId: true } }),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        description="Engagements across clients, with managers and timelines."
      />
      <ProjectsView
        projects={projects}
        clients={clients}
        team={team}
        taskOwnership={taskOwnership as Pick<Task, "projectId" | "assigneeId">[]}
      />
    </div>
  );
}
