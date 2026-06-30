import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckSquare } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoGrid, InfoCell } from "@/components/ui/info-grid";
import { Table, THead, TH, TBody } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { ProjectDetailTasks } from "./tasks-section";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [project, team] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        manager: true,
        tasks: {
          orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
        },
      },
    }),
    prisma.teamMember.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!project) notFound();

  return (
    <div>
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1 text-sm text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All projects
      </Link>

      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={
          <>
            for{" "}
            <Link href={`/clients/${project.clientId}`} className="text-primary hover:underline">
              {project.client.companyName}
            </Link>
          </>
        }
        actions={<StatusBadge status={project.status} kind="project" />}
      />

      <InfoGrid>
        <InfoCell label="Manager" value={project.manager?.name ?? "—"} />
        <InfoCell label="Budget" value={formatCurrency(project.budget)} />
        <InfoCell label="Starts" value={formatDate(project.startDate)} />
        <InfoCell label="Due" value={formatDate(project.dueDate)} />
      </InfoGrid>

      {project.description ? (
        <div className="mt-4 rounded-md border border-line bg-surface p-5 shadow-sm">
          <div className="eyebrow mb-2">Description</div>
          <p className="text-sm text-secondary">{project.description}</p>
        </div>
      ) : null}

      <div className="mb-4 mt-10 flex items-baseline justify-between">
        <h2 className="section-title">Tasks</h2>
        <span className="text-xs text-muted">{project.tasks.length} total</span>
      </div>

      {project.tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks on this project"
          description="Add tasks from the tasks page (link them to this project) to start tracking work."
        />
      ) : (
        <ProjectDetailTasks tasks={project.tasks} team={team} />
      )}
    </div>
  );
}
