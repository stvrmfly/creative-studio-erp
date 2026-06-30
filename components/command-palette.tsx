"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  CheckSquare,
  FolderKanban,
  LayoutGrid,
  Plus,
  Users,
  UsersRound,
} from "lucide-react";
import {
  ROLE_ACCESS,
  useRole,
  usePermissions,
  type EntityKind,
} from "@/components/role-context";

type IndexItem = {
  id: string;
  type: EntityKind;
  label: string;
  sub?: string | null;
  href: string;
  assigneeIds: string[];
};

const PALETTE_EVENT = "citrus:open-palette";

/** Programmatically open the palette from anywhere. */
export function openPalette() {
  if (typeof document === "undefined") return;
  document.dispatchEvent(new Event(PALETTE_EVENT));
}

export function CommandPalette() {
  const router = useRouter();
  const { role, currentUserId } = useRole();
  const perms = usePermissions();
  const access = ROLE_ACCESS[role];
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<IndexItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, []);

  const loadIndex = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/search-index", { cache: "no-store" });
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadIndex();
  }, [open, loadIndex]);

  const filteredItems = useMemo(() => {
    // First pass: filter by entity types this role can see.
    const byKind = items.filter((i) => access.entities.includes(i.type));
    // Second pass: if creative + we know who they are, only show records
    // they're personally on (tasks they assigned to / projects they have tasks on).
    if (perms.isCreative && currentUserId) {
      return byKind.filter((i) => i.assigneeIds.includes(currentUserId));
    }
    return byKind;
  }, [items, access.entities, perms.isCreative, currentUserId]);

  function go(href: string) {
    setOpen(false);
    setSearch("");
    router.push(href);
  }

  const canSeeClients = access.routes.includes("/clients");
  const canSeeProjects = access.routes.includes("/projects");
  const canSeeTeam = access.routes.includes("/team");
  const canSeeTasks = access.routes.includes("/tasks");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-n-950/30 backdrop-blur-[2px] pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[92vw] max-w-xl overflow-hidden rounded-md border border-line bg-surface shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Command Palette" shouldFilter className="flex flex-col">
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search… or run an action"
            className="h-12 w-full border-b border-line bg-transparent px-5 text-sm outline-none placeholder:text-muted"
          />
          <Command.List className="max-h-[420px] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-muted">
              {loading ? "Indexing…" : "Nothing matches."}
            </Command.Empty>

            <Command.Group heading="Jump to" className="mb-1">
              <Heading>Jump to</Heading>
              <Row icon={LayoutGrid} label="Dashboard" onSelect={() => go("/")} />
              {canSeeClients ? (
                <Row icon={Users} label="Clients" onSelect={() => go("/clients")} />
              ) : null}
              {canSeeProjects ? (
                <Row icon={FolderKanban} label="Projects" onSelect={() => go("/projects")} />
              ) : null}
              {canSeeTeam ? (
                <Row icon={UsersRound} label="Team" onSelect={() => go("/team")} />
              ) : null}
              {canSeeTasks ? (
                <Row icon={CheckSquare} label="Tasks" onSelect={() => go("/tasks")} />
              ) : null}
            </Command.Group>

            <Command.Group heading="Actions" className="mt-1">
              <Heading>Actions</Heading>
              {canSeeClients ? (
                <Row
                  icon={Plus}
                  label="New client"
                  onSelect={() => go("/clients?new=1")}
                />
              ) : null}
              {canSeeProjects ? (
                <Row
                  icon={Plus}
                  label="New project"
                  onSelect={() => go("/projects?new=1")}
                />
              ) : null}
              {canSeeTasks ? (
                <Row icon={Plus} label="New task" onSelect={() => go("/tasks?new=1")} />
              ) : null}
            </Command.Group>

            {filteredItems.length > 0 ? (
              <Command.Group heading="Records">
                <Heading>Records</Heading>
                {filteredItems.map((item) => (
                  <Row
                    key={`${item.type}-${item.id}`}
                    icon={
                      item.type === "client"
                        ? Users
                        : item.type === "project"
                        ? FolderKanban
                        : CheckSquare
                    }
                    label={item.label}
                    hint={item.sub ?? undefined}
                    onSelect={() => go(item.href)}
                  />
                ))}
              </Command.Group>
            ) : null}
          </Command.List>

          <div className="flex items-center justify-between border-t border-line bg-app px-3 py-2 text-xs text-muted">
            <span>↵ to select · esc to close</span>
            <span className="font-mono">⌘K</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-label text-muted">
      {children}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  hint,
  onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-sm px-2 py-2 text-sm outline-none data-[selected=true]:bg-sunken data-[selected=true]:text-primary"
    >
      <Icon className="h-4 w-4 shrink-0 text-muted" />
      <span className="flex-1 truncate">{label}</span>
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </Command.Item>
  );
}
