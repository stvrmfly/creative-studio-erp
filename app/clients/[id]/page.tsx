import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoGrid, InfoCell } from "@/components/ui/info-grid";
import { Table, THead, TH, TBody, TR, TD } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      projects: {
        include: {
          manager: { select: { name: true } },
          _count: { select: { tasks: { where: { status: { not: "completed" } } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) notFound();

  return (
    <div>
      <Link
        href="/clients"
        className="mb-4 inline-flex items-center gap-1 text-sm text-secondary hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All clients
      </Link>

      <PageHeader
        eyebrow="Client"
        title={client.companyName}
        description={client.contactPerson ? `Primary contact: ${client.contactPerson}` : undefined}
        actions={<StatusBadge status={client.status} kind="client" />}
      />

      <InfoGrid>
        <InfoCell label="Industry" value={client.industry ?? "—"} />
        <InfoCell label="Email" value={client.email ?? "—"} />
        <InfoCell label="Phone" value={client.phone ?? "—"} />
        <InfoCell label="Added" value={formatDate(client.createdAt)} />
      </InfoGrid>

      {client.notes ? (
        <div className="mt-4 rounded-md border border-line bg-surface p-5 shadow-sm">
          <div className="eyebrow mb-2">Notes</div>
          <p className="text-sm text-secondary">{client.notes}</p>
        </div>
      ) : null}

      <div className="mb-4 mt-10 flex items-baseline justify-between">
        <h2 className="section-title">Projects</h2>
        <span className="text-xs text-muted">{client.projects.length} total</span>
      </div>

      {client.projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects with this client"
          description="Create a project on the projects page and pick this client."
        />
      ) : (
        <Table>
          <THead>
            <TH>Project</TH>
            <TH>Manager</TH>
            <TH>Due</TH>
            <TH>Budget</TH>
            <TH>Open Tasks</TH>
            <TH>Status</TH>
          </THead>
          <TBody>
            {client.projects.map((p) => (
              <TR key={p.id} className="group">
                <TD className="font-medium text-primary">
                  <Link href={`/projects/${p.id}`} className="hover:underline">
                    {p.name}
                  </Link>
                </TD>
                <TD className="text-secondary">{p.manager?.name ?? "—"}</TD>
                <TD className="text-secondary tabular">{formatDate(p.dueDate)}</TD>
                <TD className="text-secondary tabular">{formatCurrency(p.budget)}</TD>
                <TD className="text-muted tabular">{p._count.tasks}</TD>
                <TD>
                  <StatusBadge status={p.status} kind="project" />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}
