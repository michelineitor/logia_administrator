import { Lightbulb, Send, History, CheckCircle2 } from "lucide-react";
import { submitProposal, getProposals } from "./actions";

export const dynamic = 'force-dynamic';

export default async function ProposalsPage() {
  const proposals = await getProposals();

  return (
    <div className="max-w-4xl mx-auto py-12 space-y-12">
      {/* Header / Objective */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
          <Lightbulb className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-black gold-gradient italic">Guía de Propuestas</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Este es un espacio de cocreación para todos los Hermanos. Buscamos iniciativas que optimicen nuestros recursos, generen bienestar en la comunidad o fortalezcan la sostenibilidad del Taller.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-400 text-xs font-bold uppercase tracking-widest">
          <CheckCircle2 className="w-4 h-4" />
          Todas las propuestas se analizan formalmente en Logia
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form Section */}
        <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Send className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-xl">Nueva Propuesta</h2>
          </div>
          
          <form action={submitProposal} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Título de la Iniciativa</label>
              <input 
                required 
                name="title" 
                type="text" 
                placeholder="Ej: Optimización de iluminación del Templo" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Categoría</label>
              <select 
                name="category" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-white color-scheme-dark"
              >
                <option value="AHORRO">Ahorro y Eficiencia</option>
                <option value="INGRESOS">Generación de Ingresos</option>
                <option value="BIENESTAR">Bienestar y Caridad</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Descripción detallada</label>
              <textarea 
                required 
                name="description" 
                rows={6} 
                placeholder="Explica tu idea, cómo se implementaría y qué beneficios traería..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Tu Nombre (Opcional)</label>
              <input 
                name="authorName" 
                type="text" 
                placeholder="Para que podamos contactarte si hay dudas" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>

            <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
              Enviar Propuesta a Logia
            </button>
          </form>
        </div>

        {/* History Section / How it works */}
        <div className="space-y-8">
          <div className="glass p-8 rounded-3xl border border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-400/10 rounded-lg text-blue-400">
                <History className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-xl">Propuestas Recientes</h2>
            </div>
            
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {proposals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">Aún no hay propuestas enviadas. ¡Sé el primero!</p>
              ) : proposals.map((p: any) => (
                <div key={p.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex justify-between items-start text-[10px] font-bold uppercase tracking-tighter">
                    <span className="text-primary">{p.category}</span>
                    <span className={
                      p.status === 'PENDING' ? 'text-amber-400' :
                      p.status === 'ACCEPTED' ? 'text-emerald-400' :
                      'text-muted-foreground'
                    }>
                      {p.status === 'PENDING' ? 'PENDIENTE' : 
                       p.status === 'ACCEPTED' ? 'ACEPTADA' : 
                       p.status === 'REVIEWED' ? 'EN REVISIÓN' : 'RECHAZADA'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm">{p.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                  <div className="flex justify-between items-center pt-2 text-[8px] text-muted-foreground uppercase tracking-widest">
                     <span>Por: {p.authorName || 'Anónimo'}</span>
                     <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 border border-primary/20 bg-primary/5 rounded-3xl space-y-4">
             <h4 className="font-bold text-sm uppercase tracking-widest">El Proceso:</h4>
             <ul className="space-y-3 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
               <li>La propuesta se registra de forma transparente en el sistema.</li>
               <li>Se presenta en la siguiente Sesión de Logia por el tesorero, luminar, vice-luminar o experto.</li>
               <li>Los Hermanos debaten su viabilidad y beneficio común.</li>
               <li>Se vota y, de ser aprobada, se asignan recursos y responsables.</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
