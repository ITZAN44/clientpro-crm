'use client';

import { useAuth } from '@/hooks/use-auth';
import { RolUsuario } from '@/types/rol';
import { ReactNode } from 'react';

interface RoleGuardProps {
  roles: RolUsuario[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Componente que renderiza contenido solo si el usuario tiene uno de los roles permitidos
 * 
 * @example
 * // Solo ADMIN puede ver este botón
 * <RoleGuard roles={[RolUsuario.ADMIN]}>
 *   <Button>Eliminar</Button>
 * </RoleGuard>
 * 
 * @example
 * // ADMIN y MANAGER pueden ver este botón
 * <RoleGuard roles={[RolUsuario.ADMIN, RolUsuario.MANAGER]}>
 *   <Button>Editar</Button>
 * </RoleGuard>
 */
export function RoleGuard({ roles, children, fallback = null }: RoleGuardProps) {
  const { hasRole, isLoading } = useAuth();

  // Mientras carga, no mostrar nada
  if (isLoading) return null;

  // Si no tiene el rol, mostrar fallback (por defecto null)
  if (!hasRole(roles)) return <>{fallback}</>;

  // Si tiene el rol, mostrar el contenido
  return <>{children}</>;
}
