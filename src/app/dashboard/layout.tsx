

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold">Bienvenido, Tesorero</h1>
          <p className="text-muted-foreground text-sm">Panel de control administrativo</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Juan Pérez</p>
            <p className="text-xs text-muted-foreground">Administrador</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            JP
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
