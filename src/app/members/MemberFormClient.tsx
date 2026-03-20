'use client';

import { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { createMember } from './actions';

export default function MemberFormClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createMember(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      const form = e.target as HTMLFormElement;
      form.reset();
    }
    
    setIsSubmitting(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center gap-2 text-sm"
      >
        <UserPlus className="w-4 h-4" />
        Nuevo Miembro
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Añadir Nuevo Miembro</h3>
            
            {error && (
              <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-sm mb-4 border border-rose-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Ej: Juan Pérez"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  name="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Teléfono</label>
                <input 
                  type="text" 
                  name="phone"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="+123456789"
                />
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Miembro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
