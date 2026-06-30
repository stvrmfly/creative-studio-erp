"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormGrid } from "@/components/ui/form-field";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { CLIENT_STATUSES, labelOf, type Client } from "@/lib/types";

export function ClientForm({
  initial,
  onSubmit,
}: {
  initial?: Client;
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
      <FormField label="Company name" htmlFor="companyName">
        <Input
          id="companyName"
          name="companyName"
          required
          defaultValue={initial?.companyName ?? ""}
          placeholder="Acme Studio"
        />
      </FormField>

      <FormGrid>
        <FormField label="Contact person" htmlFor="contactPerson">
          <Input
            id="contactPerson"
            name="contactPerson"
            defaultValue={initial?.contactPerson ?? ""}
          />
        </FormField>
        <FormField label="Industry" htmlFor="industry">
          <Input id="industry" name="industry" defaultValue={initial?.industry ?? ""} placeholder="F&B, Tech, …" />
        </FormField>
        <FormField label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" defaultValue={initial?.email ?? ""} />
        </FormField>
        <FormField label="Phone" htmlFor="phone">
          <Input id="phone" name="phone" defaultValue={initial?.phone ?? ""} />
        </FormField>
      </FormGrid>

      <FormField label="Status" htmlFor="status">
        <Select id="status" name="status" defaultValue={initial?.status ?? "active"}>
          {CLIENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {labelOf(s)}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" defaultValue={initial?.notes ?? ""} rows={3} />
      </FormField>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={pending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : initial ? "Save changes" : "Create client"}
        </Button>
      </DialogFooter>
    </form>
  );
}
