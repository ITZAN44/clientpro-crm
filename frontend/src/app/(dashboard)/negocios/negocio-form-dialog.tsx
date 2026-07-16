'use client';

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
    // Convertir valor a número y omitir la fecha de cierre cuando está vacía
    // (campo opcional: enviar "" rompe la validación IsDateString del backend).
    const formattedData = {
      ...data,
      valor: Number(data.valor),
      probabilidad: Number(data.probabilidad),
      fechaCierreEsperada: data.fechaCierreEsperada || undefined,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif text-foreground">
            {negocio ? 'Editar Negocio' : 'Nuevo Negocio'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {negocio
              ? 'Modifica la información del negocio.'
              : 'Completa los datos para crear un nuevo negocio en el pipeline.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Información básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground font-semibold">
              <FileText className="h-4 w-4" />
              <span>Información Básica</span>
            </div>

            <div className="grid gap-4">
              <div>
                <Label htmlFor="titulo" className="text-foreground">
                  Título del Negocio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titulo"
                  {...register('titulo', { required: 'El título es requerido' })}
                  placeholder="Ej: Implementación CRM Enterprise"
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
                {errors.titulo && (
                  <p className="text-sm text-destructive mt-1">{errors.titulo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="descripcion" className="text-foreground">
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  {...register('descripcion')}
                  placeholder="Detalles del negocio..."
                  rows={3}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground font-semibold">
              <Users className="h-4 w-4" />
              <span>Cliente</span>
            </div>

            <div>
              <Label className="text-foreground">
                Cliente <span className="text-destructive">*</span>
              </Label>
              <div>
                <Select
                  value={watch('clienteId')}
                  onValueChange={(value) => setValue('clienteId', value)}
                >
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Seleccionar cliente..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
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
                        <SelectItem key={cliente.id} value={cliente.id} className="text-foreground">
                          {cliente.nombre}
                          {cliente.empresa && ` - ${cliente.empresa}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {errors.clienteId && (
                <p className="text-sm text-destructive mt-1">{errors.clienteId.message}</p>
              )}
            </div>
          </div>

          {/* Valor y Moneda */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground font-semibold">
              <DollarSign className="h-4 w-4" />
              <span>Valor del Negocio</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor" className="text-foreground">
                  Valor
                </Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  {...register('valor', { min: 0 })}
                  placeholder="0.00"
                  className="bg-input border-border text-foreground font-mono placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <Label className="text-foreground">Moneda</Label>
                <div>
                  <Select
                    value={monedaSeleccionada}
                    onValueChange={(value: any) => setValue('moneda', value)}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="MXN" className="text-foreground">
                        MXN - Peso Mexicano
                      </SelectItem>
                      <SelectItem value="USD" className="text-foreground">
                        USD - Dólar
                      </SelectItem>
                      <SelectItem value="EUR" className="text-foreground">
                        EUR - Euro
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Etapa y Probabilidad */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground font-semibold">
              <TrendingUp className="h-4 w-4" />
              <span>Estado del Negocio</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Etapa</Label>
                <div>
                  <Select
                    value={etapaSeleccionada}
                    onValueChange={(value: any) => setValue('etapa', value)}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {Object.entries(ETAPAS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key} className="text-foreground">
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="probabilidad" className="text-foreground">
                  Probabilidad (%)
                </Label>
                <Input
                  id="probabilidad"
                  type="number"
                  min="0"
                  max="100"
                  {...register('probabilidad', { min: 0, max: 100 })}
                  placeholder="0"
                  className="bg-input border-border text-foreground font-mono placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Fecha */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground font-semibold">
              <Calendar className="h-4 w-4" />
              <span>Fecha de Cierre</span>
            </div>

            <div>
              <Label htmlFor="fechaCierreEsperada" className="text-foreground">
                Fecha Esperada de Cierre
              </Label>
              <Input
                id="fechaCierreEsperada"
                type="date"
                {...register('fechaCierreEsperada')}
                className="bg-input border-border text-foreground font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? 'Guardando...' : negocio ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
