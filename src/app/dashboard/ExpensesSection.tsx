import { prisma } from "@/lib/prisma";
import { TrendingDown, Receipt, FileText } from "lucide-react";
import Link from "next/link";

export default async function ExpensesSection() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Totales
  const expensesMonth = await prisma.expense.aggregate({
    where: { date: { gte: startOfMonth }, currency: 'UYU' },
    _sum: { amount: true }
  });
  const totalMonth = expensesMonth._sum.amount || 0;

  const expensesYear = await prisma.expense.aggregate({
    where: { date: { gte: startOfYear }, currency: 'UYU' },
    _sum: { amount: true }
  });
  const totalYear = expensesYear._sum.amount || 0;

  // Gastos grandes recientes (mes actual)
  const largeExpenses = await prisma.expense.findMany({
    where: { date: { gte: startOfMonth }, currency: 'UYU' },
    orderBy: { amount: 'desc' },
    take: 3,
    include: { registeredBy: true }
  });

  // Desglose por categoría (año)
  const categoriesYear = await prisma.expense.groupBy({
    by: ['category'],
    where: { date: { gte: startOfYear }, currency: 'UYU' },
    _sum: { amount: true }
  });

  const sortedCategories = categoriesYear
    .map(c => ({ name: c.category.replace(/_/g, ' '), amount: c._sum.amount || 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4); // Top 4 categories

  const othersAmount = categoriesYear.reduce((acc, c) => acc + (c._sum.amount || 0), 0) - sortedCategories.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="glass p-6 rounded-2xl border border-rose-500/10 space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-rose-500/10 rounded-lg">
          <TrendingDown className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h3 className="font-bold text-lg">Egresos</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Transparencia: ¿en qué se usa?</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Este Mes</p>
          <p className="text-2xl font-black text-rose-400">
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
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex justify-between">
          <span>Desglose por Categoría (Año)</span>
        </h4>
        <div className="space-y-2 text-sm">
          {sortedCategories.map((cat, i) => (
            <div key={i} className="flex justify-between items-center group">
              <span className="truncate pr-4 text-xs font-medium text-foreground/80">{cat.name}</span>
              <span className="font-bold whitespace-nowrap">
                {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(cat.amount)}
              </span>
            </div>
          ))}
          {othersAmount > 0 && (
            <div className="flex justify-between items-center group">
              <span className="text-xs font-medium text-foreground/80">OTRAS CATEGORÍAS</span>
              <span className="font-bold whitespace-nowrap">
                {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(othersAmount)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
          <Receipt className="w-3 h-3 text-rose-400" />
          Gastos Mayores Recientes
        </h4>
        <div className="space-y-3">
          {largeExpenses.length === 0 ? (
            <p className="text-xs text-muted-foreground">No hay gastos en el mes actual.</p>
          ) : largeExpenses.map(exp => (
            <div key={exp.id} className="bg-white/5 p-3 rounded-lg border border-white/5 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <p className="text-xs font-bold truncate pr-2" title={exp.category.replace(/_/g, ' ')}>{exp.category.replace(/_/g, ' ')}</p>
                <p className="text-sm font-black text-rose-400 whitespace-nowrap">
                  {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(exp.amount)}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground flex justify-between border-t border-white/5 pt-1 mt-1">
                <span>Por: {exp.registeredBy?.name || 'Sistema'}</span>
                <span>{exp.date.toLocaleDateString('es-UY')}</span>
              </p>
              {exp.imageProofUrl ? (
                <Link href={exp.imageProofUrl} target="_blank" className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1 mt-1">
                   <FileText className="w-3 h-3" /> Ver Comprobante
                </Link>
              ) : (
                <span className="text-[10px] font-bold text-rose-400/50 flex items-center gap-1 mt-1">
                   Sin comprobante
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
