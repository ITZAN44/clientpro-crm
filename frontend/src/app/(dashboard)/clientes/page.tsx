"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Users,
  Plus,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { ClienteFormDialog } from "./cliente-form-dialog";
import { getClientes, createCliente, updateCliente, deleteCliente } from "@/lib/api/clientes";
import { Cliente, CreateClienteDto, UpdateClienteDto } from "@/types/cliente";
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
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { ClienteListSkeleton } from "@/components/ui/skeleton-loaders";

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

export default function ClientesPage() {
  const { data: session } = useSession();
  const { rol } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
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
  const { data: clientesData, isLoading, error } = useQuery({
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
      toast.success("Cliente creado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear cliente");
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
      toast.success("Cliente actualizado exitosamente");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar cliente");
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
      toast.success("Cliente eliminado exitosamente");
      setDeletingCliente(undefined);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar cliente");
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
      <motion.div 
        className="mb-8"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Clientes
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gestiona tu cartera de clientes
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Lista de Clientes
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {clientesData?.meta.total || 0} clientes registrados
              </p>
            </div>
            <Button
              onClick={handleNewCliente}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400" />
                  <div className="absolute top-0 left-0 animate-ping rounded-full h-8 w-8 border-b-2 border-blue-400 opacity-20" />
                </div>
                <p className="text-slate-600 text-sm">Cargando clientes...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3 text-center max-w-sm">
                <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Error al cargar clientes</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
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
        <AlertDialogContent className="backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              Eliminar Cliente
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              ¿Estás seguro de que deseas eliminar a{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {deletingCliente?.nombre}
              </span>
              ? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
