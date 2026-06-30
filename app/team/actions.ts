"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { TeamStatus } from "@/lib/types";

function parseForm(form: FormData) {
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
  };
  const name = get("name");
  if (!name) throw new Error("Name is required.");
  return {
    name,
    role: get("role"),
    email: get("email"),
    status: (get("status") ?? "active") as TeamStatus,
  };
}

export async function createTeamMember(form: FormData) {
  await prisma.teamMember.create({ data: parseForm(form) });
  revalidatePath("/team");
}

export async function updateTeamMember(id: string, form: FormData) {
  await prisma.teamMember.update({ where: { id }, data: parseForm(form) });
  revalidatePath("/team");
}

export async function deleteTeamMember(id: string) {
  await prisma.teamMember.delete({ where: { id } });
  revalidatePath("/team");
  revalidatePath("/projects");
  revalidatePath("/tasks");
}
