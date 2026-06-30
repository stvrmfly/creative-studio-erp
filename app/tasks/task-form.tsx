"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormGrid } from "@/components/ui/form-field";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  labelOf,
  type Project,
  type Task,
  type TeamMember,
} from "@/lib/types";
import { toInputDate } from "@/lib/format";

export function TaskForm({
  initial,
  projects,
  team,
  onSubmit,
}: {
  initial?: Task;
  projects: Pick<Project, "id" | "name">[];
  team: Pick<TeamMember, "id" | "name">[];
  onSubmit: (form: FormData) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await onSubmit(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPending(false);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField label="Task name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={initial?.name ?? ""} />
      </FormField>

      <FormGrid>
        <FormField label="Project" htmlFor="projectId">
          <Select id="projectId" name="projectId" required defaultValue={initial?.projectId ?? ""}>
            <option value="" disabled>
              Select a project…
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Assignee" htmlFor="assigneeId">
          <Select id="assigneeId" name="assigneeId" defaultValue={initial?.assigneeId ?? ""}>
            <option value="">— unassigned —</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </FormField>
      </FormGrid>

      <FormGrid>
        <FormField label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={initial?.status ?? "todo"}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {labelOf(s)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Priority" htmlFor="priority">
          <Select id="priority" name="priority" defaultValue={initial?.priority ?? "medium"}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {labelOf(p)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Due date" htmlFor="dueDate">
          <Input id="dueDate" name="dueDate" type="date" defaultValue={toInputDate(initial?.dueDate)} />
        </FormField>
      </FormGrid>

      <FormField label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={initial?.description ?? ""} />
      </FormField>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={pending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save changes" : "Create task"}
        </Button>
      </DialogFooter>
    </form>
  );
}
