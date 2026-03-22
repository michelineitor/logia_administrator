'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createIncome, createExpense } from './actions';

export default function TransactionFormsClient() {
  const [activeForm, setActiveForm] = useState<'INCOME' | 'EXPENSE' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleIncomeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createIncome(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setActiveForm(null);
    }
    setIsSubmitting(false);
  };

  const handleExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createExpense(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setActiveForm(null);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="flex gap-4">
        <button 
          onClick={() => setActiveForm('EXPENSE')}
          className="px-4 py-2 bg-rose-400/10 text-rose-400 border border-rose-400/20 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-rose-400/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Registrar Gasto
        </button>
        <button 
          onClick={() => setActiveForm('INCOME')}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Registrar Ingreso
        </button>
      </div>

      {activeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setActiveForm(null)}
              className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">
              Registrar {activeForm === 'INCOME' ? 'Ingreso' : 'Gasto'}
            </h3>
            
            {error && (
              <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-sm mb-4 border border-rose-500/20">
                {error}
              </div>
            )}

            <form onSubmit={activeForm === 'INCOME' ? handleIncomeSubmit : handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Fecha *</label>
                  <input 
                    type="date" 
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Monto *</label>
                  <div className="flex gap-2">
                    <select name="currency" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none text-white">
                      <option value="UYU">UYU</option>
                      <option value="USD">USD</option>
                    </select>
                    <input 
                      type="number" 
                      name="amount"
                      step="0.01"
                      min="0"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {activeForm === 'INCOME' ? (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Ingreso *</label>
                  <select name="type" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white">
                    <option value="COBRO_CUOTAS">Cobro de Cuotas</option>
                    <option value="INICIACIONES_AFILIACIONES">Iniciaciones/Afiliaciones</option>
                    <option value="COLECTAS_SACO_BENEFICO">Colectas/Saco Benéfico</option>
                    <option value="DONATIVOS_RECIBIDOS">Donativos Recibidos</option>
                    <option value="IMPORTE_A_ENTREGAR">Importe a Entregar</option>
                    <option value="INGRESOS_EVENTUALES">Ingresos Eventuales</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Categoría de Gasto *</label>
                  <select name="category" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white">
                    <option value="DERECHOS_INICIACION_AFILIACION">Derechos de Iniciación/Afiliación</option>
                    <option value="MANTENIMIENTO_LIMPIEZA_INMUEBLE">Mantenimiento/Limpieza Inmueble</option>
                    <option value="SERVICIOS_GASTOS_BANCARIOS">Servicios Bancarios</option>
                    <option value="MATERIALES_OFICINA_IMPRESOS">Materiales Oficina</option>
                    <option value="ALQUILER_LOCAL_CASA_TEMPLO">Alquiler Local</option>
                    <option value="ELECTRICIDAD_UTE">Luz (UTE)</option>
                    <option value="AGUA_OSE">Agua (OSE)</option>
                    <option value="INTERNET">Internet</option>
                    <option value="OFRENDAS_FLORALES">Ofrendas Florales</option>
                    <option value="GASTOS_EVENTUALES">Gastos Eventuales</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Método *</label>
                <select name="method" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white">
                  <option value="CASH">Efectivo (Caja Chica)</option>
                  <option value="BANK_TRANSFER">Transferencia Bancaria</option>
                  <option value="PENDING_DEPOSIT">Depósito Pendiente</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Concepto / Comentario</label>
                <textarea 
                  name="comment"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors h-24 resize-none"
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Comprobante (Foto) *</label>
                <input 
                  type="file" 
                  name="imageProof"
                  accept="image/*"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                />
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setActiveForm(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
