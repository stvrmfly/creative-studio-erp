"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { DueDate } from "@/components/ui/due-date";
import { TASK_STATUSES, labelOf, type Task, type TaskStatus } from "@/lib/types";
import type { Permissions } from "@/lib/permissions";
import { setTaskStatus } from "./actions";

type BoardProps = {
  tasks: Task[];
  projectMap: Record<string, string>;
  teamMap: Record<string, string>;
  perms: Permissions;
  onEdit: (task: Task) => void;
};

export function TaskBoard({ tasks, projectMap, teamMap, perms, onEdit }: BoardProps) {
  const [items, setItems] = useState(tasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeHeight, setActiveHeight] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Re-sync when the server revalidates (or filters change) upstream.
  useEffect(() => setItems(tasks), [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const byStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], review: [], completed: [] };
    for (const t of items) map[t.status]?.push(t);
    return map;
  }, [items]);

  const activeTask = activeId ? items.find((t) => t.id === activeId) ?? null : null;
  const activeStatus = activeTask?.status ?? null;

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
    setActiveHeight(e.active.rect.current.initial?.height ?? null);
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const id = String(active.id);
    const target = over.id as TaskStatus;
    const task = items.find((t) => t.id === id);
    if (!task || task.status === target) return;
    if (!perms.canEditTaskStatus(task)) {
      toast.error("You can't move this task.");
      return;
    }
    const prev = items;
    setItems((cur) => cur.map((t) => (t.id === id ? { ...t, status: target } : t)));
    startTransition(async () => {
      try {
        await setTaskStatus(id, target);
        toast.success(`Moved to ${labelOf(target)}`);
      } catch {
        setItems(prev);
        toast.error("Move failed.");
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-2">
        {TASK_STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={byStatus[status]}
            projectMap={projectMap}
            teamMap={teamMap}
            perms={perms}
            onEdit={onEdit}
            activeStatus={activeStatus}
            activeHeight={activeHeight}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.2, 0, 0, 1)" }}>
        {activeTask ? (
          <div className="w-[256px] rotate-1">
            <CardBody task={activeTask} projectMap={projectMap} teamMap={teamMap} dragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  status,
  tasks,
  projectMap,
  teamMap,
  perms,
  onEdit,
  activeStatus,
  activeHeight,
}: {
  status: TaskStatus;
  tasks: Task[];
  activeStatus: TaskStatus | null;
  activeHeight: number | null;
} & Omit<BoardProps, "tasks">) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  // Show the ghost slot only when a card from another column is hovering here
  // (same-column hover is a no-op, so no placeholder).
  const showGhost = isOver && activeStatus !== null && activeStatus !== status;
  return (
    <div className="flex w-[280px] shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="text-xs font-semibold uppercase tracking-label text-muted">
          {labelOf(status)}
        </span>
        <span className="text-xs tabular text-muted">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className="flex min-h-[120px] flex-1 flex-col gap-2 rounded-md p-1"
      >
        {tasks.length === 0 && !showGhost ? (
          <div className="grid flex-1 place-items-center py-6 text-xs text-muted">No tasks</div>
        ) : (
          tasks.map((task) => (
            <DraggableCard
              key={task.id}
              task={task}
              projectMap={projectMap}
              teamMap={teamMap}
              canEdit={perms.canEditTaskStatus(task)}
              onEdit={onEdit}
            />
          ))
        )}
        {showGhost ? (
          <div aria-hidden className="drop-ghost shrink-0" style={{ height: activeHeight ?? 84 }} />
        ) : null}
      </div>
    </div>
  );
}

function DraggableCard({
  task,
  projectMap,
  teamMap,
  canEdit,
  onEdit,
}: {
  task: Task;
  projectMap: Record<string, string>;
  teamMap: Record<string, string>;
  canEdit: boolean;
  onEdit: (task: Task) => void;
}) {
  const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !canEdit,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform) }}
      onClick={() => onEdit(task)}
      className={cn(
        "text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
        canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && "opacity-40"
      )}
    >
      <CardBody task={task} projectMap={projectMap} teamMap={teamMap} />
    </div>
  );
}

function CardBody({
  task,
  projectMap,
  teamMap,
  dragging,
}: {
  task: Task;
  projectMap: Record<string, string>;
  teamMap: Record<string, string>;
  dragging?: boolean;
}) {
  const assignee = task.assigneeId ? teamMap[task.assigneeId] : null;
  return (
    <div
      className={cn(
        "rounded-md border border-line bg-surface p-3 shadow-sm transition-shadow",
        dragging && "shadow-md"
      )}
    >
      <div className="text-sm font-medium leading-snug text-primary">{task.name}</div>
      <div className="mt-1.5 truncate text-xs text-muted">{projectMap[task.projectId]}</div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={task.priority} kind="priority" />
          {task.dueDate ? <DueDate date={task.dueDate} className="text-xs" /> : null}
        </div>
        {assignee ? <Avatar name={assignee} size={22} /> : null}
      </div>
    </div>
  );
}
