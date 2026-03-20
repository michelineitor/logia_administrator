'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { IncomeType, ExpenseCategory, Currency, PaymentMethod } from "@prisma/client"

export async function getTransactions() {
  const incomes = await prisma.income.findMany({ orderBy: { date: 'desc' } });
  const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });
  
  const formattedIncomes = incomes.map((inc: any) => ({
    id: `inc-${inc.id}`,
    originalId: inc.id,
    type: 'INCOME' as const,
    category: inc.type,
    amount: inc.amount,
    currency: inc.currency,
    date: inc.date,
    comment: inc.comment,
    method: inc.method
  }));

  const formattedExpenses = expenses.map((exp: any) => ({
    id: `exp-${exp.id}`,
    originalId: exp.id,
    type: 'EXPENSE' as const,
    category: exp.category,
    amount: exp.amount,
    currency: exp.currency,
    date: exp.date,
    comment: exp.comment,
    method: exp.method
  }));

  const all = [...formattedIncomes, ...formattedExpenses].sort((a, b) => b.date.getTime() - a.date.getTime());
  return all;
}

export async function createIncome(formData: FormData) {
  try {
    await prisma.income.create({
      data: {
        amount: parseFloat(formData.get("amount") as string),
        currency: (formData.get("currency") as Currency) || "UYU",
        type: formData.get("type") as IncomeType,
        method: (formData.get("method") as PaymentMethod) || "CASH",
        comment: (formData.get("comment") as string) || null,
      }
    });
    revalidatePath('/treasury');
    return { success: true };
  } catch(e: any) {
    return { error: e.message || "Error al guardar el ingreso" };
  }
}

export async function createExpense(formData: FormData) {
  try {
    await prisma.expense.create({
      data: {
        amount: parseFloat(formData.get("amount") as string),
        currency: (formData.get("currency") as Currency) || "UYU",
        category: formData.get("category") as ExpenseCategory,
        method: (formData.get("method") as PaymentMethod) || "CASH",
        comment: (formData.get("comment") as string) || null,
      }
    });
    revalidatePath('/treasury');
    return { success: true };
  } catch(e: any) {
    return { error: e.message || "Error al guardar el gasto" };
  }
}
