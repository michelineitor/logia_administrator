import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || 'Usuario';
  const roleName = (session?.user as any)?.role || 'Rol';
  
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold">Bienvenido, {userName.split(' ')[0]}</h1>
          <p className="text-muted-foreground text-sm">Panel de control administrativo</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{roleName}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            {initials}
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
