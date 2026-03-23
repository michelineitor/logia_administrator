import { prisma } from "@/lib/prisma";
import { Currency, PaymentMethod } from "@prisma/client";
import { getActiveAlertRules, AlertLogic } from "./alertRuleService";

export type FinancialAlert = {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  category: 'arqueo' | 'morosidad' | 'presupuesto' | 'financiero' | 'operativo' | 'gobernanza' | string;
  date: Date;
};

export async function getFinancialHealth() {
  const alerts: FinancialAlert[] = [];
  const now = new Date();

  // 1. Verificar Arqueo (Base esencial)
  const lastArqueo = await (prisma as any).cashCount.findFirst({
    orderBy: { date: 'desc' }
  });

  if (!lastArqueo) {
    alerts.push({
      id: 'no-arqueo',
      type: 'error',
      message: 'No se ha registrado ningún arqueo de caja inicial.',
      category: 'arqueo',
      date: now
    });
  } else {
    const daysSince = Math.floor((now.getTime() - lastArqueo.date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 30) {
      alerts.push({
        id: 'arqueo-old',
        type: 'warning',
        message: `Hace ${daysSince} días que no se realiza un arqueo de caja. Se recomienda uno mensual.`,
        category: 'arqueo',
        date: now
      });
    }
  }

  // 2. Evaluate Dynamic Rules
  const dynamicRules = await getActiveAlertRules();
  
  if (dynamicRules.length > 0) {
    const config = await prisma.config.findUnique({ where: { id: 'system-config' } }) || { monthsForDebt: 3, monthlyFeeAmount: 500 };
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const incomesCurrentMonth = await prisma.income.aggregate({
      where: { date: { gte: startOfMonth }, currency: 'UYU' },
      _sum: { amount: true }
    });
    const currentUYUIncomes = incomesCurrentMonth._sum.amount || 0;

    const expensesCurrentMonth = await prisma.expense.aggregate({
      where: { date: { gte: startOfMonth }, currency: 'UYU' },
      _sum: { amount: true }
    });
    const currentUYUExpenses = expensesCurrentMonth._sum.amount || 0;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    const historicalIncomes = await prisma.income.aggregate({
      where: { date: { gte: sixMonthsAgo, lt: startOfMonth }, currency: 'UYU' },
      _sum: { amount: true }
    });
    const avgIncomeUYU = (historicalIncomes._sum.amount || 0) / 6;

    const historicalExpenses = await prisma.expense.aggregate({
      where: { date: { gte: sixMonthsAgo, lt: startOfMonth }, currency: 'UYU' },
      _sum: { amount: true }
    });
    const avgExpenseUYU = (historicalExpenses._sum.amount || 0) / 6;

    const balances = await getConsolidatedBalances();
    const reservesUYU = balances.cashUYU + balances.bankUYU;
    
    const activeMembers = await prisma.member.count({ where: { status: 'ACTIVE' } });
    let membersWithDebtCount = 0;
    
    const { calculateMemberDebt } = await import("./debtService");
    const members = await prisma.member.findMany({
      where: { status: 'ACTIVE' },
      include: { payments: true }
    });

    for (const m of members) {
      const { debtCount } = calculateMemberDebt(m, config);
      if (debtCount >= (config as any).monthsForDebt) {
        membersWithDebtCount++;
      }
    }

    const membersDebtPercentage = activeMembers > 0 ? (membersWithDebtCount / activeMembers) * 100 : 0;

    const unverifiedExpenses = await prisma.expense.count({
      where: { imageProofUrl: null }
    });

    for (const rule of dynamicRules) {
      const logic = rule.logic as any; // Cast as any or AlertLogic
      let leftValue = 0;
      let rightValue = 0;

      switch (logic.dataSource) {
        case "INCOMES":
          if (logic.modifier === "CURRENT_MONTH") leftValue = currentUYUIncomes;
          break;
        case "EXPENSES":
          if (logic.modifier === "CURRENT_MONTH") leftValue = currentUYUExpenses;
          break;
        case "RESERVES":
          if (logic.modifier === "RUNWAY_MONTHS") {
            leftValue = avgExpenseUYU > 0 ? reservesUYU / avgExpenseUYU : 999;
          }
          break;
        case "MEMBERS_DEBT":
          if (logic.modifier === "PERCENTAGE") leftValue = membersDebtPercentage;
          if (logic.modifier === "COUNT") leftValue = membersWithDebtCount;
          break;
        case "UNVERIFIED_EXPENSES":
          if (logic.modifier === "COUNT") leftValue = unverifiedExpenses;
          break;
      }

      switch (logic.compareTo) {
        case "STATIC":
          rightValue = logic.compareValue;
          break;
        case "AVERAGE_6_MONTHS":
          if (logic.dataSource === "INCOMES") rightValue = avgIncomeUYU * logic.compareValue;
          else if (logic.dataSource === "EXPENSES") rightValue = avgExpenseUYU * logic.compareValue;
          else rightValue = logic.compareValue;
          break;
        case "BUDGET":
          rightValue = 999999; // Placeholder
          break;
        case "EXPENSES_CURRENT_MONTH":
          rightValue = currentUYUExpenses;
          break;
      }

      let isTriggered = false;
      switch (logic.operator) {
        case "<": isTriggered = leftValue < rightValue; break;
        case ">": isTriggered = leftValue > rightValue; break;
        case "=": isTriggered = leftValue === rightValue; break;
        case "<=": isTriggered = leftValue <= rightValue; break;
        case ">=": isTriggered = leftValue >= rightValue; break;
      }

      if (isTriggered) {
        alerts.push({
          id: `rule-${rule.id}`,
          type: rule.severity === 'ERROR' ? 'error' : rule.severity === 'WARNING' ? 'warning' : 'info',
          message: rule.name + " - " + (rule.description || ""),
          category: rule.category === 'FINANCIAL' ? 'financiero' : rule.category === 'OPERATIONAL' ? 'operativo' : 'gobernanza',
          date: now
        });
      }
    }
  }

  return { alerts, lastArqueo };
}

export async function getConsolidatedBalances() {
  const lastArqueo = await (prisma as any).cashCount.findFirst({
    orderBy: { date: 'desc' }
  });

  const referenceDate = lastArqueo?.date || new Date(0);

  // Incomes since reference
  const incomes = await prisma.income.findMany({ where: { date: { gt: referenceDate } } });
  const expenses = await prisma.expense.findMany({ where: { date: { gt: referenceDate } } });
  const payments = await prisma.payment.findMany({ where: { date: { gt: referenceDate } } });

  const calc = (method: PaymentMethod, curr: Currency) => {
    // Starting point
    let base = 0;
    if (lastArqueo) {
      if (method === 'CASH') {
        base = curr === 'UYU' ? lastArqueo.actualCashUYU : lastArqueo.actualCashUSD;
      } else if (method === 'BANK_TRANSFER') {
        base = curr === 'UYU' ? lastArqueo.actualBankUYU : lastArqueo.actualBankUSD;
      }
    }

    const incSum = incomes.filter(i => i.method === method && i.currency === curr).reduce((a, b) => a + b.amount, 0);
    const paySum = payments.filter(p => p.method === method && p.currency === curr).reduce((a, b) => a + b.amount, 0);
    const expSum = expenses.filter(e => e.method === method && e.currency === curr).reduce((a, b) => a + b.amount, 0);
    
    return base + incSum + paySum - expSum;
  };

  return {
    cashUYU: calc('CASH', 'UYU'),
    cashUSD: calc('CASH', 'USD'),
    bankUYU: calc('BANK_TRANSFER', 'UYU'),
    bankUSD: calc('BANK_TRANSFER', 'USD'),
    lastArqueoDate: lastArqueo?.date
  };
}
