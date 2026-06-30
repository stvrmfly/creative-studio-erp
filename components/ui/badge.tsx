import * as React from "react";
import { cn } from "@/lib/cn";
import type { ClientStatus, ProjectStatus, TaskPriority, TaskStatus, TeamStatus } from "@/lib/types";
import { labelOf } from "@/lib/types";

type Tone =
  | "neutral"
  | "muted"
  | "accent"
  | "outline"
  | "ghost"
  | "strike"
  | "success"
  | "warning"
  | "danger"
  | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-sunken text-secondary",
  muted: "bg-sunken text-muted",
  accent: "bg-accent text-accent-fg",
  outline: "bg-surface text-primary border border-line-strong",
  ghost: "bg-transparent text-secondary border border-dashed border-line-strong",
  strike: "bg-sunken text-muted line-through",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "badge-transition inline-flex items-center rounded-sm px-1.5 py-[1px] text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const PROJECT_TONE: Record<ProjectStatus, Tone> = {
  planning: "ghost",
  active: "info",
  review: "warning",
  completed: "success",
  cancelled: "strike",
};

const TASK_TONE: Record<TaskStatus, Tone> = {
  todo: "ghost",
  in_progress: "info",
  review: "warning",
  completed: "success",
};

const PRIORITY_TONE: Record<TaskPriority, Tone> = {
  low: "muted",
  medium: "neutral",
  high: "warning",
  urgent: "danger",
};

const CLIENT_TONE: Record<ClientStatus, Tone> = {
  active: "neutral",
  archived: "muted",
};

const TEAM_TONE: Record<TeamStatus, Tone> = {
  active: "neutral",
  inactive: "muted",
};

export function StatusBadge({
  status,
  kind,
}: {
  status: string;
  kind: "project" | "task" | "priority" | "client" | "team";
}) {
  let tone: Tone = "neutral";
  if (kind === "project") tone = PROJECT_TONE[status as ProjectStatus] ?? "neutral";
  else if (kind === "task") tone = TASK_TONE[status as TaskStatus] ?? "neutral";
  else if (kind === "priority") tone = PRIORITY_TONE[status as TaskPriority] ?? "neutral";
  else if (kind === "client") tone = CLIENT_TONE[status as ClientStatus] ?? "neutral";
  else if (kind === "team") tone = TEAM_TONE[status as TeamStatus] ?? "neutral";
  return <Badge tone={tone}>{labelOf(status)}</Badge>;
}
