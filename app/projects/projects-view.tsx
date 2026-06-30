"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TH, TBody, TR, TD, EmptyRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  PROJECT_STATUSES,
  labelOf,
  type Client,
  type Project,
  type ProjectStatus,
  type TeamMember,
} from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { useNewTrigger } from "@/lib/use-new-trigger";
import { usePermissions } from "@/components/role-context";
import { ProjectForm } from "./project-form";
import { createProject, deleteProject, updateProject } from "./actions";
import type { Task } from "@/lib/types";

export function ProjectsView({
  projects,
  clients,
  team,
  taskOwnership,
}: {
  projects: Project[];
  clients: Pick<Client, "id" | "companyName">[];
  team: Pick<TeamMember, "id" | "name">[];
  taskOwnership: Pick<Task, "projectId" | "assigneeId">[];
}) {
  const perms = usePermissions();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  useNewTrigger(() => {
    if (perms.canCreateProject()) setCreateOpen(true);
  });

  const visibleProjects = useMemo(
    () => perms.visibleProjects(projects, taskOwnership),
    [perms, projects, taskOwnership]
  );

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c.companyName])),
    [clients]
  );
  const teamMap = useMemo(() => Object.fromEntries(team.map((t) => [t.id, t.name])), [team]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleProjects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [p.name, clientMap[p.clientId], p.description].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [visibleProjects, query, statusFilter, clientMap]);

  if (visibleProjects.length === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title={
          projects.length === 0
            ? "No projects yet"
            : "No projects assigned to you"
        }
        description={
          projects.length === 0
            ? "Projects link to a client and (optionally) a manager. Tasks roll up under projects."
            : "Once a PM assigns you to a task on a project, it'll show up here."
        }
        action={
          perms.canCreateProject() ? (
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              </DialogTrigger>
              <DialogContent title="New project" description="Projects link to a client and a manager.">
                <ProjectForm
                  clients={clients}
                  team={team}
                  onSubmit={async (data) => {
                    await createProject(data);
                    toast.success("Project created");
                    setCreateOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          ) : null
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search project or client…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | ProjectStatus)}
          className="w-44"
        >
          <option value="all">All statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {labelOf(s)}
            </option>
          ))}
        </Select>
        {perms.canCreateProject() ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto">
                <Plus className="h-4 w-4" /> New Project
              </Button>
            </DialogTrigger>
            <DialogContent title="New project" description="Projects link to a client and a manager.">
              <ProjectForm
                clients={clients}
                team={team}
                onSubmit={async (data) => {
                  await createProject(data);
                  toast.success("Project created");
                  setCreateOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <Table>
        <THead>
          <TH>Project</TH>
          <TH>Client</TH>
          <TH>Manager</TH>
          <TH>Due</TH>
          <TH>Budget</TH>
          <TH>Status</TH>
          <TH className="text-right">Actions</TH>
        </THead>
        <TBody>
          {filtered.length === 0 ? (
            <EmptyRow colSpan={7}>
              {projects.length === 0 ? "No projects yet — create one." : "No matches."}
            </EmptyRow>
          ) : (
            filtered.map((p) => (
              <TR key={p.id} className="group">
                <TD className="font-medium text-primary">
                  <Link href={`/projects/${p.id}`} className="hover:underline">
                    {p.name}
                  </Link>
                </TD>
                <TD className="text-secondary">
                  <Link href={`/clients/${p.clientId}`} className="hover:underline">
                    {clientMap[p.clientId] ?? "—"}
                  </Link>
                </TD>
                <TD className="text-secondary">{p.managerId ? teamMap[p.managerId] ?? "—" : "—"}</TD>
                <TD className="text-secondary tabular">{formatDate(p.dueDate)}</TD>
                <TD className="text-secondary tabular">{formatCurrency(p.budget)}</TD>
                <TD>
                  <StatusBadge status={p.status} kind="project" />
                </TD>
                <TD className="text-right">
                  {perms.canEditProject() ? (
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(p)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <DeleteButton id={p.id} name={p.name} />
                    </div>
                  ) : null}
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        {editing ? (
          <DialogContent title="Edit project" description={editing.name}>
            <ProjectForm
              initial={editing}
              clients={clients}
              team={team}
              onSubmit={async (data) => {
                await updateProject(editing.id, data);
                toast.success("Project updated");
                setEditing(null);
              }}
            />
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent title="Delete project" description="This will also remove its tasks.">
        <p className="text-sm text-secondary">
          Delete <span className="font-medium text-primary">{name}</span>?
        </p>
        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button
            disabled={pending}
            onClick={async () => {
              setPending(true);
              try {
                await deleteProject(id);
                toast.success(`Deleted ${name}`);
                setOpen(false);
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
