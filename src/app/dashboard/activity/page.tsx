import React from 'react';
import { getActivities, getAllUsers, ActivityType } from "@/lib/services/activityService";
import { Role } from "@prisma/client";
import ActivityFilters from "./ActivityFilters";
import Link from "next/link";
import { 
  ChevronLeft, 
  FileText, 
  Calendar, 
  User as UserIcon, 
  BadgeCheck,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Wallet
} from "lucide-react";

export const dynamic = 'force-dynamic';

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

const roleLabels: Record<Role, string> = {
  ADMIN: 'Admin',
  TESORERO: 'Tesorero',
  VICE_TESORERO: 'Vice Tesorero',
  LUMINAR: 'Luminar',
  SECRETARIO_ACTAS: 'Secretario Actas',
  MEMBER: 'Miembro',
  GUEST: 'Invitado'
};

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: { 
    type?: string; 
    startDate?: string; 
    endDate?: string; 
    userId?: string; 
    role?: string;
  };
}) {
  const filters = {
    type: searchParams.type as ActivityType | 'ALL',
    startDate: searchParams.startDate ? new Date(searchParams.startDate) : undefined,
    endDate: searchParams.endDate ? new Date(searchParams.endDate) : undefined,
    registeredById: searchParams.userId,
    role: searchParams.role as Role,
  };

  const [activities, users] = await Promise.all([
    getActivities(filters),
    getAllUsers(),
  ]);

  return (
    <>
      <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard" 
          className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-widest"
        >
          <ChevronLeft className="w-3 h-3" />
          Volver al Dashboard
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Registro de Actividad</h1>
            <p className="text-muted-foreground text-sm mt-1">Historial completo de movimientos y registros del sistema.</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Resultados</p>
            <p className="text-2xl font-black">{activities.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ActivityFilters users={users} />

      {/* Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actividad</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monto</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Registrado por</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Evidencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No se encontraron actividades que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                activities.map((activity) => (
                  <tr key={activity.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{activity.date.toLocaleDateString('es-UY')}</span>
                        <span className="text-[10px] text-muted-foreground">{timeAgo(activity.date)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          activity.type === 'INCOME' || activity.type === 'PAYMENT' ? 'bg-emerald-400/10 text-emerald-400' :
                          activity.type === 'EXPENSE' ? 'bg-rose-400/10 text-rose-400' : 'bg-primary/10 text-primary'
                        }`}>
                          {activity.type === 'PAYMENT' ? <ArrowUpRight className="w-4 h-4" /> : 
                           activity.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : 
                           activity.type === 'EXPENSE' ? <ArrowDownLeft className="w-4 h-4" /> : 
                           <RefreshCw className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-bold group-hover:text-primary transition-colors">{activity.title}</span>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{activity.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`text-sm font-black ${
                        activity.type === 'EXPENSE' ? 'text-rose-400' : 
                        activity.type === 'CASHCOUNT' ? 'text-primary' : 'text-emerald-400'
                      }`}>
                        {activity.type === 'EXPENSE' ? '-' : activity.type !== 'CASHCOUNT' ? '+' : ''}
                        {new Intl.NumberFormat('es-UY', { style: 'currency', currency: activity.currency }).format(activity.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {activity.registeredBy ? (
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                            <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{activity.registeredBy.name || 'Sin nombre'}</span>
                            <div className="flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3 text-primary" />
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                {roleLabels[activity.registeredBy.role] || activity.registeredBy.role}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Sistema</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {activity.url ? (
                        <Link 
                          href={activity.url} 
                          target="_blank" 
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition-colors border border-blue-400/20"
                          title="Ver Comprobante"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      ) : (
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-30">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}
