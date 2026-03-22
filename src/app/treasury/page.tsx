import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search,
  Filter,
  Image as ImageIcon
} from 'lucide-react';
import { getTransactions } from './actions';
import TransactionFormsClient from './TransactionFormsClient';

export const dynamic = 'force-dynamic';

export default async function TreasuryPage() {
  const transactions = await getTransactions();

  // Basic calculation for current visible data
  const totalIncomesUYU = transactions
    .filter(t => t.type === 'INCOME' && t.currency === 'UYU')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalExpensesUYU = transactions
    .filter(t => t.type === 'EXPENSE' && t.currency === 'UYU')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balanceUYU = totalIncomesUYU - totalExpensesUYU;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold">Gestión de Tesorería</h2>
        <div className="w-full md:w-auto">
          <TransactionFormsClient />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-white/5 bg-emerald-400/[0.02]">
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Total Ingresos</p>
          <h3 className="text-2xl font-bold text-emerald-400">
            {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(totalIncomesUYU)}
          </h3>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/5 bg-rose-400/[0.02]">
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Total Gastos</p>
          <h3 className="text-2xl font-bold text-rose-400">
            {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(totalExpensesUYU)}
          </h3>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/5 bg-primary/5">
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Balance Actual</p>
          <h3 className="text-2xl font-bold gold-gradient">
            {new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU' }).format(balanceUYU)}
          </h3>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar movimientos..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50" />
          </div>
          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm flex items-center gap-2 hover:bg-white/10 transition-all">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tipo</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Categoría</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Monto</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Método</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fecha</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Concepto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground">No hay transacciones registradas.</td>
              </tr>
            ) : transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  {tx.type === 'INCOME' ? (
                    <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5 text-rose-400" />
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium">{tx.category.replace(/_/g, ' ')}</td>
                <td className={`px-6 py-4 text-sm font-bold ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{new Intl.NumberFormat('es-UY', { style: 'currency', currency: tx.currency }).format(tx.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] uppercase font-bold tracking-wider">{tx.method}</span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(tx.date).toLocaleDateString('es-UY', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-sm text-foreground/80">{tx.comment || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
