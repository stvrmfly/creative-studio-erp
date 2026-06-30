"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { CheckSquare, Columns3, List, Plus } from "lucide-react";
import { toast } from "sonner";
import { daysUntil } from "@/lib/format";
import { Segmented } from "@/components/ui/segmented";
import { TaskBoard } from "./task-board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TH, TBody, EmptyRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TaskRow } from "@/components/task-row";
import { usePermissions } from "@/components/role-context";
import {
  TASK_STATUSES,
  labelOf,
  type Project,
  type Task,
  type TaskStatus,
  type TeamMember,
} from "@/lib/types";
import { useNewTrigger } from "@/lib/use-new-trigger";
import { TaskForm } from "./task-form";
import { createTask, updateTask } from "./actions";

const QUEUE_FILTERS = [
  { key: "all", label: "All" },
  { key: "overdue", label: "Overdue" },
  { key: "due-soon", label: "Due soon" },
  { key: "review", label: "Review" },
  { key: "unassigned", label: "Unassigned" },
] as const;

type QueueFilter = (typeof QUEUE_FILTERS)[number]["key"];

function parseQueue(value: string | undefined): QueueFilter {
  return QUEUE_FILTERS.some((f) => f.key === value) ? (value as QueueFilter) : "all";
}

/** Triage predicate shared with the dashboard cards that link here. */
function matchesQueue(t: Task, queue: QueueFilter): boolean {
  if (queue === "all") return true;
  if (queue === "review") return t.status === "review";
  const open = t.status !== "completed";
  if (queue === "unassigned") return open && !t.assigneeId;
  const d = daysUntil(t.dueDate);
  if (queue === "overdue") return open && d != null && d < 0;
  if (queue === "due-soon") return open && d != null && d >= 0 && d <= 7;
  return true;
}

export function TasksView({
  tasks,
  projects,
  team,
  initialFilter,
}: {
  tasks: Task[];
  projects: Pick<Project, "id" | "name">[];
  team: Pick<TeamMember, "id" | "name">[];
  initialFilter?: string;
}) {
  const perms = usePermissions();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [queue, setQueue] = useState<QueueFilter>(() => parseQueue(initialFilter));
  // Persist the view so it survives the re-render a drag-drop triggers
  // (setTaskStatus → revalidatePath) — otherwise a board drop snaps you to List.
  const [view, setViewState] = useState<"list" | "board">("list");
  useLayoutEffect(() => {
    const v = typeof window !== "undefined" ? localStorage.getItem("citrus.tasks.view") : null;
    if (v === "board" || v === "list") setViewState(v);
  }, []);
  const setView = (v: "list" | "board") => {
    setViewState(v);
    try {
      localStorage.setItem("citrus.tasks.view", v);
    } catch {
      /* storage unavailable */
    }
  };
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  useNewTrigger(() => {
    if (perms.canCreateTask()) setCreateOpen(true);
  });

  const projectMap = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, p.name])),
    [projects]
  );
  const teamMap = useMemo(() => Object.fromEntries(team.map((t) => [t.id, t.name])), [team]);

  // Role-aware visible task list — creative sees only their own.
  const visible = useMemo(() => perms.visibleTasks(tasks), [perms, tasks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visible.filter((t) => {
      if (!matchesQueue(t, queue)) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!q) return true;
      const haystack = [t.name, projectMap[t.projectId], t.description].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [visible, query, statusFilter, queue, projectMap]);

  if (visible.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No tasks yet"
        description="Tasks belong to a project and (optionally) get assigned to a team member. Add your first one to fill the board."
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent title="New task">
              <TaskForm
                projects={projects}
                team={team}
                onSubmit={async (data) => {
                  await createTask(data);
                  toast.success("Task created");
                  setCreateOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          ariaLabel="Filter tasks"
          value={queue}
          onChange={setQueue}
          options={QUEUE_FILTERS.map((f) => ({ value: f.key, label: f.label }))}
        />
        <Segmented
          ariaLabel="View"
          value={view}
          onChange={setView}
          options={[
            { value: "list", label: "List", icon: List },
            { value: "board", label: "Board", icon: Columns3 },
          ]}
        />
      </div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search task or project…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | TaskStatus)}
          className="w-44"
        >
          <option value="all">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {labelOf(s)}
            </option>
          ))}
        </Select>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="h-4 w-4" /> New Task
            </Button>
          </DialogTrigger>
          <DialogContent title="New task">
            <TaskForm
              projects={projects}
              team={team}
              onSubmit={async (data) => {
                await createTask(data);
                toast.success("Task created");
                setCreateOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {view === "board" ? (
        <TaskBoard
          tasks={filtered}
          projectMap={projectMap}
          teamMap={teamMap}
          perms={perms}
          onEdit={setEditing}
        />
      ) : (
        <Table>
          <THead>
            <TH>Task</TH>
            <TH>Project</TH>
            <TH>Assignee</TH>
            <TH>Due</TH>
            <TH>Priority</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </THead>
          <TBody>
            {filtered.length === 0 ? (
              <EmptyRow colSpan={7}>No matches.</EmptyRow>
            ) : (
              filtered.map((t) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  projectName={projectMap[t.projectId]}
                  team={team}
                  teamMap={teamMap}
                  onEdit={() => setEditing(t)}
                />
              ))
            )}
          </TBody>
        </Table>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        {editing ? (
          <DialogContent title="Edit task" description={editing.name}>
            <TaskForm
              initial={editing}
              projects={projects}
              team={team}
              onSubmit={async (data) => {
                await updateTask(editing.id, data);
                toast.success("Task updated");
                setEditing(null);
              }}
            />
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}
