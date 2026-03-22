'use client';

import { useState, useEffect } from 'react';
import { UserPlus, X, Plus, Loader2 } from 'lucide-react';
import { createMember } from './actions';

export default function MemberFormClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Debug hook to help diagnostic hydration issues
    (window as any).openMemberModal = () => setIsOpen(true);
    console.log("MemberFormClient hydrated and ready.");
  }, []);

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

  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for base64 in DB
        setError("La imagen es demasiado grande. Máximo 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        // We'll use a hidden field or just pass it in state if we refactor handleSubmit
      };
      reader.readAsDataURL(file);
    }
  };

  const POSITIONS = [
    { value: 'DISCIPULO', label: 'Discípulo' },
    { value: 'DISCIPULO_HONOR', label: 'Discípulo de Honor' },
    { value: 'CABALLERO_LUZ', label: 'Caballero de la Luz' },
    { value: 'LUMINAR', label: 'Luminar' },
    { value: 'VICE_LUMINAR', label: 'Vice-Luminar' },
    { value: 'PATRIARCA', label: 'Patriarca' },
    { value: 'LPI', label: 'LPI' },
    { value: 'SECRETARIO_ACTAS', label: 'Secretario de Actas' },
    { value: 'VICE_SECRETARIO', label: 'Vice-Secretario' },
    { value: 'TESORERO', label: 'Tesorero' },
    { value: 'VICE_TESORERO', label: 'Vice-Tesorero' },
    { value: 'GUARDA_TEMPLO_INTERIOR', label: 'Guarda-Templo-Interior' },
    { value: 'GUARDA_TEMPLO_EXTERIOR', label: 'Guarda-Templo-Exterior' },
  ];
  const [createAccount, setCreateAccount] = useState(true);

  return (
    <div className="relative inline-block">
      <button 
        type="button"
        id="btn-nuevo-miembro"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="btn-primary flex items-center gap-2 text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold cursor-pointer"
        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
      >
        <UserPlus className="w-4 h-4" />
        Nuevo Miembro
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="glass w-full max-w-2xl p-8 rounded-3xl border border-white/10 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-6 top-6 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
               <UserPlus className="text-primary" />
               Registrar Nuevo Miembro
            </h3>
            
            {error && (
              <div className="bg-rose-500/10 text-rose-400 p-4 rounded-xl text-sm mb-6 border border-rose-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hidden field for base64 image */}
              <input type="hidden" name="imageUrl" value={preview || ''} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Número de Miembro</label>
                  <input 
                    type="text" 
                    name="memberNumber"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="Ej: 007"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nombre Completo *</label>
                  <input 
                    type="text" 
                    name="fullName"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="Ej: Hiram Abif"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cargo / Posición</label>
                  <select 
                    name="position"
                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-white"
                  >
                    {POSITIONS.map(pos => (
                      <option key={pos.value} value={pos.value} className="bg-gray-900">{pos.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Teléfono (Telegram)</label>
                  <input 
                    type="text" 
                    name="phone"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="+598 90 000 000"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Correo Electrónico</label>
                  <input 
                    type="email" 
                    name="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
                    placeholder="hermano@logia.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Foto del Hermano (Opcional)</label>
                  <div className="flex items-center gap-4">
                     <div className="relative group overflow-hidden w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {preview ? (
                          <img src={preview} className="w-full h-full object-cover animate-in fade-in duration-300" alt="Preview" />
                        ) : (
                          <div className="text-center group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6 text-white/20 mx-auto mb-1 group-hover:text-primary" />
                            <span className="text-[8px] text-white/20 uppercase font-bold tracking-tighter">Subir</span>
                          </div>
                        )}
                     </div>
                     <div className="flex-1">
                        <p className="text-[10px] text-muted-foreground leading-tight mb-1">Haz clic para subir una foto.</p>
                        <p className="text-[10px] text-primary/50 font-bold uppercase tracking-tighter">Máximo 2MB</p>
                        {preview && (
                          <button 
                            type="button" 
                            onClick={() => setPreview(null)}
                            className="text-[10px] text-rose-400 font-bold mt-2 hover:underline"
                          >
                            Eliminar foto
                          </button>
                        )}
                     </div>
                  </div>
                </div>
              </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold tracking-widest text-primary uppercase">Acceso al Sistema</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Crear credenciales para que el hermano entre al dashboard</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="createAccount" 
                        className="sr-only peer" 
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ${createAccount ? 'opacity-100' : 'opacity-40 cursor-not-allowed'}`}>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nombre de Usuario</label>
                      <input 
                        type="text" 
                        name="username"
                        disabled={!createAccount}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 disabled:bg-transparent disabled:opacity-50"
                        placeholder="ej. juanp"
                        required={createAccount}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Contraseña Temporal</label>
                      <input 
                        type="password" 
                        name="password"
                        disabled={!createAccount}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 disabled:bg-transparent disabled:opacity50"
                        placeholder="••••••••"
                        required={createAccount}
                      />
                    </div>
                  </div>
                </div>
              <div className="mt-8 flex gap-4 justify-end pt-6 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/5 transition-all text-muted-foreground"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary min-w-[140px] shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : 'Guardar Hermano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
