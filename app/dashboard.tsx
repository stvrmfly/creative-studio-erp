"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUpRight, FolderKanban, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { InlinePicker } from "@/components/ui/dropdown";
import { ROLE_META, useRole } from "@/components/role-context";
import {
  TASK_STATUSES,
  labelOf,
  type ProjectStatus,
  type TaskStatus,
} from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { DueDate } from "@/components/ui/due-date";
import { setTaskStatus } from "@/app/tasks/actions";

export type DashboardData = {
  clients: { total: number; active: number };
  projects: Record<ProjectStatus, { count: number; budget: number }>;
  tasks: Record<TaskStatus, number>;
  tasksDueIn7d: number;
  /* Action queue — counts of work that needs a human, not things that exist.
     Each feeds a clickable triage card that deep-links into /tasks. */
  queue: {
    overdue: number;
    dueThisWeek: number;
    review: number;
    unassigned: number;
  };
  upcomingTasks: Array<{
    id: string;
    name: string;
    status: TaskStatus;
    dueDate: string | null;
    assigneeId: string | null;
    projectName: string;
    assigneeName: string | null;
  }>;
  projectsInFlight: Array<{
    id: string;
    name: string;
    status: ProjectStatus;
    clientName: string;
    openTasks: number;
    totalTasks: number;
    overdueTasks: number;
    dueDate: string | null;
  }>;
  topByBudget: Array<{
    id: string;
    name: string;
    status: ProjectStatus;
    budget: number;
    clientName: string;
  }>;
  teamWorkload: Array<{ id: string; name: string; openTasks: number }>;
  creativeStats: Array<{
    id: string;
    name: string;
    openTasks: number;
    dueThisWeek: number;
    inReview: number;
    completedTotal: number;
  }>;
  projectsByAssignee: Record<
    string,
    Array<{
      id: string;
      name: string;
      clientName: string;
      status: ProjectStatus;
      myOpenCount: number;
      myTotalCount: number;
    }>
  >;
};

