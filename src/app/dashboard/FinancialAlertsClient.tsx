'use client';

import { useState } from 'react';
import { AlertTriangle, Info, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { FinancialAlert } from '@/lib/services/healthService';

interface Props {
  alerts: (Omit<FinancialAlert, 'date'> & { date: Date | string })[];
}

export default function FinancialAlertsClient({ alerts }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (alerts.length === 0) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-wrap gap-3">
        {alerts.map((alert) => {
          const isExpanded = expandedId === alert.id;
          const date = new Date(alert.date);

          return (
            <div 
              key={alert.id} 
              onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              className={`w-fit px-3 py-1.5 rounded-lg border cursor-pointer transition-all hover:scale-[1.02] shadow-lg ${
                alert.type === 'error' ? 'bg-rose-600 border-rose-400 shadow-rose-900/40' : 
                alert.type === 'warning' ? 'bg-rose-500 border-rose-400' : 
                'bg-rose-700 border-rose-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-white">
                    {alert.type === 'info' ? <Info className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">{alert.category}</p>
                </div>
                {isExpanded ? <ChevronUp className="w-3 h-3 text-white/70" /> : <ChevronDown className="w-3 h-3 text-white/70" />}
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/20 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs font-bold leading-relaxed mb-2 text-white">
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] text-white/60 uppercase tracking-widest font-bold">
                    <Calendar className="w-3 h-3" />
                    {date.toLocaleDateString('es-UY')} {date.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
