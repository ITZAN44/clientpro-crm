'use client';

import { useAuth } from '@/hooks/use-auth';
import { RolUsuario } from '@/types/rol';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  roles: RolUsuario[];
  children: ReactNode;
  redirectTo?: string;
}

/**
 * HOC que protege una página completa según roles
 * Si el usuario no tiene el rol requerido, redirige a /dashboard
 * 
 * @example
 * // En una página de admin
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute roles={[RolUsuario.ADMIN]}>
 *       <div>Contenido solo para ADMIN</div>
 *     </ProtectedRoute>
 *   );
 * }
 */
export function ProtectedRoute({ 
  roles, 
  children, 
  redirectTo = '/dashboard' 
}: ProtectedRouteProps) {
  const { hasRole, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Esperar a que termine de cargar
    if (isLoading) return;

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Si no tiene el rol requerido, redirigir
    if (!hasRole(roles)) {
      router.push(redirectTo);
    }
  }, [hasRole, isLoading, isAuthenticated, roles, router, redirectTo]);

  // Mientras carga o valida, mostrar loading
  if (isLoading || !isAuthenticated || !hasRole(roles)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Verificando permisos...</div>
      </div>
    );
  }

  // Si tiene permisos, mostrar contenido
  return <>{children}</>;
}
