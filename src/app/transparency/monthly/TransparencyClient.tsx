'use client'

import { useState, useEffect } from "react"
import { getMonthlyTransparencyData } from "../actions"
import { generateModelo40 } from "@/lib/pdf-generator"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Download, Eye, FileText, AlertTriangle } from "lucide-react"

export default function TransparencyClient() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM'))
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    const [year, month] = date.split('-').map(Number)
    const res = await getMonthlyTransparencyData(month, year)
    if (res.success) {
      setData(res.data)
    } else {
      setError(res.error || "Error cargando datos")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [date])

  const handleDownload = () => {
    if (!data) return
    const [year, month] = date.split('-').map(Number)
    generateModelo40(data, month, year)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-bold gold-gradient italic">Transparencia Mensual</h1>
          <p className="text-muted-foreground text-sm">Consulta de ingresos, gastos y arqueos</p>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
          />
          <button 
            onClick={handleDownload}
            disabled={!data || loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl hover:bg-primary/20 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p>Cargando información...</p>
        </div>
      )}

      {error && (
        <div className="glass p-8 rounded-2xl border border-red-500/20 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Card */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resumen del Periodo</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm">Patrimonio al Inicio</span>
                <span className="font-mono">$ {(data.lastCountBeforeMonth?.totalActualUYU || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-green-400">
                <span className="text-sm">Ingresos (Cuotas + Otros)</span>
                <span className="font-mono">+ $ {(data.payments.reduce((a:any, b:any) => a+b.amount, 0) + data.incomes.reduce((a:any, b:any) => a+b.amount, 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 text-red-400">
                <span className="text-sm">Gastos</span>
                <span className="font-mono">- $ {data.expenses.reduce((a:any, b:any) => a+b.amount, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="font-bold">Saldo Final Esperado</span>
                <span className="text-xl font-bold gold-gradient">
                  $ {(
                    (data.lastCountBeforeMonth?.totalActualUYU || 0) + 
                    data.payments.reduce((a:any, b:any) => a+b.amount, 0) + 
                    data.incomes.reduce((a:any, b:any) => a+b.amount, 0) - 
                    data.expenses.reduce((a:any, b:any) => a+b.amount, 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Audit Status Card */}
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Estado del Arqueo</h3>
            {data.monthAudit ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Arqueo aprobado y verificado</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase">Banco</p>
                    <p className="font-mono font-bold">$ {data.monthAudit.actualBankUYU.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase">Efectivo</p>
                    <p className="font-mono font-bold">$ {data.monthAudit.actualCashUYU.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-6 text-muted-foreground gap-2">
                <AlertTriangle className="w-8 h-8 opacity-20" />
                <p className="text-sm italic">Arqueo mensual aún no aprobado</p>
              </div>
            )}
          </div>

          {/* Detailed Lists */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold">Detalle de Transacciones</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Incomes List */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  Ingresos
                </h4>
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                  {[...data.payments, ...data.incomes].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm font-medium">{item.member?.fullName || item.comment || item.type}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(item.date), 'dd/MM/yyyy')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-green-400">$ {(item.amount || 0).toLocaleString()}</span>
                        {(item.imageProofUrl || item.receiptUrl) && (
                          <a href={item.imageProofUrl || item.receiptUrl} target="_blank" className="p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-primary transition-all">
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expenses List */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  Egresos
                </h4>
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                  {data.expenses.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm font-medium">{item.category}</p>
                        <p className="text-[10px] text-muted-foreground">{format(new Date(item.date), 'dd/MM/yyyy')} - {item.comment}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-red-400">$ {item.amount.toLocaleString()}</span>
                        {item.imageProofUrl && (
                          <a href={item.imageProofUrl} target="_blank" className="p-1.5 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-primary transition-all">
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
