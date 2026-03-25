'use client'

import { useState, useEffect } from "react"
import { getCashCountsHistory, approveCashCount, approveDifferenceResolution } from "../balance/actions"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle, Clock, AlertCircle, User, Shield, Check } from "lucide-react"

export default function AuditManagementClient({ currentUser }: { currentUser: any }) {
  const [counts, setCounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCounts = async () => {
    setLoading(true)
    const res = await getCashCountsHistory()
    setCounts(res)
    setLoading(false)
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  const handleApprove = async (id: string) => {
    const res = await approveCashCount(id)
    if (res.success) fetchCounts()
    else alert(res.error)
  }

  const handleResolve = async (id: string) => {
    const res = await approveDifferenceResolution(id)
    if (res.success) fetchCounts()
    else alert(res.error)
  }

  const canApprove = (count: any, role: string) => {
    if (role === 'ADMIN') return true
    if (role === 'LUMINAR' && !count.approvedByLuminarId) return true
    if (role === 'TESORERO' && !count.approvedByTesoreroId) return true
    return false
  }

  const canResolve = (count: any, role: string) => {
    if (count.deviationUYU === 0 && count.deviationUSD === 0) return false
    if (count.isCleared) return false
    if (role === 'ADMIN') return true
    if (role === 'LUMINAR' && !count.resolvedByLuminarId) return true
    if (role === 'TESORERO' && !count.resolvedByTesoreroId) return true
    return false
  }

  return (
    <div className="space-y-6">
      <div className="glass p-6 rounded-2xl border border-white/5">
        <h1 className="text-2xl font-bold gold-gradient italic">Gestión de Arqueos</h1>
        <p className="text-muted-foreground text-sm">Validación de tesorería (Luminar + Tesorero)</p>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           </div>
        ) : counts.map((count) => (
          <div key={count.id} className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-lg font-bold">{format(new Date(count.date), "PPP", { locale: es })}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">ID: {count.id}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                count.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
              }`}>
                {count.status === 'APPROVED' ? 'Aprobado' : 'Pendiente'}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase">Esperado</p>
                <p className="font-mono font-bold">$ {count.expectedUYU.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase">Real</p>
                <p className="font-mono font-bold">$ {count.totalActualUYU.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-xl border ${count.deviationUYU === 0 ? 'bg-white/5 border-white/5' : 'bg-red-500/5 border-red-500/20'}`}>
                <p className="text-[10px] text-muted-foreground uppercase">Diferencia</p>
                <p className={`font-mono font-bold ${count.deviationUYU !== 0 ? 'text-red-400' : ''}`}>$ {count.deviationUYU.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase">Registrado por</p>
                <p className="text-xs font-medium">{count.registeredBy?.name || 'Sistema'}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5">
              {/* Approval status */}
              <div className="flex-1 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">APROBACIÓN DEL ARQUEO</p>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    {count.approvedByTesoreroId ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                    <span className={`text-xs ${count.approvedByTesoreroId ? 'text-foreground' : 'text-muted-foreground'}`}>Tesorero</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {count.approvedByLuminarId ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                    <span className={`text-xs ${count.approvedByLuminarId ? 'text-foreground' : 'text-muted-foreground'}`}>Luminar</span>
                  </div>
                </div>
                {canApprove(count, currentUser.role) && count.status === 'PENDING' && (
                  <button 
                    onClick={() => handleApprove(count.id)}
                    className="mt-2 w-full md:w-auto px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Aprobar Arqueo
                  </button>
                )}
              </div>

              {/* Difference resolution status */}
              {count.deviationUYU !== 0 && (
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">RESOLUCIÓN DE DIFERENCIA</p>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      {count.resolvedByTesoreroId ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                      <span className={`text-xs ${count.resolvedByTesoreroId ? 'text-foreground' : 'text-muted-foreground'}`}>Tesorero</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {count.resolvedByLuminarId ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                      <span className={`text-xs ${count.resolvedByLuminarId ? 'text-foreground' : 'text-muted-foreground'}`}>Luminar</span>
                    </div>
                  </div>
                  {canResolve(count, currentUser.role) && (
                    <button 
                      onClick={() => handleResolve(count.id)}
                      className="mt-2 w-full md:w-auto px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Aprobar Resolución
                    </button>
                  )}
                  {count.isCleared && (
                    <p className="text-[10px] text-green-400 italic">Diferencia resuelta y conciliada</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
