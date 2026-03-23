import { prisma } from "@/lib/prisma";
import { getConsolidatedBalances } from "@/lib/services/healthService";
import { LineChart, Hourglass, Battery, TrendingUp, TrendingDown } from "lucide-react";

export default async function ProjectionsSection() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  // 1. Reservas
  const balances = await getConsolidatedBalances();
  const reservesUYU = balances.cashUYU + balances.bankUYU;

  // 2. Gastos e Ingresos Históricos (Promedio 6 meses)
  const historicalExpenses = await prisma.expense.aggregate({
    where: { date: { gte: sixMonthsAgo, lt: startOfMonth }, currency: 'UYU' },
    _sum: { amount: true }
  });
  const burnRate = (historicalExpenses._sum.amount || 0) / 6;

  const historicalIncomes = await prisma.income.aggregate({
    where: { date: { gte: sixMonthsAgo, lt: startOfMonth }, currency: 'UYU' },
    _sum: { amount: true }
  });
  const avgIncome = (historicalIncomes._sum.amount || 0) / 6;

  // 3. Current runway
  const runwayMonths = burnRate > 0 ? (reservesUYU / burnRate) : 999;
  
  // 4. Scenarios
  // Realista: Ingresos y gastos se mantienen igual al promedio
  // Optimista: Ingresos +15%, Gastos -5%
  // Pesimista: Ingresos -20%, Gastos +15%
  
  const generateScenario = (months: number, incMult: number, expMult: number) => {
    const netMonthly = (avgIncome * incMult) - (burnRate * expMult);
    return reservesUYU + (netMonthly * months);
  };

  const scenarios = [
    { label: "3 Meses", realista: generateScenario(3, 1, 1), optimista: generateScenario(3, 1.15, 0.95), pesimista: generateScenario(3, 0.8, 1.15) },
    { label: "6 Meses", realista: generateScenario(6, 1, 1), optimista: generateScenario(6, 1.15, 0.95), pesimista: generateScenario(6, 0.8, 1.15) },
    { label: "12 Meses", realista: generateScenario(12, 1, 1), optimista: generateScenario(12, 1.15, 0.95), pesimista: generateScenario(12, 0.8, 1.15) },
  ];

  return (
    <div className="glass p-6 rounded-2xl border border-blue-500/10 space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <LineChart className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Proyección y Sostenibilidad</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">El futuro financiero de la Logia</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Hourglass className="w-24 h-24 text-amber-500" />
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1 relative z-10 flex items-center gap-2">
            Burn Rate (Gasto Mensual Promedio)
          </p>
          <p className="text-2xl font-black text-rose-400 relative z-10">
            {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(burnRate)}
          </p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Battery className="w-24 h-24 text-emerald-500" />
          </div>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1 relative z-10 flex items-center gap-2">
             Runway (Meses de Supervivencia)
          </p>
          <div className="flex items-end gap-2 relative z-10">
            <p className={`text-3xl font-black ${runwayMonths > 6 ? 'text-emerald-400' : runwayMonths > 3 ? 'text-amber-400' : 'text-rose-400'}`}>
              {runwayMonths > 99 ? '∞' : runwayMonths.toFixed(1)}
            </p>
            <p className="mb-1 text-sm text-muted-foreground font-bold uppercase tracking-widest">Meses</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
          <span>Escenarios a Futuro (Reservas Estimadas)</span>
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-muted-foreground uppercase border-b border-white/5 bg-white/5">
              <tr>
                <th className="py-2 px-3 mix-blend-screen">Plazo</th>
                <th className="py-2 px-3 text-emerald-400">Optimista</th>
                <th className="py-2 px-3 text-blue-400">Realista</th>
                <th className="py-2 px-3 text-rose-400">Pesimista</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((sc, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-bold">{sc.label}</td>
                  <td className="py-3 px-3 font-medium text-emerald-400/80">
                    {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(sc.optimista)}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">
                    {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(sc.realista)}
                  </td>
                  <td className="py-3 px-3 font-medium text-rose-400/80">
                     {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(sc.pesimista)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