export function Dashboard({ data }: { data: DashboardData }) {
  const { role } = useRole();
  if (role === "creative") return <CreativeView data={data} />;
  if (role === "finance") return <FinanceView data={data} />;

  const meta = ROLE_META[role];
  return (
    <div>
      <PageHeader eyebrow={meta.eyebrow} title="Dashboard" description={meta.desc} />
      {role === "admin" ? <AdminView data={data} /> : <PmView data={data} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Admin                                                              */
/* ------------------------------------------------------------------ */

function AdminView({ data }: { data: DashboardData }) {
  return (
    <>
      <TriageGrid queue={data.queue} />

      <SectionHead title="Where things stand" />
      <PanelGrid>
        <ProjectsInFlightPanel projects={data.projectsInFlight} />
        <DeadlinesPanel tasks={data.upcomingTasks} />
      </PanelGrid>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Project Manager                                                    */
/* ------------------------------------------------------------------ */

function PmView({ data }: { data: DashboardData }) {
  return (
    <>
      <TriageGrid queue={data.queue} />

      <SectionHead title="Workload & deadlines" />
      <PanelGrid>
        <DeadlinesPanel tasks={data.upcomingTasks} withAssignee />
        <Panel title="Team workload" count={data.teamWorkload.length} href="/team">
          {data.teamWorkload.length === 0 ? (
            <EmptyPanel>No active team members.</EmptyPanel>
          ) : (
            data.teamWorkload.map((m) => (
              <Row
                key={m.id}
                title={m.name}
                right={<span className="tabular text-secondary">{m.openTasks} open</span>}
              />
            ))
          )}
        </Panel>
      </PanelGrid>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Creative — personal queue                                          */
/* ------------------------------------------------------------------ */

function CreativeView({ data }: { data: DashboardData }) {
  const candidates = data.creativeStats;
  const { currentUserId } = useRole();
  const meId = currentUserId ?? candidates[0]?.id ?? "";
  const me = useMemo(() => candidates.find((c) => c.id === meId) ?? candidates[0], [candidates, meId]);
  const myTasks = useMemo(
    () => data.upcomingTasks.filter((t) => t.assigneeId === me?.id),
    [data.upcomingTasks, me]
  );
  const myProjects = useMemo(
    () => (me ? data.projectsByAssignee[me.id] ?? [] : []),
    [data.projectsByAssignee, me]
  );

  if (!me) {
    return (
      <div>
        <PageHeader eyebrow="Creative" title="Dashboard" />
        <EmptyPanel>No active team members to view as.</EmptyPanel>
      </div>
    );
  }

  const hero = myTasks.slice(0, 3);
  const later = myTasks.slice(3);
  const firstName = me.name.split(" ")[0];
  const heroColsClass =
    hero.length === 1
      ? "grid-cols-1"
      : hero.length === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div>
      <div className="mb-8">
        <div className="eyebrow mb-2">Creative</div>
        <h1 className="page-title">Hey, {firstName}</h1>
        <p className="mt-2 text-sm text-secondary">{briefing(me, myProjects.length)}</p>
      </div>

      {hero.length > 0 ? (
        <>
          <SectionHead title="Up next" />
          <div className={`grid gap-4 ${heroColsClass} max-[880px]:grid-cols-1`}>
            {hero.map((t) => (
              <UpNextCard key={t.id} task={t} />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-md border border-dashed border-line-strong bg-surface p-12 text-center">
          <Sparkles className="mx-auto mb-3 h-6 w-6 text-muted" />
          <h3 className="text-lg font-semibold text-primary">All clear</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-secondary">
            No open tasks assigned to {firstName}. Pick one up from{" "}
            <Link href="/tasks" className="underline">tasks</Link>.
          </p>
        </div>
      )}

      {myProjects.length > 0 ? (
        <>
          <SectionHead title="Projects you're on" />
          <div className="grid grid-cols-4 gap-2 max-[1100px]:grid-cols-3 max-[880px]:grid-cols-2 max-[560px]:grid-cols-1">
            {myProjects.slice(0, 8).map((p) => {
              const doneCount = p.myTotalCount - p.myOpenCount;
              const allDone = p.myOpenCount === 0;
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="hover-lift block rounded-md border border-line bg-surface p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-primary">{p.name}</div>
                      <div className="truncate text-xs text-muted">{p.clientName}</div>
                    </div>
                    <StatusBadge status={p.status} kind="project" />
                  </div>
                  <div className="mt-2 text-xs text-secondary">
                    {allDone ? (
                      <span className="font-medium text-primary">All done</span>
                    ) : (
                      <>
                        <span className="font-medium text-primary">
                          {p.myOpenCount} open task{p.myOpenCount === 1 ? "" : "s"}
                        </span>
                        {doneCount > 0 ? (
                          <span className="text-muted"> · {doneCount} done</span>
                        ) : null}
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : null}

      {later.length > 0 ? (
        <>
          <SectionHead title="Later" />
          <div className="overflow-hidden rounded-md border border-line bg-surface">
            {later.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-primary">{t.name}</div>
                  <div className="text-xs text-muted">{t.projectName}</div>
                </div>
                <DueDate date={t.dueDate} className="text-xs" />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function briefing(
  me: DashboardData["creativeStats"][number],
  projectCount: number
): string {
  if (me.openTasks === 0) return "Inbox zero — nothing waiting on you.";

  const taskPart = `${me.openTasks} open task${me.openTasks === 1 ? "" : "s"}`;
  const projectPart =
    projectCount > 0
      ? ` across ${projectCount} project${projectCount === 1 ? "" : "s"}`
      : "";

  const extras: string[] = [];
  if (me.dueThisWeek > 0) extras.push(`${me.dueThisWeek} due this week`);
  if (me.inReview > 0) extras.push(`${me.inReview} in review`);

  return `${taskPart}${projectPart}${extras.length ? `. ${extras.join(", ")}.` : "."}`;
}

function UpNextCard({
  task,
}: {
  task: DashboardData["upcomingTasks"][number];
}) {
  const [pending, startTransition] = useTransition();

  function changeStatus(v: TaskStatus) {
    startTransition(async () => {
      try {
        await setTaskStatus(task.id, v);
        toast.success(`Status → ${labelOf(v)}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Update failed");
      }
    });
  }

  return (
    <div
      className={`hover-lift flex min-h-[170px] flex-col gap-5 rounded-md border border-line bg-surface p-6 ${
        pending ? "opacity-60" : ""
      }`}
    >
      <div>
        <div className="eyebrow">{task.projectName}</div>
        <div className="mt-2 text-lg font-semibold leading-snug text-primary">{task.name}</div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3">
        <DueDate date={task.dueDate} className="text-xs" />
        <InlinePicker<TaskStatus>
          label="Status"
          value={task.status}
          options={TASK_STATUSES.map((s) => ({ value: s, label: labelOf(s) }))}
          onChange={changeStatus}
        >
          <StatusBadge status={task.status} kind="task" />
        </InlinePicker>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Finance — ledger view                                              */
/* ------------------------------------------------------------------ */

function FinanceView({ data }: { data: DashboardData }) {
  const billableBudget = data.projects.active.budget + data.projects.review.budget;
  const totalBudget = Object.values(data.projects).reduce((s, p) => s + p.budget, 0);
  const orderedStatuses: ProjectStatus[] = ["planning", "active", "review", "completed", "cancelled"];

  return (
    <div>
      <div className="mb-8">
        <div className="eyebrow mb-2">Finance</div>
        <h1 className="page-title">Billing position</h1>
        <p className="mt-2 text-sm text-secondary">
          Budget across every project on the books, billable vs. pending vs. closed.
        </p>
      </div>

      <div className="rounded-md border border-line bg-surface p-8 shadow-sm">
        <div className="eyebrow mb-3">Billable now</div>
        <div className="metric-value">{formatCurrency(billableBudget)}</div>
        <div className="mt-2 text-sm text-secondary">
          across <span className="font-medium text-primary">{data.projects.active.count}</span>{" "}
          active and{" "}
          <span className="font-medium text-primary">{data.projects.review.count}</span> in-review
          projects
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between text-xs">
            <span className="text-muted uppercase tracking-label font-semibold">Budget by status</span>
            <span className="tabular text-secondary">{formatCurrency(totalBudget)} total</span>
          </div>
          <StackedBar
            segments={orderedStatuses.map((s) => ({
              key: s,
              label: labelOf(s),
              value: data.projects[s].budget,
              tone: BUDGET_TONE[s],
            }))}
            total={totalBudget}
          />
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            {orderedStatuses.map((s) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${BUDGET_DOT[s]}`} />
                <span className="text-secondary">{labelOf(s)}</span>
                <span className="tabular text-muted">{formatCurrency(data.projects[s].budget)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionHead title="Top projects by budget" />
      <div className="overflow-hidden rounded-md border border-line bg-surface">
        {data.topByBudget.length === 0 ? (
          <EmptyPanel>No projects yet.</EmptyPanel>
        ) : (
          data.topByBudget.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FolderKanban className="h-4 w-4 shrink-0 text-muted" />
                <div>
                  <Link href={`/projects/${p.id}`} className="text-sm font-medium text-primary hover:underline">
                    {p.name}
                  </Link>
                  <div className="text-xs text-muted">{p.clientName}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={p.status} kind="project" />
                <span className="font-mono text-sm font-semibold tabular text-primary">
                  {formatCurrency(p.budget)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted">
        <Wallet className="h-3.5 w-3.5" />
        Invoicing is out of scope for the lite build — this view is the billing source of truth.
      </div>
    </div>
  );
}

const BUDGET_TONE: Record<ProjectStatus, string> = {
  planning: "bg-n-200",
  active: "bg-info-mid",
  review: "bg-warning-mid",
  completed: "bg-success-mid",
  cancelled: "bg-n-300",
};

const BUDGET_DOT: Record<ProjectStatus, string> = {
  planning: "bg-n-200",
  active: "bg-info-mid",
  review: "bg-warning-mid",
  completed: "bg-success-mid",
  cancelled: "bg-n-300",
};

function StackedBar({
  segments,
  total,
}: {
  segments: Array<{ key: string; label: string; value: number; tone: string }>;
  total: number;
}) {
  if (total === 0) {
    return <div className="h-3 w-full rounded-full bg-sunken" />;
  }
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-sunken">
      {segments.map((s) => {
        const pct = (s.value / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={s.key}
            className={`${s.tone} bar-expand`}
            style={{ ["--target-w" as string]: `${pct}%` } as React.CSSProperties}
            title={`${s.label}: ${formatCurrency(s.value)}`}
          />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

/* The triage row: four counts of work that needs a human. Each cell deep-links
   into the matching /tasks filter, so the dashboard doubles as a launchpad. */
const TRIAGE = [
  { key: "overdue", label: "Overdue", filter: "overdue" },
  { key: "dueThisWeek", label: "Due this week", filter: "due-soon" },
  { key: "review", label: "Awaiting review", filter: "review" },
  { key: "unassigned", label: "Unassigned", filter: "unassigned" },
] as const;

function TriageGrid({ queue }: { queue: DashboardData["queue"] }) {
  return (
    <MetricGrid>
      {TRIAGE.map((c) => {
        const value = queue[c.key];
        return (
          <Metric
            key={c.key}
            label={c.label}
            value={value}
            tone={c.key === "overdue" && value > 0 ? "danger" : "neutral"}
            href={`/tasks?filter=${c.filter}`}
          />
        );
      })}
    </MetricGrid>
  );
}

function ProjectsInFlightPanel({ projects }: { projects: DashboardData["projectsInFlight"] }) {
  return (
    <Panel title="Projects in flight" count={projects.length} href="/projects">
      {projects.length === 0 ? (
        <EmptyPanel>No active projects.</EmptyPanel>
      ) : (
        projects.slice(0, 6).map((p) => {
          const done = p.totalTasks - p.openTasks;
          return (
            <Row
              key={p.id}
              href={`/projects/${p.id}`}
              title={p.name}
              sub={`${p.clientName} · ${done}/${p.totalTasks} done`}
              right={
                <span className="flex items-center gap-2">
                  {p.overdueTasks > 0 ? (
                    <span className="font-medium text-danger">{p.overdueTasks} overdue</span>
                  ) : (
                    <span className="text-muted">{p.openTasks} open</span>
                  )}
                  <StatusBadge status={p.status} kind="project" />
                </span>
              }
            />
          );
        })
      )}
    </Panel>
  );
}

function DeadlinesPanel({
  tasks,
  withAssignee,
}: {
  tasks: DashboardData["upcomingTasks"];
  withAssignee?: boolean;
}) {
  return (
    <Panel title="Deadlines" count={tasks.length} href="/tasks?filter=due-soon">
      {tasks.length === 0 ? (
        <EmptyPanel>Nothing due.</EmptyPanel>
      ) : (
        tasks.slice(0, 6).map((t) => (
          <Row
            key={t.id}
            title={t.name}
            sub={withAssignee ? `${t.projectName} · ${t.assigneeName ?? "unassigned"}` : t.projectName}
            right={<DueDate date={t.dueDate} />}
          />
        ))
      )}
    </Panel>
  );
}

/* Metrics read as one divided stat strip — hairline dividers, not floating
   tiles. The `gap-px` over a `bg-line` parent paints the 1px rules in both
   axes so it reflows cleanly to a 2×2 grid below the breakpoint. */
function MetricGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-4 gap-px overflow-hidden rounded-md border border-line bg-line shadow-sm max-[880px]:grid-cols-2">
      {children}
    </div>
  );
}

function Metric({
  label,
  value,
  meta,
  tone = "neutral",
  href,
}: {
  label: string;
  value: number | string;
  meta?: string;
  /** Visual weight: `accent` = chartreuse rail, `danger` = red rail + value. */
  tone?: "neutral" | "accent" | "danger";
  /** When set, the whole cell is a link into a filtered list. */
  href?: string;
}) {
  const rail =
    tone === "danger" ? "bg-danger-mid" : tone === "accent" ? "bg-accent" : null;
  const body = (
    <div
      className={cn(
        "relative h-full bg-surface px-4 py-4 transition-colors",
        href && "hover:bg-sunken"
      )}
    >
      {rail ? <span className={cn("absolute inset-x-0 top-0 h-[2px]", rail)} /> : null}
      <div className="eyebrow mb-3 flex items-center gap-1.5">
        {label}
        {href ? (
          <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
        ) : null}
      </div>
      <div className={cn("metric-value", tone === "danger" ? "text-danger" : "text-primary")}>
        {value}
      </div>
      {meta ? <div className="mt-2 text-xs text-secondary">{meta}</div> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="group block">
      {body}
    </Link>
  ) : (
    body
  );
}

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-baseline justify-between">
      <h2 className="section-title">{title}</h2>
      {action}
    </div>
  );
}

function PanelGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1.4fr_1fr] gap-4 max-[880px]:grid-cols-1">{children}</div>
  );
}

function Panel({
  title,
  count,
  href,
  hrefLabel = "View all",
  children,
}: {
  title: string;
  count?: number;
  href?: string;
  hrefLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-primary">{title}</span>
          {count != null ? <span className="text-xs text-muted tabular">{count}</span> : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="text-xs text-secondary transition-colors hover:text-primary"
          >
            {hrefLabel}
          </Link>
        ) : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Row({
  title,
  sub,
  right,
  href,
}: {
  title: React.ReactNode;
  sub?: string;
  right?: React.ReactNode;
  href?: string;
}) {
  const inner = (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-sunken">
      <div className="flex min-w-0 flex-col gap-[1px]">
        <span className="truncate text-sm font-medium text-primary">{title}</span>
        {sub ? <span className="truncate text-xs text-muted">{sub}</span> : null}
      </div>
      {right ? <span className="shrink-0 text-xs text-secondary">{right}</span> : null}
    </div>
  );
  return (
    <div className="border-b border-line last:border-b-0">
      {href ? (
        <Link href={href} className="block">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

function EmptyPanel({ children }: { children: React.ReactNode }) {
  return <div className="px-4 py-8 text-center text-sm text-muted">{children}</div>;
}
