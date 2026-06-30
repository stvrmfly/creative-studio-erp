"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { TR, TD } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { InlinePicker } from "@/components/ui/dropdown";
import { usePermissions } from "@/components/role-context";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  labelOf,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type TeamMember,
} from "@/lib/types";
import { DueDate } from "@/components/ui/due-date";
import {
  deleteTask,
  setTaskAssignee,
  setTaskPriority,
  setTaskStatus,
} from "@/app/tasks/actions";

export function TaskRow({
  task,
  projectName,
  team,
  teamMap,
  onEdit,
  showProject = true,
}: {
  task: Task;
  projectName?: string;
  team: Pick<TeamMember, "id" | "name">[];
  teamMap: Record<string, string>;
  onEdit: () => void;
  showProject?: boolean;
}) {
  const perms = usePermissions();
  const [pending, startTransition] = useTransition();

  function update(label: string, fn: () => Promise<void>) {
    startTransition(async () => {
      try {
        await fn();
        toast.success(label);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  const canStatus = perms.canEditTaskStatus(task);
  const canPriority = perms.canEditTaskPriority(task);
  const canAssignee = perms.canEditTaskAssignee(task);
  const canEdit = perms.canEditTask(task);
  const canDelete = perms.canDeleteTask(task);
  const hasAnyAction = canEdit || canDelete;

  return (
    <TR className={`group ${pending ? "opacity-60" : ""}`}>
      <TD className="font-medium text-primary">{task.name}</TD>
      {showProject ? <TD className="text-secondary">{projectName ?? "—"}</TD> : null}
      <TD className="text-secondary">
        {canAssignee ? (
          <InlinePicker<string>
            label="Assign to"
            value={task.assigneeId ?? ""}
            options={[
              { value: "", label: "— unassigned —" },
              ...team.map((m) => ({ value: m.id, label: m.name })),
            ]}
            onChange={(v) =>
              update(
                v ? `Assigned to ${teamMap[v]}` : "Unassigned",
                () => setTaskAssignee(task.id, v || null)
              )
            }
          >
            <span className="rounded-sm px-2 py-1 hover:bg-sunken">
              {task.assigneeId ? teamMap[task.assigneeId] ?? "—" : "— unassigned —"}
            </span>
          </InlinePicker>
        ) : (
          <span className="px-2 py-1">
            {task.assigneeId ? teamMap[task.assigneeId] ?? "—" : "— unassigned —"}
          </span>
        )}
      </TD>
      <TD>
        <DueDate date={task.dueDate} done={task.status === "completed"} />
      </TD>
      <TD>
        {canPriority ? (
          <InlinePicker<TaskPriority>
            label="Priority"
            value={task.priority}
            options={TASK_PRIORITIES.map((p) => ({ value: p, label: labelOf(p) }))}
            onChange={(v) => update(`Priority → ${labelOf(v)}`, () => setTaskPriority(task.id, v))}
          >
            <StatusBadge status={task.priority} kind="priority" />
          </InlinePicker>
        ) : (
          <StatusBadge status={task.priority} kind="priority" />
        )}
      </TD>
      <TD>
        {canStatus ? (
          <InlinePicker<TaskStatus>
            label="Status"
            value={task.status}
            options={TASK_STATUSES.map((s) => ({ value: s, label: labelOf(s) }))}
            onChange={(v) => update(`Status → ${labelOf(v)}`, () => setTaskStatus(task.id, v))}
          >
            <StatusBadge status={task.status} kind="task" />
          </InlinePicker>
        ) : (
          <StatusBadge status={task.status} kind="task" />
        )}
      </TD>
      <TD className="text-right">
        {hasAnyAction ? (
          <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {canEdit ? (
              <Button variant="ghost" size="sm" onClick={onEdit} aria-label="Edit">
                <Pencil className="h-4 w-4" />
              </Button>
            ) : null}
            {canDelete ? <TaskDeleteButton id={task.id} name={task.name} /> : null}
          </div>
        ) : null}
      </TD>
    </TR>
  );
}

export function TaskDeleteButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent title="Delete task">
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
                await deleteTask(id);
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
