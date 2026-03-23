import { prisma } from "@/lib/prisma";
import { AlertRule, AlertCategory, AlertSeverity } from "@prisma/client";

export type AlertLogic = {
  dataSource: "INCOMES" | "EXPENSES" | "RESERVES" | "MEMBERS_DEBT" | "UNVERIFIED_EXPENSES";
  modifier: "CURRENT_MONTH" | "RUNWAY_MONTHS" | "COUNT" | "PERCENTAGE";
  operator: "<" | ">" | "=" | "<=" | ">=";
  compareTo: "STATIC" | "AVERAGE_6_MONTHS" | "BUDGET";
  compareValue: number;
};

export async function getAlertRules() {
  return await prisma.alertRule.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getActiveAlertRules() {
  return await prisma.alertRule.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createAlertRule(data: {
  name: string;
  description: string | null;
  category: AlertCategory;
  severity: AlertSeverity;
  logic: any;
  isActive?: boolean;
}) {
  return await prisma.alertRule.create({
    data: {
      ...data,
      logic: data.logic as any, // Prisma Json mapping
    },
  });
}

export async function updateAlertRule(
  id: string,
  data: Partial<{
    name: string;
    description: string | null;
    category: AlertCategory;
    severity: AlertSeverity;
    logic: any;
    isActive: boolean;
  }>
) {
  return await prisma.alertRule.update({
    where: { id },
    data: {
      ...data,
      ...(data.logic !== undefined ? { logic: data.logic as any } : {}),
    },
  });
}

export async function deleteAlertRule(id: string) {
  return await prisma.alertRule.delete({
    where: { id },
  });
}

export async function toggleAlertRule(id: string, isActive: boolean) {
  return await prisma.alertRule.update({
    where: { id },
    data: { isActive },
  });
}
