"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AppLayout({ children, role }: { children: React.ReactNode, role?: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  // No mostrar el layout en la página de login
  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} role={role} />
      <main 
        className={`flex-1 transition-all duration-300 min-h-screen p-8 ${
          isSidebarOpen ? 'ml-[260px]' : 'ml-0'
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
