'use client'

import { useState } from 'react';
import { Landmark, Wallet, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { clearDeviations } from '@/app/treasury/balance/actions';
import { useRouter } from 'next/navigation';

interface DeviationDisplayProps {
  lastArqueo: any;
  pendingDeviationUYU: number;
  pendingDeviationUSD: number;
  userRole?: string;
}

export default function DeviationDisplay({ 
  lastArqueo, 
  pendingDeviationUYU, 
  pendingDeviationUSD,
  userRole
}: DeviationDisplayProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const canClear = ['ADMIN', 'LUMINAR'].includes(userRole || '');
  const hasDeviation = pendingDeviationUYU !== 0 || pendingDeviationUSD !== 0;

  const handleClear = async () => {
    if (!confirm('¿Estás seguro de que deseas limpiar las diferencias? Esto marcará los desvíos actuales como procesados.')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const result = await clearDeviations();
      if (result.success) {
        setMessage({ type: 'success', text: 'Diferencias limpiadas correctamente.' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al limpiar diferencias' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setLoading(false);
    }
  };

  if (!lastArqueo) return null;

  return (
    <div className="glass p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col md:flex-row gap-6 items-center justify-between">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="text-center md:text-left">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 text-center md:text-left">Último Arqueo (Confirmado)</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-2">
            <div className="flex items-center gap-4 border-r border-white/5 pr-4 last:border-0 last:pr-0">
               <div className="flex items-center gap-2">
                  <Wallet className="w-3 h-3 text-emerald-400" />
                  <p className="text-xs font-bold">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(lastArqueo.actualCashUYU)}</p>
               </div>
               <div className="flex items-center gap-2">
                  <Landmark className="w-3 h-3 text-emerald-400/70" />
                  <p className="text-xs font-bold">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(lastArqueo.actualBankUYU)}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <Wallet className="w-3 h-3 text-blue-400" />
                  <p className="text-xs font-bold">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD' }).format(lastArqueo.actualCashUSD)}</p>
               </div>
               <div className="flex items-center gap-2">
                  <Landmark className="w-3 h-3 text-blue-400/70" />
                  <p className="text-xs font-bold">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD' }).format(lastArqueo.actualBankUSD)}</p>
               </div>
            </div>
          </div>
        </div>

        {hasDeviation && (
          <div className="h-8 w-px bg-white/5 hidden md:block" />
        )}

        {hasDeviation && (
          <div className="text-center md:text-left">
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1 justify-center md:justify-start">
              <AlertTriangle className="w-3 h-3" />
              Desvíos Pendientes
            </p>
            <div className="flex gap-4">
               <p className={`text-xs font-bold ${pendingDeviationUYU < 0 ? 'text-rose-400' : pendingDeviationUYU > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                {pendingDeviationUYU > 0 ? '+' : ''}{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(pendingDeviationUYU)}
              </p>
              <p className={`text-xs font-bold ${pendingDeviationUSD < 0 ? 'text-rose-400' : pendingDeviationUSD > 0 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                {pendingDeviationUSD > 0 ? '+' : ''}{new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD' }).format(pendingDeviationUSD)}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {message && (
          <p className={`text-[10px] font-bold uppercase tracking-tight ${message.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {message.text}
          </p>
        )}
        
        {hasDeviation && canClear && (
          <button
            onClick={handleClear}
            disabled={loading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Limpiar Diferencia
          </button>
        )}
      </div>
    </div>
  );
}
