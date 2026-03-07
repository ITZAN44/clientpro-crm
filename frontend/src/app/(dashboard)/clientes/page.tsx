'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Plus, Trash2, AlertCircle } from 'lucide-react';
import { DataTable } from './data-table';
import { getColumns } from './columns';
import { ClienteFormDialog } from './cliente-form-dialog';
import { getClientes, createCliente, updateCliente, deleteCliente } from '@/lib/api/clientes';
import { Cliente, CreateClienteDto, UpdateClienteDto } from '@/types/cliente';
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
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { ClienteListSkeleton } from '@/components/ui/skeleton-loaders';

export default function ClientesPage() {
  const { data: session } = useSession();
  const { rol } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCliente, setEditingCliente] = React.useState<Cliente | undefined>();
  const [deletingCliente, setDeletingCliente] = React.useState<Cliente | undefined>();

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

  // Query para obtener clientes
  const {
    data: clientesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['clientes', page, debouncedSearch],
    queryFn: () => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token de autenticación');
      return getClientes(token, page, 10, debouncedSearch || undefined);
    },
    enabled: !!session,
  });

  // Mutation para crear cliente
  const createMutation = useMutation({
    mutationFn: (data: CreateClienteDto) => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token de autenticación');
      return createCliente(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear cliente');
    },
  });

  // Mutation para actualizar cliente
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClienteDto }) => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token de autenticación');
      return updateCliente(token, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar cliente');
    },
  });

  // Mutation para eliminar cliente
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const token = (session as any)?.accessToken;
      if (!token) throw new Error('No hay token de autenticación');
      return deleteCliente(token, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente eliminado exitosamente');
      setDeletingCliente(undefined);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar cliente');
    },
  });

  const handleFormSubmit = async (data: CreateClienteDto | UpdateClienteDto) => {
    if (editingCliente) {
      await updateMutation.mutateAsync({ id: editingCliente.id, data });
      setEditingCliente(undefined);
    } else {
      await createMutation.mutateAsync(data as CreateClienteDto);
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsFormOpen(true);
  };

  const handleDelete = (cliente: Cliente) => {
    setDeletingCliente(cliente);
  };

  const confirmDelete = async () => {
    if (deletingCliente) {
      await deleteMutation.mutateAsync(deletingCliente.id);
    }
  };

  const handleNewCliente = () => {
    setEditingCliente(undefined);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <ClienteListSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Page Header */}
      <motion.div className="mb-8" initial="hidden" animate="visible" variants={fadeInUp}>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">Gestiona tu cartera de clientes</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <Card className="bg-card border border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-semibold text-foreground">
                  Lista de Clientes
                </h2>
                <p className="font-mono text-sm text-muted-foreground mt-1">
                  {clientesData?.meta.total || 0} clientes registrados
                </p>
              </div>
              <Button
                onClick={handleNewCliente}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Cliente
              </Button>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    <div className="absolute top-0 left-0 animate-ping rounded-full h-8 w-8 border-b-2 border-primary opacity-20" />
                  </div>
                  <p className="text-muted-foreground text-sm">Cargando clientes...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <h3 className="font-semibold text-foreground">Error al cargar clientes</h3>
                  <p className="text-sm text-muted-foreground">
                    No se pudieron cargar los clientes. Por favor, intenta de nuevo.
                  </p>
                  <Button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['clientes'] })}
                    variant="outline"
                    className="mt-2"
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : (
              <DataTable
                columns={getColumns(rol)}
                data={clientesData?.data || []}
                searchPlaceholder="Buscar por nombre, email o empresa..."
                searchValue={search}
                onSearch={setSearch}
                pagination={{
                  page,
                  totalPages: clientesData?.meta.totalPages || 1,
                  total: clientesData?.meta.total || 0,
                  onPageChange: setPage,
                }}
                meta={{
                  onEdit: handleEdit,
                  onDelete: handleDelete,
                }}
              />
            )}
          </div>
        </Card>
      </motion.div>

      {/* Form Dialog */}
      <ClienteFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) {
            setEditingCliente(undefined);
          }
        }}
        cliente={editingCliente}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingCliente}
        onOpenChange={(open: boolean) => !open && setDeletingCliente(undefined)}
      >
        <AlertDialogContent className="bg-popover border border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <Trash2 className="h-5 w-5 text-destructive" />
              Eliminar Cliente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              ¿Estás seguro de que deseas eliminar a{' '}
              <span className="font-semibold text-foreground">{deletingCliente?.nombre}</span>? Esta
              acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
