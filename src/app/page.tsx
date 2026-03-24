"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary opacity-5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary opacity-10 blur-[120px] rounded-full"></div>

      <div className="glass p-10 rounded-2xl max-w-md w-full text-center space-y-8 relative z-10 border border-white/5">
        <div className="space-y-2">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/10 overflow-hidden p-2">
            <img 
              src="/logo.png" 
              alt="Logo Soles y Rayos" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold gold-gradient italic px-2">Soles y Rayos de Oriente No.7</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">Caballeros de la Luz</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-left">
          <p className="text-sm text-foreground/80 text-center mb-6">Acceso restringido al personal administrativo</p>
          
          {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
              placeholder="Ej: michel"
            />
          </div>

          <div className="space-y-2 pb-4">
            <label className="text-sm font-medium text-foreground">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            Ingresar al Sistema
          </button>
        </form>

        <div className="pt-6 border-t border-white/5 text-[10px] text-muted-foreground uppercase tracking-widest">
          Socio-Caridad-Unión
        </div>
      </div>
    </main>
  );
}
