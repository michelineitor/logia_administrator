'use client';

import { useState } from 'react';
import { Plus, X, User as UserIcon, Loader2 } from 'lucide-react';
import { createUser } from './actions';

export default function UserManagerClient({ initialUsers }: { initialUsers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await createUser(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setIsModalOpen(false);
      // Let the page revalidate to update the initialUsers list
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="glass rounded-3xl border border-white/5 overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-white/5 border-b border-white/10 text-xs text-muted-foreground font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Username / Email</th>
              <th className="px-6 py-4">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {initialUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{user.name || 'Sin Nombre'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-foreground/70">
                  <div>{user.username}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-bold border border-white/10">
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
            {initialUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground text-sm">
                  No hay usuarios registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Añadir Nuevo Usuario</h3>
            
            {error && (
              <div className="bg-rose-500/10 text-rose-400 p-3 rounded-lg text-sm mb-4 border border-rose-500/20">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  name="name"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Ej. Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Nombre de Usuario *</label>
                <input 
                  type="text" 
                  name="username"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="juanp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Contraseña *</label>
                <input 
                  type="password" 
                  name="password"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Rol *</label>
                <select name="role" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white">
                  <option value="USER">Usuario (Sin accesos especiales)</option>
                  <option value="LUMINAR">Luminar</option>
                  <option value="SECRETARIO_ACTAS">Secretario de Actas</option>
                  <option value="VICE_TESORERO">Vice Tesorero</option>
                  <option value="TESORERO">Tesorero</option>
                  <option value="ADMIN">Administrador</option>

                </select>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn-primary text-sm px-6 py-2 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
