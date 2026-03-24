import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  AlertCircle,
  Wallet,
  Landmark,
  Calendar,
  HeartHandshake,
  Lightbulb
} from 'lucide-react';
import { prisma } from "@/lib/prisma";
import DashboardCharts from './DashboardCharts';
import FinancialAlertsClient from './FinancialAlertsClient';
import { getFinancialHealth, getConsolidatedBalances } from '@/lib/services/healthService';
import SimpleIndicators from './SimpleIndicators';
import IncomesSection from './IncomesSection';
import ExpensesSection from './ExpensesSection';
import ProjectionsSection from './ProjectionsSection';
import DeviationDisplay from './DeviationDisplay';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  const session = await getServerSession(authOptions);
  const { 
    cashUYU, cashUSD, bankUYU, bankUSD, 
    lastArqueoDate, 
    pendingDeviationUYU, pendingDeviationUSD 
  } = await getConsolidatedBalances();
  const { alerts, lastArqueo } = await getFinancialHealth();

  const incomes = await prisma.income.findMany();
  const payments = await prisma.payment.findMany();
  const expenses = await prisma.expense.findMany();

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
      currency: p.currency,
      url: p.receiptUrl
    })),
    ...incomesData.map((i: any) => ({
      id: `i-${i.id}`,
      type: 'INCOME',
      date: i.date,
      title: `Ingreso - ${i.type.replace(/_/g, ' ')}`,
      amount: i.amount,
      currency: i.currency,
      url: i.imageProofUrl
    })),
    ...expensesData.map((e: any) => ({
      id: `e-${e.id}`,
      type: 'EXPENSE',
      date: e.date,
      title: `Gasto - ${e.category.replace(/_/g, ' ')}`,
      amount: e.amount,
      currency: e.currency,
      url: e.imageProofUrl
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

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const chartData = monthNames.map((name, index) => ({
    month: name,
    ingresos: incomes.filter(i => i.date.getMonth() === index && i.currency === 'UYU').reduce((a, b) => a + b.amount, 0) +
              payments.filter(p => p.date.getMonth() === index && p.currency === 'UYU').reduce((a, b) => a + b.amount, 0),
    gastos: expenses.filter(e => e.date.getMonth() === index && e.currency === 'UYU').reduce((a, b) => a + b.amount, 0),
  })).slice(0, currentMonth + 1);

  return (
    <div className="space-y-8">
      {/* 1. Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-4">
           <h3 className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            Alertas y Avisos
          </h3>
          <FinancialAlertsClient alerts={alerts.map(a => ({ ...a, date: a.date.toISOString() }))} />
        </div>
      )}

      {/* 2. Indicadores Simples */}
      <SimpleIndicators />

      {/* 2b. Desvíos y Arqueo (Subtle) */}
      <DeviationDisplay 
        lastArqueo={lastArqueo}
        pendingDeviationUYU={pendingDeviationUYU || 0}
        pendingDeviationUSD={pendingDeviationUSD || 0}
        userRole={(session?.user as any)?.role}
      />

      {/* 3. Disponibilidad de Fondos (Arqueo) */}
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

      {/* 4. Ingresos y Egresos Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <IncomesSection />
        <ExpensesSection />
      </div>

      {/* 5. Proyecciones y Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProjectionsSection />
        <div className="glass p-8 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Resumen de Ingresos vs Gastos</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs cursor-pointer hover:bg-white/10 transition-all">Este Año</span>
            </div>
          </div>
          <DashboardCharts data={chartData} />
        </div>
      </div>

      {/* 6. Actividad y Cultura */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-2xl border border-white/5 relative">
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
                  <div className="flex justify-between">
                    <p className="text-sm font-medium truncate">{activity.title}</p>
                    {activity.url && (
                      <Link href={activity.url} target="_blank" className="text-[10px] text-blue-400 hover:underline">
                        Ver recibo
                      </Link>
                    )}
                  </div>
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
        
        {/* Cultura Box */}
        <div className="glass p-8 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col justify-center space-y-8 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <HeartHandshake className="w-32 h-32 text-primary" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black italic gold-gradient mb-2">El tesoro es de todos</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              La transparencia y el orden financiero garantizan la sostenibilidad operativa de nuestro Taller.
            </p>
          </div>

          <div className="relative z-10 bg-background/50 p-4 rounded-xl border border-white/5 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h4 className="font-bold text-sm">¿Tienes una propuesta?</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Puedes presentar iniciativas para optimizar gastos o generar nuevos ingresos en las tenidas.
            </p>
            <Link href="/dashboard/proposals" className="w-full block text-center py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-colors border border-white/10">
              Ver Guía de Propuestas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
