'use client';

import { useState } from 'react';
import { CreditCard, Download, Send, Search, Calendar, Plus, MoreVertical, X, Ban } from 'lucide-react';
import { createPayment, updatePaymentStatus } from './actions';

export default function PaymentsClient({ payments, members, isAdmin }: { payments: any[], members: any[], isAdmin: boolean }) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredPayments = payments.filter(p => 
    p.member?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETADO': return 'bg-emerald-400/10 text-emerald-400';
      case 'PENDIENTE': return 'bg-amber-400/10 text-amber-400';
      case 'ERROR': return 'bg-rose-400/10 text-rose-400';
      case 'CANCELADO': return 'bg-slate-400/10 text-slate-400';
      default: return 'bg-white/10 text-white';
    }
  };

  const getMonthName = (month: number) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1] || month;
  };

  async function handleSoftDelete(id: string) {
    if (!confirm('¿Seguro que deseas cancelar este pago? (No se borrará el registro, solo cambiará su estado)')) return;
    
    setLoading(true);
    await updatePaymentStatus(id, 'CANCELADO' as any);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Historial de Pagos
        </h2>
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Registrar Pago Nuevo
        </button>
      </div>

      <div className="glass p-4 rounded-xl border border-white/5 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por miembro..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50" 
          />
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Miembro</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Monto</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Mes / Año</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha Registro</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPayments.map((p) => (
              <tr key={p.id} className={`hover:bg-white/[0.02] transition-colors ${p.status === 'CANCELADO' ? 'opacity-50' : ''}`}>
                <td className="px-6 py-4 text-sm font-medium">{p.member?.fullName || 'Desconocido'}</td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-400">
                  {p.currency === 'USD' ? 'USD $' : '$'}{p.amount}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{getMonthName(p.monthPaid)} {p.yearPaid}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(p.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${getStatusColor(p.status)}`}>
                    {p.status || 'COMPLETADO'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-primary" title="Descargar Recibo">
                      <Download className="w-4 h-4" />
                    </button>
                    {isAdmin && p.status !== 'CANCELADO' && (
                      <button 
                        onClick={() => handleSoftDelete(p.id)}
                        disabled={loading}
                        className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors text-muted-foreground hover:text-rose-400" 
                        title="Cancelar Pago"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No hay pagos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="glass p-6 rounded-2xl w-full max-w-md border border-white/10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Registrar Pago Nuevo
              </h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={async (formData) => {
              setLoading(true);
              const res = await createPayment(formData);
              setLoading(false);
              if (res?.error) {
                alert(res.error);
              } else {
                setShowForm(false);
              }
            }} className="flex-1 overflow-y-auto space-y-4 pr-2">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Miembro</label>
                <select name="memberId" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50 text-foreground">
                  <option value="">Selecciona un miembro...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id} className="bg-black text-foreground">{m.fullName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Monto</label>
                  <input type="number" name="amount" required step="0.01" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Moneda</label>
                  <select name="currency" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50 text-foreground">
                    <option value="UYU" className="bg-black text-foreground">UYU ($)</option>
                    <option value="USD" className="bg-black text-foreground">USD (U$S)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Mes Pagado</label>
                  <select name="monthPaid" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50 text-foreground" defaultValue={new Date().getMonth() + 1}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                      <option key={m} value={m} className="bg-black text-foreground">{getMonthName(m)}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Año Pagado</label>
                  <input type="number" name="yearPaid" required defaultValue={new Date().getFullYear()} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Método de Pago</label>
                <select name="method" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50 text-foreground">
                  <option value="CASH" className="bg-black text-foreground">Efectivo</option>
                  <option value="BANK_TRANSFER" className="bg-black text-foreground">Transferencia Bancaria</option>
                  <option value="PENDING_DEPOSIT" className="bg-black text-foreground">Buzón / Depósito Pendiente</option>
                  <option value="OTHER" className="bg-black text-foreground">Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Fecha de Registro</label>
                <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-primary/50 color-scheme-dark" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary opacity-100 disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Guardar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
