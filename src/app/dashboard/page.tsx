import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { prisma } from "@/lib/prisma";
import DashboardCharts from './DashboardCharts';

export default async function DashboardPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const activeMembersCount = await prisma.member.count({ where: { status: 'ACTIVE' } });
  
  type Transaction = { date: Date; currency: string; amount: number };

  const incomes = await prisma.income.findMany({
    where: { date: { gte: new Date(currentYear, 0, 1) } }
  }) as Transaction[];
  
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: new Date(currentYear, 0, 1) } }
  }) as Transaction[];

  const incomesUYUThisMonth = incomes
    .filter((i: Transaction) => i.date.getMonth() === currentMonth && i.currency === 'UYU')
    .reduce((a: number, b: Transaction) => a + b.amount, 0);
    
  const expensesUYUThisMonth = expenses
    .filter((e: Transaction) => e.date.getMonth() === currentMonth && e.currency === 'UYU')
    .reduce((a: number, b: Transaction) => a + b.amount, 0);

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  const chartData = monthNames.map((name, index) => ({
    month: name,
    ingresos: incomes.filter((i: Transaction) => i.date.getMonth() === index && i.currency === 'UYU').reduce((a: number, b: Transaction) => a + b.amount, 0),
    gastos: expenses.filter((e: Transaction) => e.date.getMonth() === index && e.currency === 'UYU').reduce((a: number, b: Transaction) => a + b.amount, 0),
  })).slice(0, currentMonth + 1);

  const stats = [
    { label: 'Total Miembros', value: activeMembersCount.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Ingresos Mensuales', value: new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(incomesUYUThisMonth), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Gastos Mensuales', value: new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(expensesUYUThisMonth), icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Miembros en Mora', value: '0', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass p-6 rounded-2xl border border-white/5 card-hover transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Area */}
        <div className="lg:col-span-2 glass p-8 rounded-2xl border border-white/5 min-h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Resumen de Ingresos vs Gastos</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs cursor-pointer hover:bg-white/10 transition-all">Este Año</span>
            </div>
          </div>
          <DashboardCharts data={chartData} />
        </div>

        {/* Recent Activity */}
        <div className="glass p-8 rounded-2xl border border-white/5 disabled opacity-50 relative pointer-events-none">
          <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center rounded-2xl">
            <span className="text-xs font-bold bg-black px-3 py-1 rounded border border-white/10 tracking-widest uppercase">Próximamente</span>
          </div>
          <h3 className="text-lg font-bold mb-6">Actividad Reciente</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                  {i}
                </div>
                <div>
                  <p className="text-sm font-medium">Pago registrado - Miembro #{i * 123}</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
