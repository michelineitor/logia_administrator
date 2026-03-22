"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AppLayout({ children, role }: { children: React.ReactNode, role?: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Cerrar el menú principal en móviles al cambiar de página
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // Asegurar que inicie cerrado en móviles
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  // No mostrar el layout completo en la página de login o perfiles públicos de miembros
  const isMemberProfile = pathname.startsWith("/members/") && pathname !== "/members";
  if (pathname === "/" || isMemberProfile) {
    return <div className="min-h-screen bg-[#030712]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-background flex relative">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} role={role} />
      
      {/* Overlay responsivo para cerrar haciendo clic afuera */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main 
        className={`flex-1 transition-all duration-300 min-h-screen p-4 sm:p-8 min-w-0 ${
          isSidebarOpen ? 'md:ml-[260px]' : 'ml-0'
        }`}
      >
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
            title={isSidebarOpen ? "Ocultar menú" : "Mostrar menú"}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        {children}
      </main>
    </div>
  );
}
