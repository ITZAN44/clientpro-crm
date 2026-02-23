"use client";

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import Link from 'next/link';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

import { Negocio, EtapaNegocio } from '@/types/negocio';
import {
  getNegocios,
  createNegocio,
  updateNegocio,
  deleteNegocio,
  cambiarEtapaNegocio,
} from '@/lib/api/negocios';
import KanbanColumn from './kanban-column';
import NegocioCard from './negocio-card';
import NegocioFormDialog from './negocio-form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NegocioKanbanSkeleton } from '@/components/ui/skeleton-loaders';
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

const ETAPAS_ORDEN: EtapaNegocio[] = [
  'PROSPECTO',
  'CONTACTO_REALIZADO',
  'PROPUESTA',
  'NEGOCIACION',
  'GANADO',
  'PERDIDO',
];

export default function NegociosPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNegocio, setEditingNegocio] = useState<Negocio | null>(null);
  const [deletingNegocio, setDeletingNegocio] = useState<Negocio | null>(null);
  const [activeNegocio, setActiveNegocio] = useState<Negocio | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Query para obtener negocios (optimizado con staleTime)
  const { data: negociosData, isLoading } = useQuery({
    queryKey: ['negocios', search],
    queryFn: () =>
      session?.accessToken
        ? getNegocios(session.accessToken, 1, 100, search || undefined)
        : Promise.reject('No session'),
    enabled: !!session?.accessToken,
    staleTime: 3 * 60 * 1000, // 3 minutos
  });

  // Agrupar negocios por etapa
  const negociosPorEtapa = useMemo(() => {
    if (!negociosData?.data) {
      return {} as Record<EtapaNegocio, Negocio[]>;
    }

    return negociosData.data.reduce((acc, negocio) => {
      if (!acc[negocio.etapa]) {
        acc[negocio.etapa] = [];
      }
      acc[negocio.etapa].push(negocio);
      return acc;
    }, {} as Record<EtapaNegocio, Negocio[]>);
  }, [negociosData]);

  // Mutation para crear
  const createMutation = useMutation({
    mutationFn: (data: any) => createNegocio(session!.accessToken!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negocios'] });
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success('Negocio creado exitosamente');
      setIsFormOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear el negocio');
    },
  });

  // Mutation para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateNegocio(session!.accessToken!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negocios'] });
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success('Negocio actualizado exitosamente');
      setIsFormOpen(false);
      setEditingNegocio(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar el negocio');
    },
  });

  // Mutation para cambiar etapa
  const cambiarEtapaMutation = useMutation({
    mutationFn: ({ id, etapa }: { id: string; etapa: EtapaNegocio }) =>
      cambiarEtapaNegocio(session!.accessToken!, id, etapa),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negocios'] });
      // Invalidar también las queries de reportes para que se actualicen automáticamente
      queryClient.invalidateQueries({ queryKey: ['reportes', 'conversion'] });
      queryClient.invalidateQueries({ queryKey: ['reportes', 'comparativas'] });
      queryClient.invalidateQueries({ queryKey: ['reportes', 'rendimiento'] });
      toast.success('Etapa actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al cambiar la etapa');
    },
  });

  // Mutation para eliminar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNegocio(session!.accessToken!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['negocios'] });
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
      toast.success('Negocio eliminado exitosamente');
      setDeletingNegocio(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al eliminar el negocio');
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const negocio = negociosData?.data.find((n) => n.id === event.active.id);
    setActiveNegocio(negocio || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveNegocio(null);

    const { active, over } = event;

    if (!over) return;

    const negocioId = active.id as string;
    
    // Determinar la nueva etapa: si over.id es una etapa, usarlo; si no, buscar el negocio
    let nuevaEtapa: EtapaNegocio;
    
    // Verificar si over.id es una etapa válida
    if (ETAPAS_ORDEN.includes(over.id as EtapaNegocio)) {
      nuevaEtapa = over.id as EtapaNegocio;
    } else {
      // Si se soltó sobre otro negocio, obtener su etapa
      const negocioDestino = negociosData?.data.find((n) => n.id === over.id);
      if (!negocioDestino) return;
      nuevaEtapa = negocioDestino.etapa;
    }

    const negocio = negociosData?.data.find((n) => n.id === negocioId);

    if (negocio && negocio.etapa !== nuevaEtapa) {
      cambiarEtapaMutation.mutate({ id: negocioId, etapa: nuevaEtapa });
    }
  };

  const handleEdit = (negocio: Negocio) => {
    setEditingNegocio(negocio);
    setIsFormOpen(true);
  };

  const handleDelete = (negocio: Negocio) => {
    setDeletingNegocio(negocio);
  };

  const handleFormSubmit = (data: any) => {
    if (editingNegocio) {
      updateMutation.mutate({ id: editingNegocio.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingNegocio) {
      deleteMutation.mutate(deletingNegocio.id);
    }
  };

  // Calcular estadísticas
  const totalNegocios = negociosData?.data.length || 0;
  const totalValor = negociosData?.data.reduce((sum, n) => sum + n.valor, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Header sticky con glassmorphism */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pipeline de Negocios
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
                  {totalNegocios} negocios •{' '}
                  <span className="text-green-600 dark:text-green-400 font-bold">
                    {new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                    }).format(totalValor)}
                  </span>
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingNegocio(null);
                setIsFormOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Negocio
            </Button>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Buscar negocios..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="p-6">
        {isLoading ? (
          <NegocioKanbanSkeleton />
        ) : (
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 overflow-x-auto pb-6">
              {ETAPAS_ORDEN.map((etapa) => (
                <KanbanColumn
                  key={etapa}
                  etapa={etapa}
                  negocios={negociosPorEtapa[etapa] || []}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <DragOverlay>
              {activeNegocio ? (
                <div className="rotate-3 scale-105">
                  <NegocioCard
                    negocio={activeNegocio}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Formulario de crear/editar */}
      <NegocioFormDialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingNegocio(null);
        }}
        onSubmit={handleFormSubmit}
        negocio={editingNegocio}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog
        open={!!deletingNegocio}
        onOpenChange={() => setDeletingNegocio(null)}
      >
        <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 dark:text-slate-100">
              ¿Eliminar negocio?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              Esta acción no se puede deshacer. El negocio{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {deletingNegocio?.titulo}
              </span>{' '}
              será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
