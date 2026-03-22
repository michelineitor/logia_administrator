import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  AlertCircle,
  Wallet,
  Landmark,
  Calendar
} from 'lucide-react';
import { prisma } from "@/lib/prisma";
import DashboardCharts from './DashboardCharts';
import FinancialAlertsClient from './FinancialAlertsClient';
import { getFinancialHealth, getConsolidatedBalances } from '@/lib/services/healthService';

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `Hace ${Math.floor(interval)} años`;
  interval = seconds / 2592000;
  if (interval > 1) return `Hace ${Math.floor(interval)} meses`;
  interval = seconds / 86400;
  if (interval > 1) return `Hace ${Math.floor(interval)} días`;
  interval = seconds / 3600;
  if (interval > 1) return `Hace ${Math.floor(interval)} horas`;
  interval = seconds / 60;
  if (interval > 1) return `Hace ${Math.floor(interval)} minutos`;
  return "Hace instantes";
}

export default async function DashboardPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  const activeMembersCount = await prisma.member.count({ where: { status: 'ACTIVE' } });
  
  // Use the new consolidated balance service
  const { 
    cashUYU, 
    cashUSD, 
    bankUYU, 
    bankUSD, 
    lastArqueoDate 
  } = await getConsolidatedBalances();

  // Get Health Alerts
  const { alerts } = await getFinancialHealth();

  // Manual fetches for charts/stats (simplified for now)
  const incomes = await prisma.income.findMany();
  const payments = await prisma.payment.findMany();
  const expenses = await prisma.expense.findMany();

  // Load recent activity dynamically
  const [paymentsData, incomesData, expensesData, cashCountsData] = await Promise.all([
    prisma.payment.findMany({ include: { member: true }, orderBy: { date: 'desc' }, take: 5 }),
    prisma.income.findMany({ orderBy: { date: 'desc' }, take: 5 }),
    prisma.expense.findMany({ orderBy: { date: 'desc' }, take: 5 }),
    (prisma as any).cashCount.findMany({ orderBy: { date: 'desc' }, take: 5 })
  ]);

  const recentActivity = [
    ...paymentsData.map((p: any) => ({
      id: `p-${p.id}`,
      type: 'PAYMENT',
      date: p.date,
      title: `Pago registrado - ${p.member?.fullName || 'Miembro desconocido'}`,
      amount: p.amount,
      currency: p.currency
    })),
    ...incomesData.map((i: any) => ({
      id: `i-${i.id}`,
      type: 'INCOME',
      date: i.date,
      title: `Ingreso - ${i.type.replace(/_/g, ' ')}`,
      amount: i.amount,
      currency: i.currency
    })),
    ...expensesData.map((e: any) => ({
      id: `e-${e.id}`,
      type: 'EXPENSE',
      date: e.date,
      title: `Gasto - ${e.category.replace(/_/g, ' ')}`,
      amount: e.amount,
      currency: e.currency
    })),
    ...cashCountsData.map((c: any) => ({
      id: `c-${c.id}`,
      type: 'CASHCOUNT',
      date: c.date,
      title: 'Arqueo de caja registrado',
      amount: c.totalActualUYU,
      currency: 'UYU'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const incomesThisMonth = incomes
    .filter(i => i.date.getMonth() === currentMonth && i.currency === 'UYU')
    .reduce((a, b) => a + b.amount, 0) + 
    payments.filter(p => p.date.getMonth() === currentMonth && p.currency === 'UYU')
    .reduce((a, b) => a + b.amount, 0);
    
  const expensesThisMonth = expenses
    .filter(e => e.date.getMonth() === currentMonth && e.currency === 'UYU')
    .reduce((a, b) => a + b.amount, 0);

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const chartData = monthNames.map((name, index) => ({
    month: name,
    ingresos: incomes.filter(i => i.date.getMonth() === index && i.currency === 'UYU').reduce((a, b) => a + b.amount, 0) +
              payments.filter(p => p.date.getMonth() === index && p.currency === 'UYU').reduce((a, b) => a + b.amount, 0),
    gastos: expenses.filter(e => e.date.getMonth() === index && e.currency === 'UYU').reduce((a, b) => a + b.amount, 0),
  })).slice(0, currentMonth + 1);

  const balances = [
    { label: 'Efectivo UYU', value: cashUYU, currency: 'UYU', icon: Wallet },
    { label: 'Efectivo USD', value: cashUSD, currency: 'USD', icon: Wallet },
    { label: 'Caja Banco UYU', value: bankUYU, currency: 'UYU', icon: Landmark },
    { label: 'Caja Banco USD', value: bankUSD, currency: 'USD', icon: Landmark },
  ];

  const stats = [
    { label: 'Miembros Activos', value: activeMembersCount.toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Ingresos Mensuales', value: new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(incomesThisMonth), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Gastos Mensuales', value: new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(expensesThisMonth), icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    { label: 'Déficit Mensual', value: new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(incomesThisMonth - expensesThisMonth), icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Financial Health Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-4">
           <h3 className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            Salud del Tesoro (Alertas)
          </h3>
          <FinancialAlertsClient alerts={alerts.map(a => ({ ...a, date: a.date.toISOString() }))} />
        </div>
      )}

      {/* Balances Availability Grouped */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-sm font-bold tracking-widest text-primary uppercase flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Disponibilidad de Fondos Totales
          </h3>
          {lastArqueoDate && (
             <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <Calendar className="w-3 h-3" />
                Cierre de Caja: {lastArqueoDate.toLocaleDateString('es-UY')}
             </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* UYU Group */}
          <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-emerald-500/[0.03] to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-2">Total Pesos Uruguayos</p>
            <h2 className="text-5xl font-black mb-6 tracking-tight">
              {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(cashUYU + bankUYU)}
            </h2>
            <div className="flex gap-6 border-t border-white/5 pt-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Efectivo</p>
                  <p className="text-sm font-bold">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(cashUYU)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Landmark className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Banco</p>
                  <p className="text-sm font-bold">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(bankUYU)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* USD Group */}
          <div className="glass p-8 rounded-3xl border border-white/5 bg-gradient-to-br from-blue-500/[0.03] to-transparent relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="w-24 h-24" />
            </div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-2">Total Dólares USD</p>
            <h2 className="text-5xl font-black mb-6 tracking-tight">
              {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD' }).format(cashUSD + bankUSD)}
            </h2>
            <div className="flex gap-6 border-t border-white/5 pt-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Efectivo</p>
                  <p className="text-sm font-bold">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD' }).format(cashUSD)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Landmark className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-[8px] uppercase font-bold text-muted-foreground tracking-widest">Banco</p>
                  <p className="text-sm font-bold">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD' }).format(bankUSD)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        <div className="glass p-8 rounded-2xl border border-white/5 relative">
          <h3 className="text-lg font-bold mb-6">Actividad Reciente</h3>
          <div className="space-y-6">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay actividad reciente.</p>
            ) : recentActivity.map((activity, i) => (
              <div key={activity.id} className="flex gap-4 items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  activity.type === 'INCOME' || activity.type === 'PAYMENT' ? 'bg-emerald-400/20 text-emerald-400' :
                  activity.type === 'EXPENSE' ? 'bg-rose-400/20 text-rose-400' : 'bg-primary/20 text-primary'
                }`}>
                  {activity.type === 'PAYMENT' ? 'P' : activity.type === 'INCOME' ? 'I' : activity.type === 'EXPENSE' ? 'G' : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">{timeAgo(activity.date)}</p>
                    <p className={`text-xs font-bold ${
                      activity.type === 'EXPENSE' ? 'text-rose-400' : 
                      activity.type === 'CASHCOUNT' ? 'text-primary' : 'text-emerald-400'
                    }`}>
                      {activity.type === 'EXPENSE' ? '-' : activity.type !== 'CASHCOUNT' ? '+' : ''}
                      {new Intl.NumberFormat('es-UY', { style: 'currency', currency: activity.currency as any }).format(activity.amount)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
