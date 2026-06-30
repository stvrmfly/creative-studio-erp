import type {
  Client,
  ClientStatus,
  Project,
  ProjectStatus,
  Task,
  TaskPriority,
  TaskStatus,
  TeamMember,
  TeamStatus,
} from "@prisma/client";

export type {
  Client,
  ClientStatus,
  Project,
  ProjectStatus,
  Task,
  TaskPriority,
  TaskStatus,
  TeamMember,
  TeamStatus,
};

export const CLIENT_STATUSES: ClientStatus[] = ["active", "archived"];
export const TEAM_STATUSES: TeamStatus[] = ["active", "inactive"];
export const PROJECT_STATUSES: ProjectStatus[] = [
  "planning",
  "active",
  "review",
  "completed",
  "cancelled",
];
export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "completed"];
export const TASK_PRIORITIES: TaskPriority[] = ["low", "medium", "high", "urgent"];

export const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  archived: "Archived",
  inactive: "Inactive",
  planning: "Planning",
  review: "Review",
  completed: "Completed",
  cancelled: "Cancelled",
  todo: "To do",
  in_progress: "In progress",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function labelOf(value: string | null | undefined) {
  if (!value) return "—";
  return STATUS_LABEL[value] ?? value;
}
