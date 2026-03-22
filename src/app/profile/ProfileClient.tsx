'use client'

import { useState } from 'react';
import { User, Phone, Mail, Shield, AlertCircle, CheckCircle, Save, CreditCard, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { updateProfileData, changePassword } from './actions';

// ... (previous functions if any) ...

function PasswordChangeCard({ userId }: { userId: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validate = () => {
    if (newPassword.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(newPassword)) return "Debe incluir al menos una mayúscula.";
    if (!/[0-9]/.test(newPassword)) return "Debe incluir al menos un número.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return "Debe incluir al menos un símbolo (!@#$...).";
    if (newPassword !== confirmPassword) return "Las contraseñas no coinciden.";
    return null;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    setLoading(true);
    const fd = new FormData();
    fd.append("currentPassword", currentPassword);
    fd.append("newPassword", newPassword);
    
    const res = await changePassword(fd, userId);
    setLoading(false);

    if (res.error) {
      setMessage({ type: 'error', text: res.error });
    } else {
      setMessage({ type: 'success', text: "¡Contraseña actualizada con éxito!" });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const requirements = [
    { label: "8+ caracteres", met: newPassword.length >= 8 },
    { label: "Mayúscula", met: /[A-Z]/.test(newPassword) },
    { label: "Número", met: /[0-9]/.test(newPassword) },
    { label: "Símbolo", met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) }
  ];

  return (
    <form onSubmit={handlePasswordChange} className="glass p-8 rounded-3xl border border-white/5 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
          <Lock className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold">Cambiar Contraseña</h3>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
          message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Contraseña Actual</label>
          <div className="relative">
             <input 
               type={showCurrent ? "text" : "password"} 
               value={currentPassword} 
               onChange={e => setCurrentPassword(e.target.value)} 
               required 
               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono"
               placeholder="••••••••"
             />
             <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
               {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Nueva Contraseña</label>
            <div className="relative">
               <input 
                 type={showNew ? "text" : "password"} 
                 value={newPassword} 
                 onChange={e => setNewPassword(e.target.value)} 
                 required 
                 className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono"
                 placeholder="••••••••"
               />
               <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">
                 {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
               </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Confirmar Nueva Contraseña</label>
            <input 
              type={showNew ? "text" : "password"} 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {requirements.map(req => (
            <span key={req.label} className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
              req.met ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-muted-foreground border-white/10'
            }`}>
              {req.met ? '✓' : '•'} {req.label}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button type="submit" disabled={loading} className="w-full md:w-auto px-10 py-3 rounded-2xl bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
        </button>
      </div>
    </form>
  );
}

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
      case 'SECRETARIO_ACTAS': return 'Secretario de Actas';
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
              <div className="flex flex-col gap-1">
                <p className="text-sm text-primary uppercase font-bold tracking-widest">{getRoleLabel(user.role)}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20 font-bold uppercase tracking-widest">
                    {(member?.category || 'DISCIPULO').replace(/_/g, ' ')}
                  </span>
                  {member?.memberNumber && (
                     <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/70 font-mono tracking-widest">Nº {member.memberNumber}</span>
                  )}
                </div>
              </div>              </div>
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
            <button type="submit" disabled={loading} className="btn-primary hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 px-8 min-w-[180px]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>

        {/* Cambiar Contraseña */}
        <PasswordChangeCard userId={userId} />
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
