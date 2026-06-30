"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField, FormGrid } from "@/components/ui/form-field";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { TEAM_STATUSES, labelOf, type TeamMember } from "@/lib/types";

export function TeamForm({
  initial,
  onSubmit,
}: {
  initial?: TeamMember;
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
      <FormField label="Name" htmlFor="name">
        <Input id="name" name="name" required defaultValue={initial?.name ?? ""} />
      </FormField>
      <FormGrid>
        <FormField label="Role / title" htmlFor="role">
          <Input id="role" name="role" defaultValue={initial?.role ?? ""} placeholder="Designer, PM, …" />
        </FormField>
        <FormField label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={initial?.email ?? ""} />
        </FormField>
      </FormGrid>
      <FormField label="Status" htmlFor="status">
        <Select id="status" name="status" defaultValue={initial?.status ?? "active"}>
          {TEAM_STATUSES.map((s) => (
            <option key={s} value={s}>
              {labelOf(s)}
            </option>
          ))}
        </Select>
      </FormField>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={pending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save changes" : "Add member"}
        </Button>
      </DialogFooter>
    </form>
  );
}
