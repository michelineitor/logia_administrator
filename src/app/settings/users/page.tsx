import { getUsers } from './actions';
import UserManagerClient from './UserManagerClient';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/settings" className="text-muted-foreground hover:text-white transition-colors text-sm font-medium">
              Configuración
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Usuarios</span>
          </div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Gestión de Roles y Usuarios
          </h2>
        </div>
      </div>

      <UserManagerClient initialUsers={users} />
    </div>
  );
}
