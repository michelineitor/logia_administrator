import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Wallet, 
  Settings, 
  LogOut,
  Sun
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Miembros', href: '/members' },
  { icon: CreditCard, label: 'Pagos', href: '/payments' },
  { icon: Wallet, label: 'Tesorería', href: '/treasury' },
  { icon: Settings, label: 'Configuración', href: '/settings' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar glass border-r border-white/5">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
          <Sun className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-bold gold-gradient italic leading-tight">Soles y Rayos</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:text-primary hover:bg-white/5 transition-all group"
          >
            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/5">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-foreground/70 hover:text-red-400 hover:bg-red-400/5 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
