'use client';

import { useSession } from 'next-auth/react';
import { RolUsuario } from '@/types/rol';

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const rol = user?.rol as RolUsuario | undefined;

  return {
    user,
    rol,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isAdmin: rol === RolUsuario.ADMIN,
    isManager: rol === RolUsuario.MANAGER,
    isVendedor: rol === RolUsuario.VENDEDOR,
    // Helper: verificar si tiene uno de los roles permitidos
    hasRole: (roles: RolUsuario[]) => {
      if (!rol) return false;
      return roles.includes(rol);
    },
  };
}
