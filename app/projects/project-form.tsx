"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormGrid } from "@/components/ui/form-field";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
  PROJECT_STATUSES,
  labelOf,
  type Client,
  type Project,
  type TeamMember,
} from "@/lib/types";
import { toInputDate } from "@/lib/format";

export function ProjectForm({
  initial,
  clients,
  team,
  onSubmit,
}: {
  initial?: Project;
  clients: Pick<Client, "id" | "companyName">[];
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
      <FormField label="Project name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={initial?.name ?? ""} />
      </FormField>

      <FormGrid>
        <FormField label="Client" htmlFor="clientId">
          <Select id="clientId" name="clientId" required defaultValue={initial?.clientId ?? ""}>
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Manager" htmlFor="managerId">
          <Select id="managerId" name="managerId" defaultValue={initial?.managerId ?? ""}>
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
          <Select id="status" name="status" defaultValue={initial?.status ?? "planning"}>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {labelOf(s)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Budget" htmlFor="budget" hint="Plain number, no currency formatting">
          <Input
            id="budget"
            name="budget"
            type="number"
            min={0}
            step={1}
            defaultValue={initial?.budget ?? ""}
            placeholder="0"
          />
        </FormField>
        <FormField label="Start date" htmlFor="startDate">
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={toInputDate(initial?.startDate)}
          />
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
          {pending ? "Saving…" : initial ? "Save changes" : "Create project"}
        </Button>
      </DialogFooter>
    </form>
  );
}
