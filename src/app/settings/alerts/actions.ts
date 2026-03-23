"use server";

import { createAlertRule, updateAlertRule, deleteAlertRule, toggleAlertRule } from "@/lib/services/alertRuleService";
import { revalidatePath } from "next/cache";

export async function createRuleAction(data: any) {
  await createAlertRule(data);
  revalidatePath("/settings/alerts");
  revalidatePath("/dashboard");
}

export async function updateRuleAction(id: string, data: any) {
  await updateAlertRule(id, data);
  revalidatePath("/settings/alerts");
  revalidatePath("/dashboard");
}

export async function deleteRuleAction(id: string) {
  await deleteAlertRule(id);
  revalidatePath("/settings/alerts");
  revalidatePath("/dashboard");
}

export async function toggleRuleAction(id: string, isActive: boolean) {
  await toggleAlertRule(id, isActive);
  revalidatePath("/settings/alerts");
  revalidatePath("/dashboard");
}
