'use server'

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getExpectedBalance(targetDateStr?: string) {
  const latestCount = await (prisma as any).cashCount.findFirst({
    orderBy: { date: 'desc' }
  });

  const startDate = latestCount ? latestCount.date : new Date(0);
  const targetDate = targetDateStr ? new Date(`${targetDateStr}T23:59:59Z`) : new Date();

  // Validate date is strictly after previous
  if (latestCount && targetDate <= latestCount.date) {
    return { 
      error: `La fecha debe ser posterior al último arqueo (${latestCount.date.toLocaleDateString()})`,
      expectedUYU: 0, 
      expectedUSD: 0, 
      previousCountId: null 
    };
  }

  // Get Incomes and Expenses since startDate up to targetDate
  const incomes = await prisma.income.findMany({
    where: { date: { gt: startDate, lte: targetDate } }
  });

  const expenses = await prisma.expense.findMany({
    where: { date: { gt: startDate, lte: targetDate } }
  });

  const payments = await prisma.payment.findMany({
    // @ts-ignore
    where: { date: { gt: startDate, lte: targetDate }, status: { not: 'CANCELADO' } }
  });

  // Calculate UYU differences
  const incomesUYU = incomes.filter(i => i.currency === 'UYU').reduce((a, b) => a + b.amount, 0);
  const paymentsUYU = payments.filter(p => p.currency === 'UYU').reduce((a, b) => a + b.amount, 0);
  const expensesUYU = expenses.filter(e => e.currency === 'UYU').reduce((a, b) => a + b.amount, 0);

  const netUYU = incomesUYU + paymentsUYU - expensesUYU;

  // Calculate USD differences
  const incomesUSD = incomes.filter(i => i.currency === 'USD').reduce((a, b) => a + b.amount, 0);
  const paymentsUSD = payments.filter(p => p.currency === 'USD').reduce((a, b) => a + b.amount, 0);
  const expensesUSD = expenses.filter(e => e.currency === 'USD').reduce((a, b) => a + b.amount, 0);

  const netUSD = incomesUSD + paymentsUSD - expensesUSD;

  // Expected = Previous Actual + Net
  const expectedUYU = (latestCount?.totalActualUYU || 0) + netUYU;
  const expectedUSD = (latestCount?.totalActualUSD || 0) + netUSD;

  return { expectedUYU, expectedUSD, previousCountId: latestCount?.id || null };
}

export async function registerCashCount(formData: FormData, userId: string) {
  try {
    const targetDateStr = formData.get("date") as string;
    const { expectedUYU, expectedUSD, previousCountId, error } = await getExpectedBalance(targetDateStr);

    if (error) {
      return { error };
    }

    const targetDate = targetDateStr ? new Date(`${targetDateStr}T12:00:00Z`) : new Date();

    const actualBankUYU = parseFloat(formData.get("actualBankUYU") as string) || 0;
    const actualCashUYU = parseFloat(formData.get("actualCashUYU") as string) || 0;
    const actualBankUSD = parseFloat(formData.get("actualBankUSD") as string) || 0;
    const actualCashUSD = parseFloat(formData.get("actualCashUSD") as string) || 0;
    const observations = formData.get("observations") as string;

    const totalActualUYU = actualBankUYU + actualCashUYU;
    const totalActualUSD = actualBankUSD + actualCashUSD;

    const deviationUYU = totalActualUYU - expectedUYU;
    const deviationUSD = totalActualUSD - expectedUSD;

    const newCount = await (prisma as any).cashCount.create({
      data: {
        date: targetDate,
        previousCountId,
        expectedUYU,
        expectedUSD,
        actualBankUYU,
        actualCashUYU,
        actualBankUSD,
        actualCashUSD,
        totalActualUYU,
        totalActualUSD,
        deviationUYU,
        deviationUSD,
        observations,
        registeredById: userId
      }
    });

    revalidatePath('/treasury/balance');
    return { success: true, count: newCount };
  } catch (error: any) {
    return { error: error.message || "Error registrando el arqueo de caja" };
  }
}

export async function getCashCountsHistory() {
  return await (prisma as any).cashCount.findMany({
    orderBy: { date: 'desc' },
    include: { registeredBy: true, clearedBy: true }
  });
}

export async function clearDeviations() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['ADMIN', 'LUMINAR'].includes((session.user as any).role)) {
      return { error: "No tienes permiso para realizar esta acción. Solo Administradores y Luminares pueden limpiar diferencias." };
    }

    const now = new Date();
    const userId = (session.user as any).id;
    await (prisma as any).$executeRaw`UPDATE "CashCount" SET "isCleared" = true, "clearedAt" = ${now}, "clearedById" = ${userId} WHERE "isCleared" = false`;

    revalidatePath('/dashboard');
    revalidatePath('/treasury/balance');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al limpiar las diferencias" };
  }
}

export async function approveCashCount(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "No autenticado" };
    
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (!['LUMINAR', 'TESORERO', 'ADMIN'].includes(role)) {
      return { error: "No tienes permiso para aprobar arqueos" };
    }

    const count = await (prisma as any).cashCount.findUnique({ where: { id } });
    if (!count) return { error: "Arqueo no encontrado" };

    const updateData: any = {};
    if (role === 'LUMINAR' || role === 'ADMIN') updateData.approvedByLuminarId = userId;
    if (role === 'TESORERO' || role === 'ADMIN') updateData.approvedByTesoreroId = userId;

    const updated = await (prisma as any).cashCount.update({
      where: { id },
      data: updateData
    });

    if (updated.approvedByLuminarId && updated.approvedByTesoreroId) {
      await (prisma as any).cashCount.update({
        where: { id },
        data: { status: 'APPROVED' }
      });
    }

    revalidatePath('/treasury/balance');
    revalidatePath('/treasury/audits');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al aprobar el arqueo" };
  }
}

export async function approveDifferenceResolution(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { error: "No autenticado" };
    
    const role = (session.user as any).role;
    const userId = (session.user as any).id;

    if (!['LUMINAR', 'TESORERO', 'ADMIN'].includes(role)) {
      return { error: "No tienes permiso para aprobar resoluciones" };
    }

    const count = await (prisma as any).cashCount.findUnique({ where: { id } });
    if (!count) return { error: "Arqueo no encontrado" };

    const updateData: any = {};
    if (role === 'LUMINAR' || role === 'ADMIN') updateData.resolvedByLuminarId = userId;
    if (role === 'TESORERO' || role === 'ADMIN') updateData.resolvedByTesoreroId = userId;

    const updated = await (prisma as any).cashCount.update({
      where: { id },
      data: updateData
    });

    if (updated.resolvedByLuminarId && updated.resolvedByTesoreroId) {
      await (prisma as any).cashCount.update({
        where: { id },
        data: { isCleared: true, clearedAt: new Date(), clearedById: userId }
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/treasury/balance');
    revalidatePath('/treasury/audits');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Error al aprobar la resolución" };
  }
}
