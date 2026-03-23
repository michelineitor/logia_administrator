import { prisma } from "@/lib/prisma";
import { Currency, PaymentMethod } from "@prisma/client";

export type FinancialAlert = {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  category: 'arqueo' | 'morosidad' | 'presupuesto';
  date: Date;
};

export async function getFinancialHealth() {
  const alerts: FinancialAlert[] = [];
  const now = new Date();

  // 1. Verificar Arqueo
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

  // 2. Verificar Morosidad (3+ meses)
  const config = await prisma.config.findUnique({ where: { id: 'system-config' } }) || { monthsForDebt: 3, monthlyFeeAmount: 500 };
  const { calculateMemberDebt } = await import("./debtService");
  const members = await prisma.member.findMany({
    where: { status: 'ACTIVE' },
    include: { payments: true }
  });

  let morososCount = 0;
  for (const m of members) {
    const { debtCount } = calculateMemberDebt(m, config);

    if (debtCount >= (config as any).monthsForDebt) {
      morososCount++;
    }
  }

  if (morososCount > 0) {
    alerts.push({
      id: 'summary-morosos',
      type: 'error',
      message: `Existen ${morososCount} miembros con ${(config as any).monthsForDebt} o más meses de deuda.`,
      category: 'morosidad',
      date: now
    });
  }

  // 3. Desviación de Media (Ingresos/Gastos)
  // Obtenemos últimos 6 meses (excluyendo el actual para la media)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  
  const historicalIncomes = await prisma.income.groupBy({
    by: ['currency'],
    where: { date: { gte: sixMonthsAgo, lt: new Date(now.getFullYear(), now.getMonth(), 1) } },
    _sum: { amount: true }
  });

  // Media mensual aproximada
  const avgIncomeUYU = (historicalIncomes.find(h => h.currency === 'UYU')?._sum.amount || 0) / 6;
  
  const currentMonthIncomes = await prisma.income.aggregate({
    where: { 
      date: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
      currency: 'UYU'
    },
    _sum: { amount: true }
  });

  const currentIncomeUYU = currentMonthIncomes._sum.amount || 0;
  if (avgIncomeUYU > 0 && currentIncomeUYU < avgIncomeUYU * 0.7) {
    alerts.push({
      id: 'low-income',
      type: 'info',
      message: `Los ingresos en UYU de este mes están un 30% por debajo de la media semestral.`,
      category: 'presupuesto',
      date: now
    });
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
