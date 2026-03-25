import { prisma } from "@/lib/prisma";
import { Currency, Role } from "@prisma/client";

export type ActivityType = 'PAYMENT' | 'INCOME' | 'EXPENSE' | 'CASHCOUNT';

export interface ActivityFilter {
  type?: ActivityType | 'ALL';
  startDate?: Date;
  endDate?: Date;
  registeredById?: string;
  role?: Role;
}

export interface UnifiedActivity {
  id: string;
  type: ActivityType;
  date: Date;
  title: string;
  amount: number;
  currency: Currency;
  url?: string | null;
  registeredBy?: {
    name: string | null;
    role: Role;
  } | null;
}

export async function getActivities(filter: ActivityFilter = {}): Promise<UnifiedActivity[]> {
  const { type, startDate, endDate, registeredById, role } = filter;

  const dateFilter = {
    ...(startDate || endDate ? {
      date: {
        ...(startDate ? { gte: startDate } : {}),
        ...(endDate ? { lte: endDate } : {}),
      }
    } : {})
  };

  const userInclude = {
    include: {
      registeredBy: {
        select: {
          name: true,
          role: true,
        }
      }
    }
  };

  const activities: UnifiedActivity[] = [];

  // Fetch Payments
  if (!type || type === 'ALL' || type === 'PAYMENT') {
    const payments = await prisma.payment.findMany({
      where: {
        ...dateFilter,
        ...(registeredById ? { registeredById } : {}),
        ...(role ? { registeredBy: { role } } : {}),
      },
      include: {
        ...userInclude.include,
        member: { select: { fullName: true } }
      },
      orderBy: { date: 'desc' }
    });

    activities.push(...payments.map(p => ({
      id: `p-${p.id}`,
      type: 'PAYMENT' as ActivityType,
      date: p.date,
      title: `Pago - ${p.member?.fullName || 'Miembro desconocido'}`,
      amount: p.amount,
      currency: p.currency,
      url: p.receiptUrl,
      registeredBy: p.registeredBy
    })));
  }

  // Fetch Incomes
  if (!type || type === 'ALL' || type === 'INCOME') {
    const incomes = await prisma.income.findMany({
      where: {
        ...dateFilter,
        ...(registeredById ? { registeredById } : {}),
        ...(role ? { registeredBy: { role } } : {}),
      },
      ...userInclude,
      orderBy: { date: 'desc' }
    });

    activities.push(...incomes.map(i => ({
      id: `i-${i.id}`,
      type: 'INCOME' as ActivityType,
      date: i.date,
      title: `Ingreso - ${i.type.replace(/_/g, ' ')}`,
      amount: i.amount,
      currency: i.currency,
      url: i.imageProofUrl,
      registeredBy: i.registeredBy
    })));
  }

  // Fetch Expenses
  if (!type || type === 'ALL' || type === 'EXPENSE') {
    const expenses = await prisma.expense.findMany({
      where: {
        ...dateFilter,
        ...(registeredById ? { registeredById } : {}),
        ...(role ? { registeredBy: { role } } : {}),
      },
      ...userInclude,
      orderBy: { date: 'desc' }
    });

    activities.push(...expenses.map(e => ({
      id: `e-${e.id}`,
      type: 'EXPENSE' as ActivityType,
      date: e.date,
      title: `Gasto - ${e.category.replace(/_/g, ' ')}`,
      amount: e.amount,
      currency: e.currency,
      url: e.imageProofUrl,
      registeredBy: e.registeredBy
    })));
  }

  // Fetch CashCounts
  if (!type || type === 'ALL' || type === 'CASHCOUNT') {
    const cashCounts = await prisma.cashCount.findMany({
      where: {
        ...dateFilter,
        ...(registeredById ? { registeredById } : {}),
        ...(role ? { registeredBy: { role } } : {}),
      },
      ...userInclude,
      orderBy: { date: 'desc' }
    });

    activities.push(...cashCounts.map(c => ({
      id: `c-${c.id}`,
      type: 'CASHCOUNT' as ActivityType,
      date: c.date,
      title: 'Arqueo de caja registrado',
      amount: c.totalActualUYU,
      currency: 'UYU' as Currency,
      registeredBy: c.registeredBy
    })));
  }

  return activities.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
    },
    orderBy: {
      name: 'asc'
    }
  });
}
