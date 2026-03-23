import { prisma } from "@/lib/prisma";
import { getConsolidatedBalances } from "@/lib/services/healthService";
import { DollarSign, ShieldAlert, HeartPulse, LineChart } from "lucide-react";

export default async function SimpleIndicators() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);
  const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  // 1. "Estamos gastando más de lo que entra" (Deficit mensual)
  const incomesMonth = await prisma.income.aggregate({ where: { date: { gte: startOfMonth }, currency: 'UYU' }, _sum: { amount: true } });
  const expensesMonth = await prisma.expense.aggregate({ where: { date: { gte: startOfMonth }, currency: 'UYU' }, _sum: { amount: true } });
  const isDeficit = (expensesMonth._sum.amount || 0) > (incomesMonth._sum.amount || 0);

  // 2. Meses de vida (Runway)
  const balances = await getConsolidatedBalances();
  const reservesUYU = balances.cashUYU + balances.bankUYU;
  const historicalExpenses = await prisma.expense.aggregate({
    where: { date: { gte: sixMonthsAgo, lt: startOfMonth }, currency: 'UYU' },
    _sum: { amount: true }
  });
  const burnRate = (historicalExpenses._sum.amount || 0) / 6;
  const runwayMonths = burnRate > 0 ? (reservesUYU / burnRate) : 999;

  // 3. % Miembros al día
  const activeMembers = await prisma.member.count({ where: { status: 'ACTIVE' } });
  const config = await prisma.config.findUnique({ where: { id: 'system-config' } }) || { monthsForDebt: 3 };
  const { calculateMemberDebt } = await import("@/lib/services/debtService");
  const members = await prisma.member.findMany({ where: { status: 'ACTIVE' }, include: { payments: true } });
  let membersUpToDate = 0;
  for (const m of members) {
    if (calculateMemberDebt(m, config).debtCount === 0) membersUpToDate++;
  }
  const complianceRate = activeMembers > 0 ? Math.round((membersUpToDate / activeMembers) * 100) : 0;

  // 4. Ingresos cayendo / creciendo (Mes actual vs Mes Pasado)
  const incomesPrevMonth = await prisma.income.aggregate({
    where: { date: { gte: startOfPreviousMonth, lt: startOfMonth }, currency: 'UYU' },
    _sum: { amount: true }
  });
  const prevIncome = incomesPrevMonth._sum.amount || 0;
  const currIncome = incomesMonth._sum.amount || 0;
  
  const incomeStatus = currIncome > prevIncome ? 'CRECIENDO' : currIncome < prevIncome ? 'CAYENDO' : 'ESTABLE';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className={`p-4 rounded-xl border ${isDeficit ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
        <div className="flex justify-between items-start mb-2">
          <DollarSign className="w-5 h-5" />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Balance del Mes</p>
        <p className="font-bold text-sm leading-tight">
          {isDeficit ? 'Gastamos más de lo que entra' : 'Ingresos superan gastos'}
        </p>
      </div>

      <div className={`p-4 rounded-xl border ${runwayMonths > 6 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : runwayMonths > 3 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
        <div className="flex justify-between items-start mb-2">
          <HeartPulse className="w-5 h-5" />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Supervivencia</p>
        <p className="font-bold text-sm leading-tight">
          Tenemos {runwayMonths > 99 ? '∞' : runwayMonths.toFixed(1)} meses de vida
        </p>
      </div>

      <div className={`p-4 rounded-xl border ${complianceRate > 80 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : complianceRate > 50 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
        <div className="flex justify-between items-start mb-2">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Salud Societaria</p>
        <p className="font-bold text-sm leading-tight">
          {complianceRate}% de miembros al día
        </p>
      </div>

      <div className={`p-4 rounded-xl border ${incomeStatus === 'CRECIENDO' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : incomeStatus === 'CAYENDO' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'}`}>
        <div className="flex justify-between items-start mb-2">
          <LineChart className="w-5 h-5" />
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mb-1">Tendencia Ingresos</p>
        <p className="font-bold text-sm leading-tight">
          Los ingresos están {incomeStatus.toLowerCase()}
        </p>
      </div>
    </div>
  );
}
