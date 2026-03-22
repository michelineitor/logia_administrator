import { getMemberById } from "../actions";
import { notFound } from "next/navigation";
import { User, Phone, Mail, Award, Calendar, CreditCard, Info, MapPin } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function MemberProfilePage({ params }: { params: { id: string } }) {
  const member = await getMemberById(params.id);

  if (!member) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'EXONERATED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'EXONERATED': return 'Exonerado';
      default: return 'Inactivo';
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Header / Profile Card */}
        <div className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative group">
              {member.imageUrl ? (
                <img src={member.imageUrl} alt={member.fullName} className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover shadow-2xl border-2 border-white/10" />
              ) : (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/5 flex items-center justify-center border-2 border-white/10">
                  <User className="w-16 h-16 text-white/10" />
                </div>
              )}
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(member.status)} shadow-lg backdrop-blur-md`}>
                {getStatusLabel(member.status)}
              </div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{member.fullName}</h1>
                {member.memberNumber && (
                  <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-white/50 font-mono text-xs">
                    Nº {member.memberNumber}
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest">
                  <Award className="w-3 h-3" />
                  {(member.category || 'DISCIPULO').replace(/_/g, ' ')}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white/70 rounded-full text-xs font-medium uppercase tracking-widest">
                  {(member.position || 'MIEMBRO').replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="glass p-6 rounded-3xl border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-widest">
                <Info className="w-4 h-4" /> Resumen
              </h3>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-white/30" />
                  <div>
                    <p className="text-[10px] text-white/30 uppercase font-bold">Fecha de Ingreso</p>
                    <p>{new Date(member.entryDate).toLocaleDateString('es-UY', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-white/30" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase font-bold">Contacto</p>
                      <p>{member.phone}</p>
                    </div>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-white/30" />
                    <div>
                      <p className="text-[10px] text-white/30 uppercase font-bold">Correo</p>
                      <p className="truncate">{member.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Datos Relevantes */}
            <div className="glass p-6 rounded-3xl border border-white/5 space-y-4 bg-primary/5">
              <h3 className="text-sm font-bold text-accent flex items-center gap-2 uppercase tracking-widest border-b border-white/5 pb-2">
                 Observaciones
              </h3>
              <div className="text-sm text-white/70 leading-relaxed italic">
                {member.relevantData || 'Sin información adicional relevante registrada.'}
              </div>
            </div>
          </div>

          {/* Right Column: Payments */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass p-6 rounded-3xl border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold flex items-center gap-3 uppercase tracking-widest">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Historial de Pagos
                </h3>
              </div>
              
              <div className="space-y-3">
                {member.payments && member.payments.length > 0 ? (
                  member.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold">{p.amount} {p.currency}</p>
                          <p className="text-xs text-white/50 capitalize">Cuota {p.monthPaid}/{p.yearPaid}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Completado</p>
                        <p className="text-[9px] text-white/30 mt-1">{new Date(p.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <CreditCard className="w-12 h-12 text-white/5 mx-auto" />
                    <p className="text-sm text-white/30 uppercase font-bold tracking-widest">No hay pagos registrados</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center pt-8 opacity-20 hover:opacity-100 transition-opacity">
           <p className="text-[10px] uppercase font-bold tracking-[0.3em]">Soles y Rayos de Oriente No.7 • Gestión Administrativa</p>
        </div>
      </div>
    </div>
  );
}
