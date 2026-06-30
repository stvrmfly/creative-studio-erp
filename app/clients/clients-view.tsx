"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, THead, TH, TBody, TR, TD, EmptyRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Client } from "@/lib/types";
import { usePermissions } from "@/components/role-context";
import { useNewTrigger } from "@/lib/use-new-trigger";
import { ClientForm } from "./client-form";
import { createClient, deleteClient, updateClient } from "./actions";

type ClientRow = Client & { _count: { projects: number } };

export function ClientsView({ clients }: { clients: ClientRow[] }) {
  const perms = usePermissions();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  useNewTrigger(() => {
    if (perms.canCreateClient()) setCreateOpen(true);
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.companyName, c.contactPerson, c.industry, c.email]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [clients, query]);

  if (clients.length === 0) {
    return (
      <>
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first studio client to start tracking projects against them."
          action={
            perms.canCreateClient() ? (
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4" /> New Client
                  </Button>
                </DialogTrigger>
                <DialogContent title="New client" description="Add a studio client.">
                  <ClientForm
                    onSubmit={async (data) => {
                      await createClient(data);
                      toast.success("Client created");
                      setCreateOpen(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            ) : null
          }
        />
      </>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <Input
          placeholder="Search company, contact, industry…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        {perms.canCreateClient() ? (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="ml-auto">
                <Plus className="h-4 w-4" /> New Client
              </Button>
            </DialogTrigger>
            <DialogContent title="New client" description="Add a studio client.">
              <ClientForm
                onSubmit={async (data) => {
                  await createClient(data);
                  toast.success("Client created");
                  setCreateOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <Table>
        <THead>
          <TH>Company</TH>
          <TH>Contact</TH>
          <TH>Industry</TH>
          <TH>Projects</TH>
          <TH>Status</TH>
          <TH className="text-right">Actions</TH>
        </THead>
        <TBody>
          {filtered.length === 0 ? (
            <EmptyRow colSpan={6}>
              {clients.length === 0 ? "No clients yet — add your first one." : "No matches."}
            </EmptyRow>
          ) : (
            filtered.map((c) => (
              <TR key={c.id} className="group">
                <TD className="font-medium text-primary">
                  <Link href={`/clients/${c.id}`} className="hover:underline">
                    {c.companyName}
                  </Link>
                </TD>
                <TD className="text-secondary">{c.contactPerson ?? "—"}</TD>
                <TD className="text-secondary">{c.industry ?? "—"}</TD>
                <TD className="text-muted tabular">{c._count.projects}</TD>
                <TD>
                  <StatusBadge status={c.status} kind="client" />
                </TD>
                <TD className="text-right">
                  {perms.canEditClient() || perms.canDeleteClient() ? (
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {perms.canEditClient() ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditing(c)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {perms.canDeleteClient() ? (
                        <DeleteButton id={c.id} name={c.companyName} />
                      ) : null}
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
          <DialogContent title="Edit client" description={editing.companyName}>
            <ClientForm
              initial={editing}
              onSubmit={async (data) => {
                await updateClient(editing.id, data);
                toast.success("Client updated");
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
      <DialogContent title="Delete client" description="This will also remove their projects and tasks.">
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
                await deleteClient(id);
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
