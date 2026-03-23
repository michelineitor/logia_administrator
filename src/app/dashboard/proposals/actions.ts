"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitProposal(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;
  const authorName = formData.get("authorName") as string;

  if (!title || !description) {
    throw new Error("El título y la descripción son obligatorios.");
  }

  await (prisma as any).proposal.create({
    data: {
      title,
      description,
      category,
      authorName,
      status: 'PENDING'
    }
  });

  revalidatePath("/dashboard/proposals");
  revalidatePath("/dashboard");
}

export async function getProposals() {
  return await (prisma as any).proposal.findMany({
    orderBy: { createdAt: 'desc' }
  });
}
