'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  ArrowLeft,
  Phone,
  Mail,
  Users,
  CheckSquare,
  FileText,
  Calendar,
  Building2,
  Briefcase,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ActividadFormDialog } from './actividad-form-dialog';
import {
  getActividades,
  createActividad,
  updateActividad,
  deleteActividad,
  marcarActividadCompletada,
} from '@/lib/api/actividades';
import { getClientes } from '@/lib/api/clientes';
import { getNegocios } from '@/lib/api/negocios';
import type {
  Actividad,
  CreateActividadDto,
  UpdateActividadDto,
  TipoActividad,
} from '@/types/actividad';
import { TIPO_ACTIVIDAD_CONFIG, TIPO_ACTIVIDAD_LABELS } from '@/types/actividad';
import { fadeInUp, staggerContainer } from '@/lib/motion';

export default function ActividadesPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [tipoFiltro, setTipoFiltro] = React.useState<string>('TODOS');
  const [completadaFiltro, setCompletadaFiltro] = React.useState<string>('TODOS');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingActividad, setEditingActividad] = React.useState<Actividad | undefined>();
  const [deletingActividad, setDeletingActividad] = React.useState<Actividad | undefined>();

  // Redirect si no está autenticado
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // Debounce del search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      if (debouncedSearch !== search) {
        setPage(1);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [search]);

  // Query actividades
  const { data: actividadesData, isLoading } = useQuery({
    queryKey: ['actividades', page, debouncedSearch, tipoFiltro, completadaFiltro],
    queryFn: () => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token');
      return getActividades(token, {
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        tipo: tipoFiltro !== 'TODOS' ? tipoFiltro : undefined,
        completada: completadaFiltro !== 'TODOS' ? completadaFiltro === 'true' : undefined,
      });
    },
    enabled: !!session,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Query clientes para el formulario
  const { data: clientesData } = useQuery({
    queryKey: ['clientes-simple'],
    queryFn: () => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token');
      return getClientes(token, 1, 100);
    },
    enabled: !!session && isFormOpen,
  });

  // Query negocios para el formulario
  const { data: negociosData } = useQuery({
    queryKey: ['negocios-simple'],
    queryFn: () => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token');
      return getNegocios(token, 1, 100);
    },
    enabled: !!session && isFormOpen,
  });

  // Mutation crear
  const createMutation = useMutation({
    mutationFn: (data: CreateActividadDto) => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token');
      return createActividad(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
      setIsFormOpen(false);
      toast.success('Actividad creada correctamente');
    },
    onError: () => {
      toast.error('Error al crear la actividad');
    },
  });

  // Mutation actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActividadDto }) => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token');
      return updateActividad(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
      setIsFormOpen(false);
      setEditingActividad(undefined);
      toast.success('Actividad actualizada correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar la actividad');
    },
  });

  // Mutation completar
  const completarMutation = useMutation({
    mutationFn: (id: string) => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token');
      return marcarActividadCompletada(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
      toast.success('Actividad marcada como completada');
    },
    onError: () => {
      toast.error('Error al completar la actividad');
    },
  });

  // Mutation eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token');
      return deleteActividad(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
      setDeletingActividad(undefined);
      toast.success('Actividad eliminada correctamente');
    },
    onError: () => {
      toast.error('Error al eliminar la actividad');
    },
  });

  const handleSubmit = (data: CreateActividadDto | UpdateActividadDto) => {
    if (editingActividad) {
      updateMutation.mutate({ id: editingActividad.id, data });
    } else {
      createMutation.mutate(data as CreateActividadDto);
    }
  };

  const handleEdit = (actividad: Actividad) => {
    setEditingActividad(actividad);
    setIsFormOpen(true);
  };

  const handleDelete = (actividad: Actividad) => {
    setDeletingActividad(actividad);
  };

  const handleCompletar = (actividad: Actividad) => {
    if (!actividad.completada) {
      completarMutation.mutate(actividad.id);
    }
  };

  const getTipoIcon = (tipo: TipoActividad) => {
    switch (tipo) {
      case 'LLAMADA':
        return <Phone className="h-5 w-5 text-blue-400" />;
      case 'EMAIL':
        return <Mail className="h-5 w-5 text-emerald-400" />;
      case 'REUNION':
        return <Users className="h-5 w-5 text-violet-400" />;
      case 'TAREA':
        return <CheckSquare className="h-5 w-5 text-amber-400" />;
      case 'NOTA':
        return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const actividades = actividadesData?.data || [];
  const totalPages = actividadesData?.meta?.totalPages || 1;

  return (
    <div className="min-h-screen bg-background">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif text-foreground">Actividades</h1>
                  <p className="font-mono text-xs text-muted-foreground">
                    {actividadesData?.meta?.total || 0} actividades en total
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingActividad(undefined);
                setIsFormOpen(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Actividad
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros Pills */}
        <div className="mb-8 space-y-4">
          {/* Búsqueda */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar actividades..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Filtros por Tipo */}
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">
              Filtrar por tipo:
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Todos */}
              <button
                onClick={() => setTipoFiltro('TODOS')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 border ${
                  tipoFiltro === 'TODOS'
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                Todos
              </button>
              {/* Llamada */}
              <button
                onClick={() => setTipoFiltro('LLAMADA')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 border flex items-center gap-2 ${
                  tipoFiltro === 'LLAMADA'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                Llamadas
              </button>
              {/* Reunión */}
              <button
                onClick={() => setTipoFiltro('REUNION')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 border flex items-center gap-2 ${
                  tipoFiltro === 'REUNION'
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                    : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Reuniones
              </button>
              {/* Email */}
              <button
                onClick={() => setTipoFiltro('EMAIL')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 border flex items-center gap-2 ${
                  tipoFiltro === 'EMAIL'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                Emails
              </button>
              {/* Tarea */}
              <button
                onClick={() => setTipoFiltro('TAREA')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 border flex items-center gap-2 ${
                  tipoFiltro === 'TAREA'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                Tareas
              </button>
              {/* Nota */}
              <button
                onClick={() => setTipoFiltro('NOTA')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 border flex items-center gap-2 ${
                  tipoFiltro === 'NOTA'
                    ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Notas
              </button>
            </div>
          </div>

          {/* Filtros por Estado */}
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-3 uppercase tracking-wider">
              Filtrar por estado:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCompletadaFiltro('TODOS')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 border ${
                  completadaFiltro === 'TODOS'
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setCompletadaFiltro('false')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 border ${
                  completadaFiltro === 'false'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setCompletadaFiltro('true')}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 border ${
                  completadaFiltro === 'true'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                }`}
              >
                Completadas
              </button>
            </div>
          </div>
        </div>

        {/* Timeline de Actividades */}
        {isLoading ? (
          <Card className="p-12 text-center bg-card border-border">
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-primary/20 rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground font-mono text-sm">Cargando actividades...</p>
            </div>
          </Card>
        ) : actividades.length === 0 ? (
          <Card className="p-12 text-center bg-card border-border">
            <CheckSquare className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-serif text-foreground mb-2">No hay actividades</h3>
            <p className="text-muted-foreground text-sm">
              {search || tipoFiltro !== 'TODOS' || completadaFiltro !== 'TODOS'
                ? 'No se encontraron actividades con los filtros aplicados'
                : 'Crea tu primera actividad para comenzar'}
            </p>
          </Card>
        ) : (
          <motion.div
            className="relative"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Línea vertical del timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border"></div>

            {/* Lista de actividades */}
            <div className="space-y-6">
              {actividades.map((actividad, index) => {
                const config = TIPO_ACTIVIDAD_CONFIG[actividad.tipo];
                const vencida =
                  actividad.fechaVencimiento &&
                  new Date(actividad.fechaVencimiento) < new Date() &&
                  !actividad.completada;

                // Determinar clases de color semántico según tipo
                let nodeBorderClass = '';
                let cardBorderClass = '';
                switch (actividad.tipo) {
                  case 'LLAMADA':
                    nodeBorderClass = 'border-blue-500';
                    cardBorderClass = 'border-l-blue-500';
                    break;
                  case 'REUNION':
                    nodeBorderClass = 'border-violet-500';
                    cardBorderClass = 'border-l-violet-500';
                    break;
                  case 'EMAIL':
                    nodeBorderClass = 'border-emerald-500';
                    cardBorderClass = 'border-l-emerald-500';
                    break;
                  case 'TAREA':
                    nodeBorderClass = 'border-amber-500';
                    cardBorderClass = 'border-l-amber-500';
                    break;
                  case 'NOTA':
                    nodeBorderClass = 'border-slate-500';
                    cardBorderClass = 'border-l-slate-500';
                    break;
                }

                return (
                  <motion.div key={actividad.id} className="relative pl-16" variants={fadeInUp}>
                    {/* Ícono circular en la línea del timeline */}
                    <div
                      className={`absolute top-6 bg-card border-2 ${nodeBorderClass} rounded-full p-2 z-10`}
                      style={{ left: '0.875rem' }}
                    >
                      {getTipoIcon(actividad.tipo)}
                    </div>

                    {/* Card de la actividad */}
                    <Card
                      className={`bg-card border border-border border-l-4 ${cardBorderClass}
                                  hover:border-primary/20 hover:shadow-[0_4px_24px_0_rgba(0,0,0,0.3)]
                                  transition-all duration-200
                                  ${actividad.completada ? 'opacity-60' : ''}`}
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Checkbox completar */}
                          <button
                            onClick={() => handleCompletar(actividad)}
                            disabled={actividad.completada}
                            className="mt-1 flex-shrink-0 transition-transform hover:scale-110"
                          >
                            {actividad.completada ? (
                              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                            ) : (
                              <Circle className="h-6 w-6 text-border hover:text-primary" />
                            )}
                          </button>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3
                                    className={`font-semibold text-lg ${
                                      actividad.completada
                                        ? 'text-muted-foreground line-through'
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {actividad.titulo}
                                  </h3>
                                  <Badge
                                    className="text-xs font-mono"
                                    style={{
                                      backgroundColor: config.bgColor,
                                      color: config.color,
                                      borderColor: config.color,
                                    }}
                                  >
                                    {TIPO_ACTIVIDAD_LABELS[actividad.tipo]}
                                  </Badge>
                                </div>
                                {actividad.descripcion && (
                                  <p className="text-muted-foreground text-sm leading-relaxed">
                                    {actividad.descripcion}
                                  </p>
                                )}
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-popover border-border"
                                >
                                  <DropdownMenuItem onClick={() => handleEdit(actividad)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  {!actividad.completada && (
                                    <DropdownMenuItem onClick={() => handleCompletar(actividad)}>
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Marcar completada
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(actividad)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Meta información — chips font-mono */}
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                              {actividad.fechaVencimiento && (
                                <span
                                  className={`inline-flex items-center gap-1.5 font-mono text-xs rounded-full px-2 py-0.5 ${
                                    vencida
                                      ? 'bg-destructive/10 text-destructive'
                                      : 'bg-muted/50 text-muted-foreground'
                                  }`}
                                >
                                  <Calendar className="h-3 w-3" />
                                  {format(
                                    new Date(actividad.fechaVencimiento),
                                    "d 'de' MMM, yyyy",
                                    { locale: es }
                                  )}
                                  {vencida && ' · Vencida'}
                                </span>
                              )}

                              {actividad.cliente && (
                                <span className="inline-flex items-center gap-1.5 bg-muted/50 text-muted-foreground font-mono text-xs rounded-full px-2 py-0.5">
                                  <Building2 className="h-3 w-3" />
                                  {actividad.cliente.nombre}
                                </span>
                              )}

                              {actividad.negocio && (
                                <span className="inline-flex items-center gap-1.5 bg-muted/50 text-muted-foreground font-mono text-xs rounded-full px-2 py-0.5">
                                  <Briefcase className="h-3 w-3" />
                                  {actividad.negocio.titulo}
                                </span>
                              )}

                              {actividad.asignado && (
                                <span className="inline-flex items-center gap-1.5 bg-muted/50 text-muted-foreground font-mono text-xs rounded-full px-2 py-0.5">
                                  <User className="h-3 w-3" />
                                  {actividad.asignado.nombre}
                                </span>
                              )}

                              {actividad.completada && actividad.completadaEn && (
                                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 font-mono text-xs rounded-full px-2 py-0.5">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Completada {format(new Date(actividad.completadaEn), 'd/MM/yy')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-8">
            <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
              Anterior
            </Button>
            <div className="flex items-center px-6 bg-card border border-border rounded-lg">
              <span className="font-mono text-xs text-muted-foreground">
                {page} / {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>

      {/* Diálogo formulario */}
      <ActividadFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingActividad(undefined);
        }}
        onSubmit={handleSubmit}
        actividad={editingActividad}
        clientes={clientesData?.data || []}
        negocios={negociosData?.data || []}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Diálogo eliminar */}
      <AlertDialog open={!!deletingActividad} onOpenChange={() => setDeletingActividad(undefined)}>
        <AlertDialogContent className="bg-popover border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-foreground text-xl">
              ¿Eliminar actividad?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta acción no se puede deshacer. La actividad será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingActividad && deleteMutation.mutate(deletingActividad.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
