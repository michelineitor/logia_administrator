import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground font-medium animate-pulse">Cargando...</p>
    </div>
  );
}
