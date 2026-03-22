'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { QrCode, ExternalLink, MoreVertical, Edit, Trash2, Loader2, X } from 'lucide-react';
import { updateMember, deleteMember, updateMemberStatus } from './actions';
import { useRouter } from 'next/navigation';

export default function MemberActionsClient({ 
  member, 
  currentUserRole, 
  currentUserPosition 
}: { 
  member: any, 
  currentUserRole?: string, 
  currentUserPosition?: string 
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = currentUserRole === 'ADMIN';
  const isDignity = ['LUMINAR', 'SECRETARIO_ACTAS', 'VICE_SECRETARIO'].includes(currentUserPosition || '');
  const canModify = isAdmin || isDignity;

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${member.fullName}?`)) return;
    setIsDeleting(true);
    const res = await deleteMember(member.id);
    if (res.error) alert(res.error);
    setIsDeleting(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    const res = await updateMemberStatus(member.id, newStatus as any);
    if (res.error) alert(res.error);
    setIsUpdating(false);
    setIsMenuOpen(false);
  };

  const renderQrModal = () => {
    if (!mounted || !isQrModalOpen) return null;
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsQrModalOpen(false)} />
        <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-10 w-full max-w-sm text-center animate-in zoom-in duration-300">
          <button onClick={() => setIsQrModalOpen(false)} className="absolute right-6 top-6 text-white/30 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
          <div className="mb-6">
            <h3 className="text-xl font-bold">Código QR Personal</h3>
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-1">Soles y Rayos de Oriente No.7</p>
          </div>
          
          <div className="bg-white p-6 rounded-[2rem] inline-block mb-8 shadow-2xl relative group">
             <img 
               src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + '/members/' + member.id)}&bgcolor=ffffff&color=000000&margin=10`} 
               alt="QR Code" 
               className="w-48 h-48 block mx-auto"
             />
             <div className="absolute inset-0 bg-primary/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          
          <div className="space-y-1 mb-8">
            <p className="text-sm font-bold truncate px-4">{member.fullName}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{(member.category || 'DISCIPULO').replace(/_/g, ' ')}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all font-bold"
            >
              Cerrar
            </button>
            <a 
              href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(window.location.host + '/members/' + member.id)}&format=png&download=1`}
              target="_blank"
              download={`QR_${member.fullName.replace(/\s+/g, '_')}.png`}
              className="w-full py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <QrCode className="w-3 h-3" />
              Descargar
            </a>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const renderEditModal = () => {
    if (!mounted || !isEditModalOpen) return null;
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)} />
        <div className="glass w-full max-w-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative z-[100000] animate-in zoom-in duration-300 overflow-y-auto max-h-[90vh]">
          <button onClick={() => setIsEditModalOpen(false)} className="absolute right-6 top-6 text-white/30 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"><X className="w-6 h-6" /></button>
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
             <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Edit className="w-6 h-6" />
             </div>
             Editar Datos del Miembro
          </h3>
          
          <form action={async (fd) => {
            setIsUpdating(true);
            const res = await updateMember(member.id, fd);
            setIsUpdating(false);
            if (res.error) alert(res.error);
            else setIsEditModalOpen(false);
          }} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Nombre Completo</label>
                 <input type="text" name="fullName" defaultValue={member.fullName} required className="input-field-custom h-12" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Nº de Miembro</label>
                 <input type="text" name="memberNumber" defaultValue={member.memberNumber} className="input-field-custom h-12" />
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Email</label>
                 <input type="email" name="email" defaultValue={member.email} className="input-field-custom h-12" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Teléfono</label>
                 <input type="text" name="phone" defaultValue={member.phone} className="input-field-custom h-12" />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Datos Relevantes / Observaciones</label>
               <textarea 
                name="relevantData" 
                defaultValue={member.relevantData} 
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none min-h-[120px]"
                placeholder="Información adicional relevante del hermano..."
              />
             </div>

             <div className="flex gap-4 justify-end pt-8 border-t border-white/5">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 py-3 rounded-2xl text-xs font-bold text-muted-foreground uppercase tracking-widest hover:bg-white/5 transition-all">Cancelar</button>
              <button type="submit" disabled={isUpdating} className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2">
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
              </button>
             </div>
          </form>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="flex gap-2 justify-end relative">
      <button 
        onClick={() => setIsQrModalOpen(true)}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-primary" 
        title="Ver Código QR"
      >
        <QrCode className="w-4 h-4" />
      </button>

      <a 
        href={`/members/${member.id}`}
        target="_blank"
        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-foreground" 
        title="Ver Perfil Público"
      >
        <ExternalLink className="w-4 h-4" />
      </a>

      <div className="relative">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${isMenuOpen ? 'bg-white/10 text-primary' : 'text-muted-foreground'}`}
          title="Opciones"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 glass border border-white/10 rounded-2xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => { setIsEditModalOpen(true); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-white/5 rounded-xl transition-colors"
               >
                <Edit className="w-4 h-4 text-primary" />
                Editar Datos
              </button>
              
              {canModify && (
                <>
                  <div className="h-px bg-white/5 my-2" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase px-4 py-1">Cambiar Estado</p>
                  <button onClick={() => handleStatusChange('ACTIVE')} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-emerald-500/10 hover:text-emerald-400 rounded-xl transition-colors">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" /> Activo
                  </button>
                  <button onClick={() => handleStatusChange('INACTIVE')} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-500/10 hover:text-slate-400 rounded-xl transition-colors">
                    <div className="w-2 h-2 rounded-full bg-slate-400" /> Inactivo
                  </button>
                  <button onClick={() => handleStatusChange('EXONERATED')} className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-blue-500/10 hover:text-blue-400 rounded-xl transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-400" /> Exonerado
                  </button>
                </>
              )}

              {isAdmin && (
                <>
                  <div className="h-px bg-rose-500/10 my-2" />
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-rose-500/10 text-rose-400 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {renderQrModal()}
      {renderEditModal()}

      <style jsx>{`
        .input-field-custom {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 0.75rem 1.25rem;
          font-size: 0.875rem;
          color: white;
          transition: all 0.2s;
        }
        .input-field-custom:focus {
          outline: none;
          border-color: rgba(var(--primary-rgb), 0.5);
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
