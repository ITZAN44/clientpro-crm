'use client';

import * as React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  LogOut,
  Settings,
  Bell,
  ArrowLeft,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Crown,
  User,
  Loader2,
  Edit,
} from 'lucide-react';
import Link from 'next/link';
import { getUsuarios, updateUsuarioRol } from '@/lib/api/usuarios';
import { Usuario } from '@/types/usuario';
import { RolUsuario } from '@/types/rol';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth';
import { EditarRolDialog } from '@/components/admin/editar-rol-dialog';
import { useAuth } from '@/hooks/use-auth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const ROL_CONFIG = {
  [RolUsuario.ADMIN]: {
    label: 'Administrador',
    icon: Crown,
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-300 dark:border-purple-700',
    iconClass: 'text-purple-600 dark:text-purple-400',
  },
  [RolUsuario.MANAGER]: {
    label: 'Manager',
    icon: Users,
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-300 dark:border-green-700',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  [RolUsuario.VENDEDOR]: {
    label: 'Vendedor',
    icon: User,
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-300 dark:border-blue-700',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
};

export default function UsuariosAdminPage() {
  const { data: session, status } = useSession();
  const { rol } = useAuth();
  const queryClient = useQueryClient();

  const [editingUsuario, setEditingUsuario] = React.useState<Usuario | null>(null);

  // Query para obtener usuarios
  const { data: usuarios, isLoading, error } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token de autenticación');
      return getUsuarios(token);
    },
    enabled: !!session,
  });

  // Mutation para actualizar rol
  const updateRolMutation = useMutation({
    mutationFn: ({ id, nuevoRol }: { id: string; nuevoRol: RolUsuario }) => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token de autenticación');
      return updateUsuarioRol(token, id, { rol: nuevoRol });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Rol actualizado exitosamente');
      setEditingUsuario(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar rol');
    },
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-orange-50/20 to-lime-50/10">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-stone-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditarRol = (usuario: Usuario) => {
    setEditingUsuario(usuario);
  };

  const handleConfirmEditarRol = (nuevoRol: RolUsuario) => {
    if (editingUsuario) {
      updateRolMutation.mutate({ id: editingUsuario.id, nuevoRol });
    }
  };

  const getRolBadge = (rolUsuario: RolUsuario) => {
    const config = ROL_CONFIG[rolUsuario];
    const RolIcon = config.icon;
    return (
      <Badge className={`${config.bgClass} ${config.textClass} border ${config.borderClass} font-medium px-3 py-1`}>
        <RolIcon className="h-3.5 w-3.5 mr-1.5" />
        {config.label}
      </Badge>
    );
  };

  return (
    <ProtectedRoute roles={[RolUsuario.ADMIN]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Administración de Usuarios
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Gestiona roles y permisos del equipo
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </Button>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-sm opacity-30" />
                    <Avatar className="relative h-9 w-9 border-2 border-white dark:border-slate-900">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                        {session?.user?.name ? getInitials(session.user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {session?.user?.name || 'Usuario'}
                      </p>
                      {rol && getRolBadge(rol)}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {session?.user?.email || ''}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
          <Card className="border-slate-200 dark:border-slate-700 shadow-xl backdrop-blur-sm bg-white/90 dark:bg-slate-900/90">
            {/* Card Header con gradiente */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Lista de Usuarios
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {usuarios?.length || 0} usuarios registrados
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700" />
                      <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Cargando usuarios...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Error al cargar usuarios</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      No se pudieron cargar los usuarios. Por favor, intenta de nuevo.
                    </p>
                    <Button
                      onClick={() => queryClient.invalidateQueries({ queryKey: ['usuarios'] })}
                      variant="outline"
                      className="mt-2"
                    >
                      Reintentar
                    </Button>
                  </div>
                </div>
              ) : (
                <motion.div 
                  className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                >
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 hover:from-blue-50 hover:to-purple-50 dark:hover:from-slate-800 dark:hover:to-slate-800">
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Usuario</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Email</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Rol</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Estado</TableHead>
                        <TableHead className="font-bold text-slate-900 dark:text-slate-100">Fecha Creación</TableHead>
                        <TableHead className="text-right font-bold text-slate-900 dark:text-slate-100">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios?.map((usuario) => (
                        <motion.tr 
                          key={usuario.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 border-b border-slate-200 dark:border-slate-700"
                          variants={fadeInUp}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {/* Avatar con border gradiente */}
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-sm opacity-30" />
                                <Avatar className="relative h-10 w-10 border-2 border-white dark:border-slate-900">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
                                    {getInitials(usuario.nombre)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <span className="font-semibold text-slate-900 dark:text-slate-100">
                                {usuario.nombre}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">
                            {usuario.email}
                          </TableCell>
                          <TableCell>
                            {getRolBadge(usuario.rol)}
                          </TableCell>
                          <TableCell>
                            {usuario.estaActivo ? (
                              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                <div className="flex h-2 w-2 rounded-full bg-green-500">
                                  <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                                </div>
                                <span className="text-sm font-medium">Activo</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <span className="text-sm font-medium">Inactivo</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 font-medium">
                            {new Date(usuario.creadoEn).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarRol(usuario)}
                              className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Cambiar Rol
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
        </main>

        {/* Dialog de Editar Rol */}
        <EditarRolDialog
          usuario={editingUsuario}
          open={!!editingUsuario}
          onOpenChange={(open) => !open && setEditingUsuario(null)}
          onConfirm={handleConfirmEditarRol}
          isLoading={updateRolMutation.isPending}
        />
      </div>
    </ProtectedRoute>
  );
}
