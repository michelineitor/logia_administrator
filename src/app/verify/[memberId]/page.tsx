import { prisma } from "@/lib/prisma";
import { CheckCircle2, XCircle, AlertTriangle, Sun } from 'lucide-react';
import { notFound } from "next/navigation";

async function getMember(id: string) {
  // Mock data for now if DB not initialized
  if (id === 'demo') {
    return {
      fullName: 'Miguel de Cervantes',
      status: 'ACTIVE',
      entryDate: new Date('2023-01-01'),
      payments: [{ id: 'demo-p1', date: new Date(), yearPaid: 2024, monthPaid: 3 }]
    };
  }
  
  try {
    return await prisma.member.findUnique({
      where: { id },
      include: { payments: true }
    });
  } catch (e) {
    return null;
  }
}

export default async function VerifyPage({ params }: { params: { memberId: string } }) {
  const member = await getMember(params.memberId);

  if (!member) notFound();

  const isActive = member.status === 'ACTIVE';
  
  // Find latest payment for the receipt
  const latestPayment = member.payments?.sort((a, b) => b.yearPaid - a.yearPaid || b.monthPaid - a.monthPaid)[0];

  const hasDebt = false; 

  return (
    <main className="min-h-screen bg-[#0a0e14] flex items-center justify-center p-6">
      <div className="max-w-md w-full glass p-8 rounded-3xl border border-white/5 text-center space-y-8 relative overflow-hidden">
        {/* Sun Aura Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-primary/20 blur-[60px] rounded-full -z-10"></div>

        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
            <Sun className="w-12 h-12 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Verificación Pública</h2>
            <h1 className="text-2xl font-bold gold-gradient italic">Soles y Rayos de Oriente No.7</h1>
          </div>
        </div>

        <div className="py-8 px-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Hermano</div>
            <div className="text-2xl font-bold text-foreground capitalize">{member.fullName}</div>
          </div>
          
          <div className="flex justify-center gap-12 py-4 border-y border-white/5">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {isActive ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400" />
                )}
              </div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Estado</p>
              <p className={`text-xs font-bold ${isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isActive ? 'ACTIVO' : 'INACTIVO'}
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {!hasDebt ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                )}
              </div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter">Solvencia</p>
              <p className={`text-xs font-bold ${!hasDebt ? 'text-emerald-400' : 'text-amber-400'}`}>
                {!hasDebt ? 'AL DÍA' : 'PENDIENTE'}
              </p>
            </div>
          </div>

          {latestPayment && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
               <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Último Pago Registrado</div>
               <div className="glass p-4 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">
                      {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][latestPayment.monthPaid - 1]} {latestPayment.yearPaid}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-medium uppercase">Registro: {new Date(latestPayment.date).toLocaleDateString()}</p>
                  </div>
                  <a 
                    href={`/api/payments/${latestPayment.id}/receipt`}
                    className="p-3 bg-primary/10 hover:bg-primary/20 rounded-xl transition-all border border-primary/20 group"
                    title="Descargar Recibo"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  </a>
               </div>
            </div>
          )}
        </div>

        <div className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">
          Esta información es oficial y de carácter público.<br />
          Benevolencia - Educación - Fraternidad
        </div>
      </div>
    </main>
  );
}
