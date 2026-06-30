"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { TaskPriority, TaskStatus } from "@/lib/types";

function parseForm(form: FormData) {
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
  };
  const name = get("name");
  const projectId = get("projectId");
  if (!name) throw new Error("Task name is required.");
  if (!projectId) throw new Error("Project is required.");
  const dueDateRaw = get("dueDate");
  return {
    name,
    description: get("description"),
    projectId,
    assigneeId: get("assigneeId"),
    dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    priority: (get("priority") ?? "medium") as TaskPriority,
    status: (get("status") ?? "todo") as TaskStatus,
  };
}

export async function createTask(form: FormData) {
  await prisma.task.create({ data: parseForm(form) });
  revalidatePath("/tasks");
}

export async function updateTask(id: string, form: FormData) {
  await prisma.task.update({ where: { id }, data: parseForm(form) });
  revalidatePath("/tasks");
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
}

export async function setTaskStatus(id: string, status: TaskStatus) {
  await prisma.task.update({ where: { id }, data: { status } });
  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function setTaskPriority(id: string, priority: TaskPriority) {
  await prisma.task.update({ where: { id }, data: { priority } });
  revalidatePath("/tasks");
}

export async function setTaskAssignee(id: string, assigneeId: string | null) {
  await prisma.task.update({ where: { id }, data: { assigneeId } });
  revalidatePath("/tasks");
  revalidatePath("/");
  revalidatePath("/team");
}
