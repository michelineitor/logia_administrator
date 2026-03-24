'use client';

import { useState } from 'react';
import { Plus, X, Loader2, Landmark, History, Camera } from 'lucide-react';
import { createIncome, createExpense, createLodgeSession } from './actions';
import CameraCapture from '@/components/CameraCapture';

export default function TransactionFormsClient() {
  const [activeForm, setActiveForm] = useState<'INCOME' | 'EXPENSE' | 'SESSION' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [cameraPreview, setCameraPreview] = useState<string | null>(null);

  const handleCapture = (file: File) => {
    setCapturedFile(file);
    setCameraPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCapture(file);
    }
  };

  const removeCaptured = () => {
    setCapturedFile(null);
    setCameraPreview(null);
  };

  const handleIncomeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    if (capturedFile) {
      formData.set("imageProof", capturedFile);
    }
    const result = await createIncome(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      closeForm();
    }
    setIsSubmitting(false);
  };

  const handleExpenseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    if (capturedFile) {
      formData.set("imageProof", capturedFile);
    }
    const result = await createExpense(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      closeForm();
    }
    setIsSubmitting(false);
  };

  const handleSessionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    if (capturedFile) {
      formData.set("imageProof", capturedFile);
    }
    const result = await createLodgeSession(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      closeForm();
    }
    setIsSubmitting(false);
  };

  const closeForm = () => {
    setActiveForm(null);
    removeCaptured();
    setShowCamera(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <button 
          onClick={() => setActiveForm('EXPENSE')}
          className="px-4 py-2 bg-rose-400/10 text-rose-400 border border-rose-400/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-rose-400/20 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Gasto
        </button>
        <button 
          onClick={() => setActiveForm('INCOME')}
          className="btn-primary flex items-center justify-center gap-2 text-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Ingreso
        </button>
        <button 
          onClick={() => setActiveForm('SESSION')}
          className="px-4 py-2 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-amber-400/20 transition-all w-full sm:w-auto"
        >
          <History className="w-4 h-4" /> Registrar Sesión
        </button>
      </div>

      {activeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={closeForm}
              className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">
              {activeForm === 'INCOME' ? 'Registrar Ingreso' : 
               activeForm === 'EXPENSE' ? 'Registrar Gasto' : 
               'Registrar Sesión de Logia'}
            </h3>
            
            {error && (
              <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-sm mb-4 border border-rose-500/20">
                {error}
              </div>
            )}

            {activeForm === 'SESSION' ? (
              <form onSubmit={handleSessionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Fecha de Sesión *</label>
                  <input 
                    type="date" 
                    name="date"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-400/50 transition-colors text-white [color-scheme:dark]"
                  />
                </div>

                <div className="space-y-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <h4 className="text-xs font-bold uppercase text-white/40 tracking-wider">Ingresos de Sesión</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-white/50 mb-1">Saco Benéfico</label>
                      <div className="flex gap-2">
                        <select name="sacoCurrency" className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none text-white">
                          <option value="UYU">UYU</option>
                          <option value="USD">USD</option>
                        </select>
                        <input type="number" name="sacoAmount" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-amber-400/50" placeholder="0.00" />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-white/50 mb-1">Donativos</label>
                      <div className="flex gap-2">
                        <select name="donativoCurrency" className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none text-white">
                          <option value="UYU">UYU</option>
                          <option value="USD">USD</option>
                        </select>
                        <input type="number" name="donativoAmount" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-amber-400/50" placeholder="0.00" />
                      </div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-white/50 mb-1">Iniciaciones / Afiliaciones</label>
                      <div className="flex gap-2">
                        <select name="iniciacionCurrency" className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none text-white">
                          <option value="UYU">UYU</option>
                          <option value="USD">USD</option>
                        </select>
                        <input type="number" name="iniciacionAmount" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-amber-400/50" placeholder="0.00" />
                      </div>
                    </div>

                    <div className="col-span-2 border-t border-white/5 pt-2">
                      <label className="block text-xs font-medium text-white/50 mb-1">Otros Ingresos</label>
                      <div className="flex gap-2 mb-2">
                        <select name="otrosCurrency" className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:outline-none text-white">
                          <option value="UYU">UYU</option>
                          <option value="USD">USD</option>
                        </select>
                        <input type="number" name="otrosAmount" step="0.01" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-amber-400/50" placeholder="0.00" />
                      </div>
                      <input type="text" name="otrosComment" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-400/50" placeholder="Concepto de otros ingresos..." />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Observaciones de la Sesión</label>
                  <textarea 
                    name="observations"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-amber-400/50 transition-colors h-20 resize-none"
                    placeholder="Detalles de la sesión..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Comprobante / Acta (Foto) *</label>
                  <div className="space-y-3">
                    {cameraPreview ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                        <img src={cameraPreview} className="w-full h-full object-cover" alt="Captured" />
                        <button 
                          type="button"
                          onClick={removeCaptured}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <Camera className="w-6 h-6 text-amber-400" />
                          <span className="text-xs font-medium">Tomar Foto</span>
                        </button>
                        <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                          <Plus className="w-6 h-6 text-white/40" />
                          <span className="text-xs font-medium">Subir Archivo</span>
                          <input 
                            type="file" 
                            name="imageProof" 
                            accept="image/*"
                            onChange={handleFileChange}
                            required={!capturedFile}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button type="button" onClick={() => setActiveForm(null)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors">Cancelar</button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
                  >
                    {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Registrar Sesión'}
                  </button>
                </div>
              </form>
            ) : (
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
                  <div className="space-y-3">
                    {cameraPreview ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                        <img src={cameraPreview} className="w-full h-full object-cover" alt="Captured" />
                        <button 
                          type="button"
                          onClick={removeCaptured}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button"
                          onClick={() => setShowCamera(true)}
                          className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <Camera className="w-6 h-6 text-primary" />
                          <span className="text-xs font-medium">Tomar Foto</span>
                        </button>
                        <label className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                          <Plus className="w-6 h-6 text-white/40" />
                          <span className="text-xs font-medium">Subir Archivo</span>
                          <input 
                            type="file" 
                            name="imageProof" 
                            accept="image/*"
                            onChange={handleFileChange}
                            required={!capturedFile}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
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
                    className="btn-primary text-sm px-6 py-2 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : 'Confirmar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {showCamera && (
        <CameraCapture 
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
