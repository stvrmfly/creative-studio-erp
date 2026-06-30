"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TH, TBody, TR, TD, EmptyRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { TeamMember } from "@/lib/types";
import { TeamForm } from "./team-form";
import { createTeamMember, deleteTeamMember, updateTeamMember } from "./actions";

type TeamRow = TeamMember & { _count: { assigned: number } };

export function TeamView({ members }: { members: TeamRow[] }) {
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) =>
      [m.name, m.role, m.email].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
    );
  }, [members, query]);

  if (members.length === 0) {
    return (
      <EmptyState
        icon={UsersRound}
        title="No team members yet"
        description="Add the people working out of your studio so you can assign them to projects and tasks."
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> New Member
              </Button>
            </DialogTrigger>
            <DialogContent title="New team member">
              <TeamForm
                onSubmit={async (data) => {
                  await createTeamMember(data);
                  toast.success("Member added");
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
      <div className="mb-5 flex items-center gap-3">
        <Input
          placeholder="Search name, role, email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto">
              <Plus className="h-4 w-4" /> New Member
            </Button>
          </DialogTrigger>
          <DialogContent title="New team member">
            <TeamForm
              onSubmit={async (data) => {
                await createTeamMember(data);
                toast.success("Member added");
                setCreateOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <THead>
          <TH>Name</TH>
          <TH>Role</TH>
          <TH>Email</TH>
          <TH>Open Tasks</TH>
          <TH>Status</TH>
          <TH className="text-right">Actions</TH>
        </THead>
        <TBody>
          {filtered.length === 0 ? (
            <EmptyRow colSpan={6}>
              {members.length === 0 ? "No team members yet — add one." : "No matches."}
            </EmptyRow>
          ) : (
            filtered.map((m) => (
              <TR key={m.id} className="group">
                <TD className="font-medium text-primary">{m.name}</TD>
                <TD className="text-secondary">{m.role ?? "—"}</TD>
                <TD className="text-secondary">{m.email ?? "—"}</TD>
                <TD className="text-muted tabular">{m._count.assigned}</TD>
                <TD>
                  <StatusBadge status={m.status} kind="team" />
                </TD>
                <TD className="text-right">
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(m)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DeleteButton id={m.id} name={m.name} />
                  </div>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        {editing ? (
          <DialogContent title="Edit member" description={editing.name}>
            <TeamForm
              initial={editing}
              onSubmit={async (data) => {
                await updateTeamMember(editing.id, data);
                toast.success("Member updated");
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
      <DialogContent
        title="Delete member"
        description="Projects and tasks they own will keep working — their assignment will be cleared."
      >
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
                await deleteTeamMember(id);
                toast.success(`Removed ${name}`);
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
