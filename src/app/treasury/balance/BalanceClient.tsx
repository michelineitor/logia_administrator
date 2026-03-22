'use client';

import { useState, useEffect } from 'react';
import { Calculator, Check, AlertCircle, Save } from 'lucide-react';
import { registerCashCount, getExpectedBalance } from './actions';

export default function BalanceClient({ expectedData: initialExpected, history, userId, isAdmin }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedData, setExpectedData] = useState(initialExpected);
  const [dateError, setDateError] = useState<string | null>(null);

  const [bankUYU, setBankUYU] = useState<number>(0);
  const [cashUYU, setCashUYU] = useState<number>(0);
  const [bankUSD, setBankUSD] = useState<number>(0);
  const [cashUSD, setCashUSD] = useState<number>(0);
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadExpected() {
      const data = await getExpectedBalance(date);
      if (data.error) {
        setDateError(data.error);
        setExpectedData({ expectedUYU: 0, expectedUSD: 0 });
      } else {
        setDateError(null);
        setExpectedData(data);
      }
    }
    loadExpected();
  }, [date]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-UY', { style: 'currency', currency }).format(amount);
  };

  const totalActualUYU = bankUYU + cashUYU;
  const totalActualUSD = bankUSD + cashUSD;
  const deviationUYU = totalActualUYU - expectedData.expectedUYU;
  const deviationUSD = totalActualUSD - expectedData.expectedUSD;

  const getDeviationColor = (dev: number) => {
    if (Math.abs(dev) < 1) return 'text-emerald-400';
    if (dev > 0) return 'text-blue-400';
    return 'text-rose-400';
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('¿Estás seguro de registrar este arqueo? Este valor se convertirá en el nuevo punto de partida.')) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('date', date);
    formData.append('actualBankUYU', bankUYU.toString());
    formData.append('actualCashUYU', cashUYU.toString());
    formData.append('actualBankUSD', bankUSD.toString());
    formData.append('actualCashUSD', cashUSD.toString());
    formData.append('observations', observations);

    const result = await registerCashCount(formData, userId);
    setLoading(false);
    
    if (result.error) {
      alert(result.error);
    } else {
      alert('Arqueo registrado exitosamente');
      setBankUYU(0); setCashUYU(0); setBankUSD(0); setCashUSD(0); setObservations('');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* EXPECTED BALANCE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5 bg-primary/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Monto Esperado UYU</h3>
            <Calculator className="text-primary w-5 h-5" />
          </div>
          <p className="text-4xl font-bold">{formatCurrency(expectedData.expectedUYU, 'UYU')}</p>
          <p className="text-xs text-muted-foreground mt-2">Calculado desde el último punto de partida + movimientos</p>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/5 bg-primary/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Monto Esperado USD</h3>
            <Calculator className="text-primary w-5 h-5" />
          </div>
          <p className="text-4xl font-bold">{formatCurrency(expectedData.expectedUSD, 'USD')}</p>
          <p className="text-xs text-muted-foreground mt-2">Calculado desde el último punto de partida + movimientos</p>
        </div>
      </div>

      {/* INPUT FORM AND DEVIATION */}
      <div className="glass p-8 rounded-2xl border border-white/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold">Registrar Nuevo Arqueo / Punto de Partida</h3>
          <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span className="text-sm font-medium text-muted-foreground">Fecha: </span>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              required 
              className="bg-transparent focus:outline-none text-sm text-foreground color-scheme-dark"
            />
          </div>
        </div>
        {dateError && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <p className="text-sm text-rose-400 font-medium">{dateError}</p>
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* UYU INPUTS */}
            <div className="space-y-4">
              <h4 className="font-bold text-accent">Pesos Uruguayos (UYU)</h4>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Dinero Real en Banco</label>
                <input type="number" step="0.01" value={bankUYU || ''} onChange={(e) => setBankUYU(parseFloat(e.target.value) || 0)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Dinero Real Físico (Efectivo)</label>
                <input type="number" step="0.01" value={cashUYU || ''} onChange={(e) => setCashUYU(parseFloat(e.target.value) || 0)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Desvío UYU:</span>
                <span className={`font-bold text-lg ${getDeviationColor(deviationUYU)}`}>
                  {deviationUYU > 0 ? '+' : ''}{formatCurrency(deviationUYU, 'UYU')}
                </span>
              </div>
            </div>

            {/* USD INPUTS */}
            <div className="space-y-4">
              <h4 className="font-bold text-accent mt-6 md:mt-0">Dólares (USD)</h4>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Dinero Real en Banco</label>
                <input type="number" step="0.01" value={bankUSD || ''} onChange={(e) => setBankUSD(parseFloat(e.target.value) || 0)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Dinero Real Físico (Efectivo)</label>
                <input type="number" step="0.01" value={cashUSD || ''} onChange={(e) => setCashUSD(parseFloat(e.target.value) || 0)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Desvío USD:</span>
                <span className={`font-bold text-lg ${getDeviationColor(deviationUSD)}`}>
                  {deviationUSD > 0 ? '+' : ''}{formatCurrency(deviationUSD, 'USD')}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Observaciones (Opcional)</label>
            <textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" placeholder="Razón del faltante/sobrante, notas adicionales..." />
          </div>

          <button type="submit" disabled={loading || !!dateError} className="btn-primary w-full flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Registrando...' : 'Registrar Arqueo (Nuevo Punto de Partida)'}
          </button>
        </form>
      </div>

      {/* HISTORY */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-lg font-bold">Historial de Arqueos</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Registrado por</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Real UYU</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Desvío UYU</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {history.map((h: any) => (
              <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(h.date).toLocaleDateString('es-UY')}</td>
                <td className="px-6 py-4 text-sm">{h.registeredBy?.name || h.registeredBy?.username || 'Desconocido'}</td>
                <td className="px-6 py-4 text-sm font-bold">{formatCurrency(h.totalActualUYU, 'UYU')}</td>
                <td className={`px-6 py-4 text-sm font-bold ${getDeviationColor(h.deviationUYU)}`}>
                  {h.deviationUYU > 0 ? '+' : ''}{formatCurrency(h.deviationUYU, 'UYU')}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{h.observations || '-'}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No hay arqueos registrados aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
