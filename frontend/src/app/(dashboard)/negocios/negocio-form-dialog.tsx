"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Negocio, CreateNegocioDto, UpdateNegocioDto, ETAPAS_CONFIG } from '@/types/negocio';
import { getClientes } from '@/lib/api/clientes';
import { useSession } from 'next-auth/react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, DollarSign, TrendingUp, Users, Calendar } from 'lucide-react';

interface NegocioFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNegocioDto | UpdateNegocioDto) => void;
  negocio?: Negocio | null;
  isLoading?: boolean;
}

export default function NegocioFormDialog({
  open,
  onClose,
  onSubmit,
  negocio,
  isLoading,
}: NegocioFormDialogProps) {
  const { data: session } = useSession();
  const [clientes, setClientes] = useState<any[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateNegocioDto | UpdateNegocioDto>({
    defaultValues: {
      titulo: '',
      descripcion: '',
      valor: 0,
      moneda: 'MXN',
      etapa: 'PROSPECTO',
      probabilidad: 0,
      fechaCierreEsperada: '',
      clienteId: '',
    },
  });

  const monedaSeleccionada = watch('moneda');
  const etapaSeleccionada = watch('etapa');

  // Cargar clientes
  useEffect(() => {
    if (open && session?.accessToken) {
      loadClientes();
    }
  }, [open, session]);

  const loadClientes = async () => {
    if (!session?.accessToken) return;
    
    try {
      setLoadingClientes(true);
      const response = await getClientes(session.accessToken, 1, 100);
      setClientes(response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoadingClientes(false);
    }
  };

  // Cargar datos del negocio en edición
  useEffect(() => {
    if (open) {
      if (negocio) {
        reset({
          titulo: negocio.titulo,
          descripcion: negocio.descripcion || '',
          valor: negocio.valor,
          moneda: negocio.moneda,
          etapa: negocio.etapa,
          probabilidad: negocio.probabilidad,
          fechaCierreEsperada: negocio.fechaCierreEsperada
            ? new Date(negocio.fechaCierreEsperada).toISOString().split('T')[0]
            : '',
          clienteId: negocio.clienteId,
        });
      } else {
        reset({
          titulo: '',
          descripcion: '',
          valor: 0,
          moneda: 'MXN',
          etapa: 'PROSPECTO',
          probabilidad: 0,
          fechaCierreEsperada: '',
          clienteId: '',
        });
      }
    }
  }, [negocio, reset, open]);

  const handleFormSubmit = (data: CreateNegocioDto | UpdateNegocioDto) => {
    // Convertir valor a número
    const formattedData = {
      ...data,
      valor: Number(data.valor),
      probabilidad: Number(data.probabilidad),
    };
    onSubmit(formattedData);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      // Primero cerrar el diálogo
      onClose();
      // Resetear el formulario después de que termine la animación de cierre (300ms)
      setTimeout(() => {
        reset({
          titulo: '',
          descripcion: '',
          valor: 0,
          moneda: 'MXN',
          etapa: 'PROSPECTO',
          probabilidad: 0,
          fechaCierreEsperada: '',
          clienteId: '',
        });
      }, 300);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {negocio ? 'Editar Negocio' : 'Nuevo Negocio'}
          </DialogTitle>
          <DialogDescription className="text-sm text-stone-600 dark:text-stone-400">
            {negocio 
              ? 'Modifica la información del negocio.' 
              : 'Completa los datos para crear un nuevo negocio en el pipeline.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
              <FileText className="h-4 w-4" />
              <span>Información Básica</span>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="titulo" className="text-stone-700 dark:text-stone-300">
                  Título del Negocio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="titulo"
                  {...register('titulo', { required: 'El título es requerido' })}
                  placeholder="Ej: Implementación CRM Enterprise"
                  className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
                {errors.titulo && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.titulo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="descripcion" className="text-stone-700 dark:text-stone-300">Descripción</Label>
                <Textarea
                  id="descripcion"
                  {...register('descripcion')}
                  placeholder="Detalles del negocio..."
                  rows={3}
                  className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
              <Users className="h-4 w-4" />
              <span>Cliente</span>
            </div>

            <div>
              <Label className="text-stone-700 dark:text-stone-300">
                Cliente <span className="text-red-500">*</span>
              </Label>
              <div>
                <Select
                  value={watch('clienteId')}
                  onValueChange={(value) => setValue('clienteId', value)}
                >
                  <SelectTrigger className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100">
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                    {loadingClientes ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : clientes.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No hay clientes disponibles
                      </SelectItem>
                    ) : (
                      clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id} className="text-stone-900 dark:text-stone-100">
                          {cliente.nombre}
                          {cliente.empresa && ` - ${cliente.empresa}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {errors.clienteId && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.clienteId.message}</p>
              )}
            </div>
          </div>

          {/* Valor y Moneda */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
              <DollarSign className="h-4 w-4" />
              <span>Valor del Negocio</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor" className="text-stone-700 dark:text-stone-300">Valor</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  {...register('valor', { min: 0 })}
                  placeholder="0.00"
                  className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <Label className="text-stone-700 dark:text-stone-300">Moneda</Label>
                <div>
                  <Select
                    value={monedaSeleccionada}
                    onValueChange={(value: any) => setValue('moneda', value)}
                  >
                    <SelectTrigger className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                      <SelectItem value="MXN" className="text-stone-900 dark:text-stone-100">MXN - Peso Mexicano</SelectItem>
                      <SelectItem value="USD" className="text-stone-900 dark:text-stone-100">USD - Dólar</SelectItem>
                      <SelectItem value="EUR" className="text-stone-900 dark:text-stone-100">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Etapa y Probabilidad */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
              <TrendingUp className="h-4 w-4" />
              <span>Estado del Negocio</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-stone-700 dark:text-stone-300">Etapa</Label>
                <div>
                  <Select
                    value={etapaSeleccionada}
                    onValueChange={(value: any) => setValue('etapa', value)}
                  >
                    <SelectTrigger className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                      {Object.entries(ETAPAS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key} className="text-stone-900 dark:text-stone-100">
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="probabilidad" className="text-stone-700 dark:text-stone-300">Probabilidad (%)</Label>
                <Input
                  id="probabilidad"
                  type="number"
                  min="0"
                  max="100"
                  {...register('probabilidad', { min: 0, max: 100 })}
                  placeholder="0"
                  className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300 font-semibold">
              <Calendar className="h-4 w-4" />
              <span>Fecha de Cierre</span>
            </div>

            <div>
              <Label htmlFor="fechaCierreEsperada" className="text-stone-700 dark:text-stone-300">Fecha Esperada de Cierre</Label>
              <Input
                id="fechaCierreEsperada"
                type="date"
                {...register('fechaCierreEsperada')}
                className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
              className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {isLoading ? 'Guardando...' : negocio ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
