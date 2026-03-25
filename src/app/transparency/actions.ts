'use server'

import { prisma } from "@/lib/prisma"
import { IncomeType, ExpenseCategory, Currency } from "@prisma/client"

export async function getMonthlyTransparencyData(month: number, year: number) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Initial equity of the YEAR (per user request: "arqueo de caja del año")
    const yearStart = new Date(year, 0, 1);
    const firstCountOfYear = await (prisma as any).cashCount.findFirst({
      where: { date: { gte: yearStart } },
      orderBy: { date: 'asc' }
    });

    // Initial equity of the MONTH
    const previousMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);
    const lastCountBeforeMonth = await (prisma as any).cashCount.findFirst({
      where: { date: { lte: previousMonthEnd } },
      orderBy: { date: 'desc' }
    });

    const incomes = await prisma.income.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' }
    });

    const expenses = await prisma.expense.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' }
    });

    const payments = await prisma.payment.findMany({
      where: { 
        date: { gte: startDate, lte: endDate },
        status: 'COMPLETADO'
      },
      include: { member: true },
      orderBy: { date: 'asc' }
    });

    // Current month audit (for "Situación de los Fondos")
    // Workaround: fetch all and filter in JS due to prisma sync issues
    const audits = await (prisma as any).cashCount.findMany({
      where: { 
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'desc' }
    });
    const monthAudit = audits.find((a: any) => a.status === 'APPROVED');

    // Accumulated for the year up to the end of this month
    const yearIncomes = await prisma.income.findMany({
      where: { date: { gte: yearStart, lte: endDate } }
    });
    const yearExpenses = await prisma.expense.findMany({
      where: { date: { gte: yearStart, lte: endDate } }
    });
    const yearPayments = await prisma.payment.findMany({
      where: { date: { gte: yearStart, lte: endDate }, status: 'COMPLETADO' }
    });

    return {
      success: true,
      data: {
        firstCountOfYear,
        lastCountBeforeMonth,
        incomes,
        expenses,
        payments,
        monthAudit,
        yearTotals: {
          incomes: yearIncomes,
          expenses: yearExpenses,
          payments: yearPayments
        }
      }
    };
  } catch (error: any) {
    return { error: error.message || "Error al obtener datos de transparencia" };
  }
}
