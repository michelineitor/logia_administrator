'use client'

import { useState } from 'react';
import { User, Phone, Mail, Shield, AlertCircle, CheckCircle, Save, CreditCard } from 'lucide-react';
import { updateProfileData } from './actions';

export default function ProfileClient({ initialData, userId }: any) {
  const { user, status, debtCount, debtAmount, fee, currency } = initialData;
  const member = user?.member;
  
  const [email, setEmail] = useState(user?.email || '');
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(member?.fullName || '');
  const [phone, setPhone] = useState(member?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("email", email);
    fd.append("username", username);
    if (member) {
      fd.append("memberId", member.id);
      fd.append("fullName", fullName);
      fd.append("phone", phone);
    }
    const res = await updateProfileData(fd, userId);
    setLoading(false);
    if (res.error) alert(res.error);
    else alert("¡Perfil actualizado con éxito!");
  };

  const getRoleLabel = (r: string) => {
    switch(r) {
      case 'ADMIN': return 'Administrador';
      case 'LUMINAR': return 'Luminar';
      case 'TESORERO': return 'Tesorero';
      case 'VICE_TESORERO': return 'Vice-Tesorero';
      case 'MEMBER': return 'Miembro Pleno';
      case 'GUEST': return 'Invitado / Visitante';
      default: return r;
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Formulario Principal de Datos */}
      <div className="lg:col-span-2 space-y-8">
        <form onSubmit={handleSubmit} className="glass p-8 rounded-3xl border border-white/5 space-y-8">
          <div className="flex items-center gap-4 border-b border-white/5 pb-6">
            {member?.imageUrl ? (
              <img src={member.imageUrl} alt={fullName} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                {username?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">{fullName || username}</h3>
              <div className="flex items-center gap-2">
                <p className="text-sm text-primary uppercase font-bold tracking-widest">{getRoleLabel(user.role)}</p>
                {member?.memberNumber && (
                   <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono tracking-widest">Nº {member.memberNumber}</span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">Datos de Acceso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Nombre de Usuario</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
                </div>
              </div>
            </div>

            {member && (
              <>
                <h4 className="text-sm font-bold tracking-widest text-muted-foreground uppercase pt-4 border-t border-white/5">Datos de la Ficha del Hermano</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Nombre Completo</label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Teléfono de Contacto</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-white/5 flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary hover:scale-105 active:scale-95 transition-transform flex items-center gap-2 px-8">
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* ESTADO FINANCIERO Y PAGOS */}
      <div className="space-y-6">
        {user.role === 'ADMIN' || user.role === 'GUEST' ? (
          <div className="glass p-8 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center space-y-4 h-full">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">Estado Libre</h3>
            <p className="text-sm text-muted-foreground">Tu rol actual ({getRoleLabel(user.role)}) está exento del pago de cuotas regulares mensuales impuestas por el sistema.</p>
          </div>
        ) : member ? (
          <>
            <div className={`glass p-8 rounded-3xl border ${
              status === 'AL DÍA' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'
            }`}>
              <div className="flex items-center gap-4 mb-4">
                {status === 'AL DÍA' ? (
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-rose-400" />
                )}
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Tú Estado</h3>
                  <p className={`text-3xl font-bold ${status === 'AL DÍA' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {status}
                  </p>
                </div>
              </div>
              
              {status === 'DEUDA' && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <p className="text-sm text-muted-foreground mb-2">Registras un impago de <strong className="text-rose-400">{debtCount} cuotas</strong>.</p>
                  <p className="text-xl font-bold font-mono">
                    <span className="text-muted-foreground text-sm mr-2">Adeudo estimado:</span>
                    {debtAmount} <span className="text-sm font-normal text-muted-foreground">{currency}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 italic">Aprox {fee} {currency} cada mes pendiente desde tu fecha de ingreso a la logia.</p>
                </div>
              )}
            </div>

            <div className="glass p-6 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-accent" />
                <h3 className="font-bold">Mis Pagos Recientes</h3>
              </div>
              <div className="space-y-3">
                {member.payments && member.payments.length > 0 ? (
                  member.payments.slice(0, 5).map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <p className="font-bold text-sm">{p.amount} {p.currency}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.monthPaid} {p.yearPaid}</p>
                      </div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-bold">
                        Completado
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No hay pagos registrados bajo tu ficha.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="glass p-8 rounded-3xl border border-rose-500/20 bg-rose-500/5 text-center flex flex-col items-center justify-center space-y-4 h-full">
            <AlertCircle className="w-12 h-12 text-rose-400" />
            <h3 className="text-lg font-bold">Ficha No Enlazada</h3>
            <p className="text-sm text-muted-foreground">Tu cuenta no está vinculada a ninguna Ficha de Miembro en el sistema.</p>
            <p className="text-xs text-rose-400/80">Solicita a un administrador que asigne tu usuario a tus registros físicos en la plataforma.</p>
          </div>
        )}
      </div>

    </div>
  );
}
