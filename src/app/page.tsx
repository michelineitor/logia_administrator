import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary opacity-5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary opacity-10 blur-[120px] rounded-full"></div>

      <div className="glass p-10 rounded-2xl max-w-md w-full text-center space-y-8 relative z-10 border border-white/5">
        <div className="space-y-2">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            {/* SVG Sun Icon */}
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold gold-gradient italic px-2">Soles y Rayos de Oriente No.7</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Caballeros de la Luz</p>
        </div>

        <div className="space-y-4 pt-4">
          <p className="text-sm text-foreground/80">Acceso restringido al personal administrativo</p>
          <button className="btn-primary w-full flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.288 1.288-3.312 2.696-7.392 2.696-6.64 0-11.776-5.376-11.776-12s5.136-12 11.776-12c3.584 0 6.136 1.416 8.12 3.312l2.304-2.304C18.592 1.456 15.592 0 11.48 0 5.144 0 0 5.144 0 11.48s5.144 11.48 11.48 11.48c3.424 0 6.016-1.128 8.032-3.232 2.08-2.08 2.736-4.992 2.736-7.392 0-.712-.064-1.392-.184-2.016h-10.608z"/>
            </svg>
            Continuar con Google
          </button>
        </div>

        <div className="pt-6 border-t border-white/5 text-[10px] text-muted-foreground uppercase tracking-widest">
          Socio-Caridad-Unión
        </div>
      </div>
    </main>
  );
}
