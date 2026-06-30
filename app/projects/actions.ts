"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@/lib/types";

function parseForm(form: FormData) {
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
  };
  const name = get("name");
  const clientId = get("clientId");
  if (!name) throw new Error("Project name is required.");
  if (!clientId) throw new Error("Client is required.");

  const budgetRaw = get("budget");
  const budget = budgetRaw == null ? null : Number(budgetRaw);
  if (budget != null && Number.isNaN(budget)) throw new Error("Budget must be a number.");

  const startDateRaw = get("startDate");
  const dueDateRaw = get("dueDate");

  return {
    name,
    description: get("description"),
    clientId,
    managerId: get("managerId"),
    budget,
    startDate: startDateRaw ? new Date(startDateRaw) : null,
    dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
    status: (get("status") ?? "planning") as ProjectStatus,
  };
}

export async function createProject(form: FormData) {
  await prisma.project.create({ data: parseForm(form) });
  revalidatePath("/projects");
  revalidatePath("/clients");
}

export async function updateProject(id: string, form: FormData) {
  await prisma.project.update({ where: { id }, data: parseForm(form) });
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
  revalidatePath("/clients");
}
