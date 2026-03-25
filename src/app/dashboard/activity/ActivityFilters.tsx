"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search, X, Calendar } from "lucide-react";

interface ActivityFiltersProps {
  users: { id: string; name: string | null; role: string }[];
}

export default function ActivityFilters({ users }: ActivityFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [type, setType] = useState(searchParams.get("type") || "ALL");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");
  const [userId, setUserId] = useState(searchParams.get("userId") || "");
  const [role, setRole] = useState(searchParams.get("role") || "");

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === "" || value === "ALL") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      }

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const handleFilter = () => {
    const query = createQueryString({
      type,
      startDate: startDate || null,
      endDate: endDate || null,
      userId: userId || null,
      role: role || null,
    });
    router.push(`/dashboard/activity?${query}`);
  };

  const clearFilters = () => {
    setType("ALL");
    setStartDate("");
    setEndDate("");
    setUserId("");
    setRole("");
    router.push("/dashboard/activity");
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Filtros de Búsqueda</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Tipo */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Tipo de Actividad</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="PAYMENT">Pagos de Cuotas</option>
            <option value="INCOME">Otros Ingresos</option>
            <option value="EXPENSE">Gastos</option>
            <option value="CASHCOUNT">Arqueos de Caja</option>
          </select>
        </div>

        {/* Fecha Desde */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Desde</label>
          <div className="relative">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
            />
          </div>
        </div>

        {/* Fecha Hasta */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Hasta</label>
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Usuario */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Registrado por (Usuario)</label>
          <select 
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Cualquier usuario</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name || user.id}</option>
            ))}
          </select>
        </div>

        {/* Cargo */}
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Por Cargo / Rol</label>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">Cualquier cargo</option>
            <option value="ADMIN">Admin</option>
            <option value="TESORERO">Tesorero</option>
            <option value="VICE_TESORERO">Vice Tesorero</option>
            <option value="LUMINAR">Luminar</option>
            <option value="SECRETARIO_ACTAS">Secretario Actas</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button 
          onClick={handleFilter}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <Search className="w-4 h-4" />
          Aplicar Filtros
        </button>
        <button 
          onClick={clearFilters}
          className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
        >
          <X className="w-4 h-4" />
          Limpiar
        </button>
      </div>
    </div>
  );
}
