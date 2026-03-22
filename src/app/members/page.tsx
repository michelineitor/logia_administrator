import { 
  Users, 
  Search,
  MoreVertical,
  QrCode,
  ExternalLink,
  Shield
} from 'lucide-react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMembers } from './actions';
import MemberFormClient from './MemberFormClient';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role === 'MEMBER' || role === 'GUEST') redirect('/dashboard');

  let members = [];
  try {
    members = await getMembers();
  } catch (error: any) {
    console.error("Error loading members:", error);
    return (
      <div className="p-8 text-center glass rounded-2xl border border-rose-500/30">
        <h2 className="text-xl text-rose-500 font-bold mb-2">Error cargando miembros</h2>
        <p className="text-muted-foreground">{error.message || "Error de conexión con la base de datos."}</p>
        <p className="text-xs text-rose-400 mt-4 opacity-50">Por favor, verifica que la base de datos de producción esté sincronizada y desplegada correctamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Gestión de Miembros
        </h2>
        <MemberFormClient />
      </div>

      {/* Search & Filters */}
      <div className="glass p-4 rounded-xl border border-white/5 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, correo o ID..." 
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <select className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none">
          <option>Todos los Estados</option>
          <option>ACTIVE</option>
          <option>INACTIVE</option>
        </select>
      </div>

      {/* Members Table */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Miembro</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Cargo</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Contacto</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Estado</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Ingreso</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">No hay miembros registrados.</td>
              </tr>
            ) : members.map((member: any) => (
              <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {member.imageUrl ? (
                      <img src={member.imageUrl} alt={member.fullName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-xs shrink-0">
                        {(member.fullName || 'NN').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{member.fullName}</p>
                        {member.user && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-primary animate-pulse" />
                            <span className="text-[8px] text-primary/50 font-bold uppercase">Online</span>
                          </div>
                        )}
                      </div>
                      {member.memberNumber && (
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Nº {member.memberNumber}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-foreground/80 bg-white/5 px-2 py-1 rounded-lg">
                    {member.position || 'DISCIPULO'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs text-muted-foreground">{member.email || '-'}</p>
                  <p className="text-xs text-muted-foreground">{member.phone || '-'}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    member.status === 'ACTIVE' ? 'bg-emerald-400/10 text-emerald-400' : 
                    'bg-slate-400/10 text-slate-400'
                  }`}>
                    {member.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(member.entryDate).toLocaleDateString('es-UY')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-primary" title="Generar QR">
                      <QrCode className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Ver Perfil">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-foreground" title="Opciones">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
