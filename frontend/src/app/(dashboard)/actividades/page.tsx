"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ActividadFormDialog } from "./actividad-form-dialog";
import {
  getActividades,
  createActividad,
  updateActividad,
  deleteActividad,
  marcarActividadCompletada,
} from "@/lib/api/actividades";
import { getClientes } from "@/lib/api/clientes";
import { getNegocios } from "@/lib/api/negocios";
import type { Actividad, CreateActividadDto, UpdateActividadDto, TipoActividad } from "@/types/actividad";
import { TIPO_ACTIVIDAD_CONFIG, TIPO_ACTIVIDAD_LABELS } from "@/types/actividad";

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

export default function ActividadesPage() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [tipoFiltro, setTipoFiltro] = React.useState<string>("TODOS");
  const [completadaFiltro, setCompletadaFiltro] = React.useState<string>("TODOS");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingActividad, setEditingActividad] = React.useState<Actividad | undefined>();
  const [deletingActividad, setDeletingActividad] = React.useState<Actividad | undefined>();

  // Redirect si no está autenticado
  if (status === "unauthenticated") {
    redirect("/login");
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
    const iconProps = { className: "h-5 w-5" };
    
    switch (tipo) {
      case 'LLAMADA':
        return <Phone {...iconProps} className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'EMAIL':
        return <Mail {...iconProps} className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'REUNION':
        return <Users {...iconProps} className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'TAREA':
        return <CheckSquare {...iconProps} className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'NOTA':
        return <FileText {...iconProps} className="h-5 w-5 text-slate-600 dark:text-slate-400" />;
    }
  };

  const actividades = actividadesData?.data || [];
  const totalPages = actividadesData?.meta?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <CheckSquare className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Actividades
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Buscar actividades..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
            />
          </div>

          {/* Filtros por Tipo */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Filtrar por tipo:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTipoFiltro('TODOS')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  tipoFiltro === 'TODOS'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTipoFiltro('LLAMADA')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  tipoFiltro === 'LLAMADA'
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 border border-blue-200 dark:border-blue-900'
                }`}
              >
                <Phone className="h-4 w-4" />
                Llamadas
              </button>
              <button
                onClick={() => setTipoFiltro('REUNION')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  tipoFiltro === 'REUNION'
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-purple-600 hover:bg-purple-50 dark:hover:bg-slate-700 border border-purple-200 dark:border-purple-900'
                }`}
              >
                <Users className="h-4 w-4" />
                Reuniones
              </button>
              <button
                onClick={() => setTipoFiltro('EMAIL')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  tipoFiltro === 'EMAIL'
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-green-600 hover:bg-green-50 dark:hover:bg-slate-700 border border-green-200 dark:border-green-900'
                }`}
              >
                <Mail className="h-4 w-4" />
                Emails
              </button>
              <button
                onClick={() => setTipoFiltro('TAREA')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  tipoFiltro === 'TAREA'
                    ? 'bg-yellow-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-slate-700 border border-yellow-200 dark:border-yellow-900'
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                Tareas
              </button>
              <button
                onClick={() => setTipoFiltro('NOTA')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  tipoFiltro === 'NOTA'
                    ? 'bg-slate-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                Notas
              </button>
            </div>
          </div>

          {/* Filtros por Estado */}
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Filtrar por estado:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCompletadaFiltro('TODOS')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  completadaFiltro === 'TODOS'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setCompletadaFiltro('false')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  completadaFiltro === 'false'
                    ? 'bg-orange-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-700 border border-orange-200 dark:border-orange-900'
                }`}
              >
                Pendientes
              </button>
              <button
                onClick={() => setCompletadaFiltro('true')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  completadaFiltro === 'true'
                    ? 'bg-green-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-green-600 hover:bg-green-50 dark:hover:bg-slate-700 border border-green-200 dark:border-green-900'
                }`}
              >
                Completadas
              </button>
            </div>
          </div>
        </div>

        {/* Timeline de Actividades */}
        {isLoading ? (
          <Card className="p-12 text-center backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-lg">
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 opacity-50"></div>
              <p className="text-slate-600 dark:text-slate-400">Cargando actividades...</p>
            </div>
          </Card>
        ) : actividades.length === 0 ? (
          <Card className="p-12 text-center backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 shadow-lg">
            <CheckSquare className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No hay actividades
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
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
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-purple-300 to-blue-300 dark:from-blue-700 dark:via-purple-700 dark:to-blue-700"></div>

            {/* Lista de actividades */}
            <div className="space-y-6">
              {actividades.map((actividad, index) => {
                const config = TIPO_ACTIVIDAD_CONFIG[actividad.tipo];
                const vencida = actividad.fechaVencimiento && 
                  new Date(actividad.fechaVencimiento) < new Date() && 
                  !actividad.completada;

                // Determinar color del borde según tipo
                let borderColor = '';
                switch (actividad.tipo) {
                  case 'LLAMADA':
                    borderColor = 'border-blue-600';
                    break;
                  case 'REUNION':
                    borderColor = 'border-purple-600';
                    break;
                  case 'EMAIL':
                    borderColor = 'border-green-600';
                    break;
                  case 'TAREA':
                    borderColor = 'border-yellow-600';
                    break;
                  case 'NOTA':
                    borderColor = 'border-slate-600';
                    break;
                }

                return (
                  <motion.div 
                    key={actividad.id} 
                    className="relative pl-16"
                    variants={fadeInUp}
                  >
                    {/* Ícono circular en la línea del timeline */}
                    <div
                      className={`absolute -left-1 top-6 bg-white dark:bg-slate-900 border-2 ${borderColor} rounded-full p-2 shadow-lg z-10`}
                      style={{ left: '0.875rem' }}
                    >
                      {getTipoIcon(actividad.tipo)}
                    </div>

                    {/* Card de la actividad */}
                    <Card
                      className={`backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 
                                  border-l-4 ${borderColor}
                                  border-t border-r border-b border-slate-200 dark:border-slate-700
                                  hover:shadow-xl hover:-translate-y-1 
                                  transition-all duration-300
                                  ${actividad.completada ? 'opacity-75' : ''}`}
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
                              <CheckCircle2 className="h-6 w-6 text-green-600" />
                            ) : (
                              <Circle className="h-6 w-6 text-slate-300 hover:text-blue-500" />
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
                                        ? 'text-slate-500 dark:text-slate-500 line-through'
                                        : 'text-slate-900 dark:text-slate-100'
                                    }`}
                                  >
                                    {actividad.titulo}
                                  </h3>
                                  <Badge
                                    className="text-xs font-semibold"
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
                                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                    {actividad.descripcion}
                                  </p>
                                )}
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700">
                                  <DropdownMenuItem onClick={() => handleEdit(actividad)} className="dark:hover:bg-slate-800 dark:text-slate-100">
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  {!actividad.completada && (
                                    <DropdownMenuItem onClick={() => handleCompletar(actividad)} className="dark:hover:bg-slate-800 dark:text-slate-100">
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Marcar completada
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(actividad)}
                                    className="text-red-600 dark:text-red-400 dark:hover:bg-slate-800"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Meta información con íconos mejorados */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {actividad.fechaVencimiento && (
                                <div className={`flex items-center gap-1.5 ${vencida ? 'text-red-600 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {format(new Date(actividad.fechaVencimiento), "d 'de' MMM, yyyy", { locale: es })}
                                    {vencida && ' • Vencida'}
                                  </span>
                                </div>
                              )}

                              {actividad.cliente && (
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                  <Building2 className="h-3.5 w-3.5" />
                                  <span className="text-xs font-medium">{actividad.cliente.nombre}</span>
                                </div>
                              )}

                              {actividad.negocio && (
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  <span className="text-xs font-medium">{actividad.negocio.titulo}</span>
                                </div>
                              )}

                              {actividad.asignado && (
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                  <User className="h-3.5 w-3.5" />
                                  <span className="text-xs font-medium">{actividad.asignado.nombre}</span>
                                </div>
                              )}

                              {actividad.completada && actividad.completadaEn && (
                                <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span className="text-xs font-medium">
                                    Completada {format(new Date(actividad.completadaEn), "d/MM/yy")}
                                  </span>
                                </div>
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
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Anterior
            </Button>
            <div className="flex items-center px-6 backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-lg">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Página {page} de {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
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
      <AlertDialog
        open={!!deletingActividad}
        onOpenChange={() => setDeletingActividad(undefined)}
      >
        <AlertDialogContent className="backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100 text-xl font-bold">
              ¿Eliminar actividad?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta acción no se puede deshacer. La actividad será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingActividad && deleteMutation.mutate(deletingActividad.id)}
              className="bg-red-600 hover:bg-red-700 shadow-lg"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
