import type { Role } from "@/components/role-context";
import type { Task } from "@/lib/types";

/**
 * Role + identity → what they can see and do. The single source of truth
 * for "can a creative reassign someone else's task" / "can finance create a
 * project" / "should this row be visible to this user" etc.
 *
 * Note: this is CLIENT-SIDE only. There's no real auth in this app, so a
 * determined user could call any server action directly. The permission
 * helpers gate the *UI* (hide buttons, filter lists). That's the demo
 * model — match the CLAUDE.md guardrails.
 */
export type Permissions = {
  // ---- Tasks ----
  canEditTaskStatus: (task: Pick<Task, "assigneeId">) => boolean;
  canEditTaskPriority: (task: Pick<Task, "assigneeId">) => boolean;
  canEditTaskAssignee: (task: Pick<Task, "assigneeId">) => boolean;
  canEditTask: (task: Pick<Task, "assigneeId">) => boolean;
  canDeleteTask: (task: Pick<Task, "assigneeId">) => boolean;
  canCreateTask: () => boolean;

  // ---- Projects ----
  canEditProject: () => boolean;
  canDeleteProject: () => boolean;
  canCreateProject: () => boolean;

  // ---- Clients ----
  canEditClient: () => boolean;
  canDeleteClient: () => boolean;
  canCreateClient: () => boolean;

  // ---- Team ----
  canEditTeam: () => boolean;

  // ---- Visibility helpers ----
  visibleTasks: <T extends Pick<Task, "assigneeId">>(tasks: T[]) => T[];
  visibleProjects: <T extends { id: string }>(
    projects: T[],
    allTasks: Pick<Task, "projectId" | "assigneeId">[]
  ) => T[];
  canSeeProject: (
    projectId: string,
    allTasks: Pick<Task, "projectId" | "assigneeId">[]
  ) => boolean;

  // ---- Meta (for conditional rendering) ----
  isCreative: boolean;
  isReadOnly: boolean;
};

export function getPermissions(
  role: Role,
  currentUserId: string | null
): Permissions {
  const isCreative = role === "creative";
  const isAdminOrPm = role === "admin" || role === "pm";
  const isFinance = role === "finance";

  const isMine = (task: Pick<Task, "assigneeId">) =>
    isCreative && currentUserId !== null && task.assigneeId === currentUserId;

  return {
    // Tasks — creatives only act on their own; can only change status (not
    // priority or assignee — those are the PM's call). Cannot delete.
    canEditTaskStatus: (task) => isAdminOrPm || isMine(task),
    canEditTaskPriority: () => isAdminOrPm,
    canEditTaskAssignee: () => isAdminOrPm,
    canEditTask: (task) => isAdminOrPm || isMine(task),
    canDeleteTask: () => isAdminOrPm,
    canCreateTask: () => isAdminOrPm || isCreative,

    // Projects — only admin/PM mutate. Finance + creative are read-only.
    canEditProject: () => isAdminOrPm,
    canDeleteProject: () => isAdminOrPm,
    canCreateProject: () => isAdminOrPm,

    // Clients — finance can edit (billing info) but only admin/PM create/delete.
    canEditClient: () => isAdminOrPm || isFinance,
    canDeleteClient: () => isAdminOrPm,
    canCreateClient: () => isAdminOrPm,

    // Team
    canEditTeam: () => isAdminOrPm,

    // Visibility
    visibleTasks: (tasks) =>
      isCreative && currentUserId
        ? tasks.filter((t) => t.assigneeId === currentUserId)
        : tasks,
    visibleProjects: (projects, allTasks) => {
      if (!isCreative || !currentUserId) return projects;
      const myIds = new Set(
        allTasks
          .filter((t) => t.assigneeId === currentUserId)
          .map((t) => t.projectId)
      );
      return projects.filter((p) => myIds.has(p.id));
    },
    canSeeProject: (projectId, allTasks) => {
      if (!isCreative || !currentUserId) return true;
      return allTasks.some(
        (t) => t.projectId === projectId && t.assigneeId === currentUserId
      );
    },

    isCreative,
    isReadOnly: isFinance,
  };
}
