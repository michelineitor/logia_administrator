import { 
  CreditCard, 
  Download, 
  Send, 
  Search,
  Calendar
} from 'lucide-react';

const mockRecentPayments = [
  { id: '1', member: 'Ricardo Alarcón', amount: 500, date: '2024-03-18', month: 'Marzo', year: 2024, status: 'Enviado' },
  { id: '2', member: 'Francisco Duarte', amount: 500, date: '2024-03-17', month: 'Marzo', year: 2024, status: 'Pendiente' },
  { id: '3', member: 'Miguel Sánchez', amount: 500, date: '2024-03-15', month: 'Febrero', year: 2024, status: 'Error' },
];

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Historial de Pagos
        </h2>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <CreditCard className="w-4 h-4" />
          Registrar Pago Nuevo
        </button>
      </div>

      <div className="glass p-4 rounded-xl border border-white/5 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar por miembro..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select className="bg-transparent text-sm text-foreground focus:outline-none">
            <option>Marzo 2024</option>
            <option>Febrero 2024</option>
          </select>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Miembro</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Monto</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Mes / Año</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha Registro</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Telegram</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Recibo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mockRecentPayments.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 text-sm font-medium">{p.member}</td>
                <td className="px-6 py-4 text-sm font-bold text-emerald-400">${p.amount}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{p.month} {p.year}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{p.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    p.status === 'Enviado' ? 'bg-emerald-400/10 text-emerald-400' : 
                    p.status === 'Pendiente' ? 'bg-amber-400/10 text-amber-400' : 'bg-rose-400/10 text-rose-400'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-primary">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-muted-foreground hover:text-primary">
                      <Send className="w-4 h-4" />
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
