"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ClientStatus } from "@/lib/types";

function parseForm(form: FormData) {
  const get = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" && v.trim().length > 0 ? v.trim() : null;
  };
  const companyName = get("companyName");
  if (!companyName) throw new Error("Company name is required.");
  return {
    companyName,
    contactPerson: get("contactPerson"),
    email: get("email"),
    phone: get("phone"),
    industry: get("industry"),
    notes: get("notes"),
    status: (get("status") ?? "active") as ClientStatus,
  };
}

export async function createClient(form: FormData) {
  await prisma.client.create({ data: parseForm(form) });
  revalidatePath("/clients");
}

export async function updateClient(id: string, form: FormData) {
  await prisma.client.update({ where: { id }, data: parseForm(form) });
  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}
