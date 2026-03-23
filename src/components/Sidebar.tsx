import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Wallet, 
  Settings, 
  LogOut,
  Sun,
  Scale,
  Shield,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Users, label: 'Miembros', href: '/members' },
  { icon: CreditCard, label: 'Pagos', href: '/payments' },
  { icon: Wallet, label: 'Tesorería', href: '/treasury' },
  { icon: Scale, label: 'Arqueo de Caja', href: '/treasury/balance' },
  { icon: Shield, label: 'Usuarios', href: '/settings/users' },
  { icon: AlertCircle, label: 'Alertas', href: '/settings/alerts' },
  { icon: Settings, label: 'Configuración', href: '/settings' },
  { icon: UserIcon, label: 'Mi Perfil', href: '/profile' }
];

export default function Sidebar({ isOpen, setIsOpen, role }: { isOpen: boolean, setIsOpen: (val: boolean) => void, role?: string }) {
  const isBasic = role === 'MEMBER' || role === 'GUEST';

  const visibleItems = menuItems.filter(item => {
    if (isBasic) {
      return item.href === '/dashboard' || item.href === '/profile';
    }
    return true;
  });

  return (
    <aside className={`sidebar glass border-r border-white/5 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
        {visibleItems.map((item) => (
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
