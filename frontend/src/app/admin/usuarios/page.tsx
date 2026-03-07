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
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-400',
    borderClass: 'border-violet-500/30',
    iconClass: 'text-violet-400',
  },
  [RolUsuario.MANAGER]: {
    label: 'Manager',
    icon: Users,
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    iconClass: 'text-emerald-400',
  },
  [RolUsuario.VENDEDOR]: {
    label: 'Vendedor',
    icon: User,
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
    iconClass: 'text-blue-400',
  },
};

export default function UsuariosAdminPage() {
  const { data: session, status } = useSession();
  const { rol } = useAuth();
  const queryClient = useQueryClient();

  const [editingUsuario, setEditingUsuario] = React.useState<Usuario | null>(null);

  // Query para obtener usuarios
  const {
    data: usuarios,
    isLoading,
    error,
  } = useQuery({
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Cargando...</p>
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
      <Badge
        className={`${config.bgClass} ${config.textClass} border ${config.borderClass} font-medium px-3 py-1`}
      >
        <RolIcon className="h-3.5 w-3.5 mr-1.5" />
        {config.label}
      </Badge>
    );
  };

  return (
    <ProtectedRoute roles={[RolUsuario.ADMIN]}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/90">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-serif text-foreground">
                      Administración de Usuarios
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Gestiona roles y permisos del equipo
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Settings className="h-5 w-5" />
                </Button>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 ring-1 ring-primary/30">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {session?.user?.name ? getInitials(session.user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {session?.user?.name || 'Usuario'}
                      </p>
                      {rol && getRolBadge(rol)}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {session?.user?.email || ''}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <Card className="bg-card border border-border">
              {/* Card Header */}
              <div className="p-6 border-b border-border bg-muted">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-serif text-foreground">Lista de Usuarios</h2>
                      <p className="text-sm text-muted-foreground">
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
                        <div className="h-12 w-12 rounded-full border-4 border-border" />
                        <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                      </div>
                      <p className="text-muted-foreground text-sm font-medium">
                        Cargando usuarios...
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4 text-center max-w-sm">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-8 w-8 text-destructive" />
                      </div>
                      <h3 className="font-serif text-lg text-foreground">
                        Error al cargar usuarios
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        No se pudieron cargar los usuarios. Por favor, intenta de nuevo.
                      </p>
                      <Button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['usuarios'] })}
                        variant="outline"
                        className="mt-2 border-border"
                      >
                        Reintentar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    className="rounded-lg border border-border overflow-hidden"
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted">
                          <TableHead className="font-semibold text-foreground">Usuario</TableHead>
                          <TableHead className="font-semibold text-foreground">Email</TableHead>
                          <TableHead className="font-semibold text-foreground">Rol</TableHead>
                          <TableHead className="font-semibold text-foreground">Estado</TableHead>
                          <TableHead className="font-semibold text-foreground">
                            Fecha Creación
                          </TableHead>
                          <TableHead className="text-right font-semibold text-foreground">
                            Acciones
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usuarios?.map((usuario) => (
                          <motion.tr
                            key={usuario.id}
                            className="hover:bg-accent/50 transition-colors duration-150 border-b border-border"
                            variants={fadeInUp}
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 ring-1 ring-border">
                                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                    {getInitials(usuario.nombre)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">
                                  {usuario.nombre}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-xs text-muted-foreground">
                                {usuario.email}
                              </span>
                            </TableCell>
                            <TableCell>{getRolBadge(usuario.rol)}</TableCell>
                            <TableCell>
                              {usuario.estaActivo ? (
                                <div className="flex items-center gap-2 text-emerald-400">
                                  <div className="flex h-2 w-2 rounded-full bg-emerald-500">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                  </div>
                                  <span className="text-sm font-medium">Activo</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                                  <span className="text-sm font-medium">Inactivo</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-xs text-muted-foreground">
                                {new Date(usuario.creadoEn).toLocaleDateString('es-MX', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditarRol(usuario)}
                                className="gap-2 border-border"
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
