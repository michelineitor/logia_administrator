import { prisma } from "@/lib/prisma";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";

export default async function IncomesSection() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Totales
  const incomesMonth = await prisma.income.aggregate({
    where: { date: { gte: startOfMonth }, currency: 'UYU' },
    _sum: { amount: true }
  });
  const paymentsMonth = await prisma.payment.aggregate({
    where: { date: { gte: startOfMonth }, currency: 'UYU' },
    _sum: { amount: true }
  });
  const totalMonth = (incomesMonth._sum.amount || 0) + (paymentsMonth._sum.amount || 0);

  const incomesYear = await prisma.income.aggregate({
    where: { date: { gte: startOfYear }, currency: 'UYU' },
    _sum: { amount: true }
  });
  const paymentsYear = await prisma.payment.aggregate({
    where: { date: { gte: startOfYear }, currency: 'UYU' },
    _sum: { amount: true }
  });
  const totalYear = (incomesYear._sum.amount || 0) + (paymentsYear._sum.amount || 0);

  // Desglose del año
  const cuotas = paymentsYear._sum.amount || 0;
  
  const incomesYearList = await prisma.income.groupBy({
    by: ['type'],
    where: { date: { gte: startOfYear }, currency: 'UYU' },
    _sum: { amount: true }
  });

  const donaciones = incomesYearList.filter(i => i.type === 'DONATIVOS_RECIBIDOS' || i.type === 'COLECTAS_SACO_BENEFICO').reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);
  const eventosYOtros = totalYear - cuotas - donaciones;

  // Tasa de cumplimiento
  const activeMembers = await prisma.member.count({ where: { status: 'ACTIVE' } });
  const config = await prisma.config.findUnique({ where: { id: 'system-config' } }) || { monthsForDebt: 3 };
  const { calculateMemberDebt } = await import("@/lib/services/debtService");
  
  const members = await prisma.member.findMany({
    where: { status: 'ACTIVE' },
    include: { payments: true }
  });

  let membersUpToDate = 0;
  for (const m of members) {
    const { debtCount } = calculateMemberDebt(m, config);
    if (debtCount === 0) {
      membersUpToDate++;
    }
  }

  const complianceRate = activeMembers > 0 ? Math.round((membersUpToDate / activeMembers) * 100) : 0;

  // Promedio por sesión
  const sessions = await prisma.lodgeSession.findMany({
    where: { date: { gte: startOfYear } },
    include: { incomes: { where: { currency: 'UYU' } } }
  });

  const sessionIncomes = sessions.map(s => s.incomes.reduce((acc, i) => acc + i.amount, 0));
  const totalSessionIncome = sessionIncomes.reduce((a, b) => a + b, 0);
  const avgSessionIncome = sessions.length > 0 ? totalSessionIncome / sessions.length : 0;

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-emerald-500/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Ingresos</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">¿De dónde viene el dinero?</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Este Mes</p>
          <p className="text-2xl font-black text-emerald-400">
            {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(totalMonth)}
          </p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Este Año</p>
          <p className="text-2xl font-black">
            {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(totalYear)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Desglose (Año)</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Cuotas</span>
            <span className="font-medium">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(cuotas)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Donaciones / Saco</span>
            <span className="font-medium">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(donaciones)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-400"></div> Eventos / Otros</span>
            <span className="font-medium">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(eventosYOtros)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-3 h-3 text-emerald-400" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Al día</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-xl font-bold">{complianceRate}%</span>
            <span className="text-xs text-muted-foreground mb-1">miembros</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-400 h-full" style={{ width: `${complianceRate}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-3 h-3 text-primary" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Media Sesión</p>
          </div>
          <p className="text-lg font-bold">
            {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(avgSessionIncome)}
          </p>
        </div>
      </div>
    </div>
  );
}
