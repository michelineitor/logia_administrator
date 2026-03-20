import { 
  Settings, 
  Bell, 
  Shield, 
  Database,
  Smartphone,
  MessageSquare
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-8">
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
              <input type="number" defaultValue={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Moneda Base</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none">
                <option>Pesos Dominicanos (DOP)</option>
                <option>Dólares (USD)</option>
              </select>
            </div>
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
              <input type="password" placeholder="••••••••••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Chat ID (Administración)</label>
              <input type="text" placeholder="-100xxxxxxxx" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
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
          <p className="text-sm text-foreground/70">Gestiona quién tiene acceso a los diferentes módulos de la plataforma.</p>
          <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all">
            GESTIONAR ROLES
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="btn-primary px-10">Guardar Cambios</button>
      </div>
    </div>
  );
}
