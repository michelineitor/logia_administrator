import { 
  Settings, 
  Shield, 
  Database,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { getConfig, updateConfig } from './actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const config = await getConfig() as any;

  return (
    <form action={updateConfig} className="max-w-4xl space-y-8">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Configuración del Sistema
        </h2>
        <p className="text-muted-foreground text-sm">Ajustes generales y parámetros de la organización</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Treasury Config */}
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-400/10 rounded-lg text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Parámetros de Tesorería</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Meses para Adeudo</label>
              <input type="number" name="monthsForDebt" defaultValue={config.monthsForDebt} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Moneda Base</label>
              <select name="baseCurrency" defaultValue={config.baseCurrency} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none text-foreground color-scheme-dark">
                <option value="UYU" className="bg-black">Pesos Uruguayos (UYU)</option>
                <option value="USD" className="bg-black">Dólares (USD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Member Fees Config */}
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-400/10 rounded-lg text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Cuotas de Miembros</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Monto Cuota Mensual</label>
              <input type="number" name="monthlyFeeAmount" step="0.01" defaultValue={config.monthlyFeeAmount} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Moneda de Cuota</label>
              <select name="monthlyFeeCurrency" defaultValue={config.monthlyFeeCurrency} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none text-foreground color-scheme-dark">
                <option value="UYU" className="bg-black">UYU ($)</option>
                <option value="USD" className="bg-black">USD (U$S)</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">Este monto aplica automáticamente a quienes tengan los roles obligados a pago (MEMBER, LUMINAR, TESOREROS). ADMIN y GUEST están exentos.</p>
          </div>
        </div>

        {/* Telegram Config */}
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-400/10 rounded-lg text-sky-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Integración Telegram Bot</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Token del Bot</label>
              <input type="password" name="telegramBotToken" defaultValue={config.telegramBotToken || ''} placeholder="••••••••••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Chat ID (Admin)</label>
              <input type="text" name="telegramChatId" defaultValue={config.telegramChatId || ''} placeholder="-100xxxxxxxx" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
            </div>
          </div>
        </div>

        {/* Security Config */}
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-400/10 rounded-lg text-rose-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Roles y Permisos</h3>
          </div>
          <p className="text-sm text-foreground/70">Gestiona quién tiene acceso a los diferentes módulos de la plataforma central.</p>
          <Link href="/settings/users" className="block text-center w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
            GESTIONAR ROLES
          </Link>
        </div>

        {/* Lodge Info Config */}
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/10 rounded-lg text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <h3 className="font-bold">Información de la Logia</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Día de Sesión</label>
                <select name="meetingDay" defaultValue={config.meetingDay || ''} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none text-foreground color-scheme-dark">
                  <option value="" className="bg-black">Seleccionar día...</option>
                  <option value="Lunes" className="bg-black">Lunes</option>
                  <option value="Martes" className="bg-black">Martes</option>
                  <option value="Miércoles" className="bg-black">Miércoles</option>
                  <option value="Jueves" className="bg-black">Jueves</option>
                  <option value="Viernes" className="bg-black">Viernes</option>
                  <option value="Sábado" className="bg-black">Sábado</option>
                  <option value="Domingo" className="bg-black">Domingo</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Hora de Sesión</label>
                <input type="time" name="meetingTime" defaultValue={config.meetingTime || ''} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground color-scheme-dark" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Feriados y Días Libres</label>
                <textarea 
                  name="holidays" 
                  defaultValue={config.holidays || ''} 
                  placeholder="Ej: 2024-12-25 (Navidad), 2025-01-01 (Año Nuevo)"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                />
                <p className="text-[10px] text-muted-foreground">Indica las fechas en las que no habrá actividad.</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Otros Datos Útiles</label>
              <textarea 
                name="extraData" 
                defaultValue={config.extraData || ''} 
                placeholder="Dirección, datos de contacto, enlaces importantes, etc."
                rows={10}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button type="submit" className="btn-primary px-10">Guardar Cambios</button>
      </div>
    </form>
  );
}
