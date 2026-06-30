"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Table, THead, TH, TBody } from "@/components/ui/table";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TaskRow } from "@/components/task-row";
import { TaskForm } from "@/app/tasks/task-form";
import { updateTask } from "@/app/tasks/actions";
import type { Project, Task, TeamMember } from "@/lib/types";

export function ProjectDetailTasks({
  tasks,
  team,
}: {
  tasks: Task[];
  team: Pick<TeamMember, "id" | "name">[];
}) {
  const [editing, setEditing] = useState<Task | null>(null);
  const teamMap = useMemo(() => Object.fromEntries(team.map((t) => [t.id, t.name])), [team]);

  return (
    <>
      <Table>
        <THead>
          <TH>Task</TH>
          <TH>Assignee</TH>
          <TH>Due</TH>
          <TH>Priority</TH>
          <TH>Status</TH>
          <TH className="text-right">Actions</TH>
        </THead>
        <TBody>
          {tasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              team={team}
              teamMap={teamMap}
              onEdit={() => setEditing(t)}
              showProject={false}
            />
          ))}
        </TBody>
      </Table>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        {editing ? (
          <DialogContent title="Edit task" description={editing.name}>
            <TaskForm
              initial={editing}
              projects={[{ id: editing.projectId, name: "" } as Pick<Project, "id" | "name">]}
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
    </>
  );
}
