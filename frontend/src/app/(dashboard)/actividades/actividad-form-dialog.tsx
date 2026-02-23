"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Phone, Mail, Users, CheckSquare, FileText } from "lucide-react";
import type { Actividad, CreateActividadDto, UpdateActividadDto, TipoActividad } from "@/types/actividad";
import { TIPO_ACTIVIDAD_LABELS } from "@/types/actividad";

interface ActividadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateActividadDto | UpdateActividadDto) => void;
  actividad?: Actividad;
  clientes?: Array<{ id: string; nombre: string; empresa?: string }>;
  negocios?: Array<{ id: string; titulo: string }>;
  isLoading?: boolean;
}

export function ActividadFormDialog({
  open,
  onOpenChange,
  onSubmit,
  actividad,
  clientes = [],
  negocios = [],
  isLoading,
}: ActividadFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateActividadDto>({
    defaultValues: actividad
      ? {
          tipo: actividad.tipo,
          titulo: actividad.titulo,
          descripcion: actividad.descripcion,
          clienteId: actividad.clienteId,
          negocioId: actividad.negocioId,
        }
      : {
          tipo: 'LLAMADA',
        },
  });

  const [fechaVencimiento, setFechaVencimiento] = React.useState<Date | undefined>(
    actividad?.fechaVencimiento ? new Date(actividad.fechaVencimiento) : undefined
  );

  const tipo = watch('tipo');
  const clienteId = watch('clienteId');
  const negocioId = watch('negocioId');

  React.useEffect(() => {
    if (open && actividad) {
      reset({
        tipo: actividad.tipo,
        titulo: actividad.titulo,
        descripcion: actividad.descripcion,
        clienteId: actividad.clienteId,
        negocioId: actividad.negocioId,
      });
      setFechaVencimiento(
        actividad.fechaVencimiento ? new Date(actividad.fechaVencimiento) : undefined
      );
    } else if (!open) {
      // Resetear después de cerrar el diálogo (con delay para animación)
      setTimeout(() => {
        reset({
          tipo: 'LLAMADA',
          titulo: '',
          descripcion: '',
          clienteId: undefined,
          negocioId: undefined,
        });
        setFechaVencimiento(undefined);
      }, 300);
    }
  }, [open, actividad, reset]);

  const handleFormSubmit = (data: CreateActividadDto) => {
    const submitData = {
      ...data,
      fechaVencimiento: fechaVencimiento?.toISOString(),
    };
    onSubmit(submitData);
  };

  const getTipoIcon = (tipo: TipoActividad) => {
    switch (tipo) {
      case 'LLAMADA':
        return <Phone className="h-4 w-4" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'REUNION':
        return <Users className="h-4 w-4" />;
      case 'TAREA':
        return <CheckSquare className="h-4 w-4" />;
      case 'NOTA':
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {actividad ? "Editar Actividad" : "Nueva Actividad"}
          </DialogTitle>
          <DialogDescription className="text-stone-600 dark:text-stone-400">
            {actividad
              ? "Modifica los datos de la actividad"
              : "Completa los datos para crear una nueva actividad"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Tipo de actividad */}
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300 font-semibold">
              Tipo de Actividad *
            </Label>
            <Select
              value={tipo}
              onValueChange={(value) => setValue('tipo', value as TipoActividad)}
            >
              <SelectTrigger className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100">
                <div className="flex items-center gap-2">
                  {getTipoIcon(tipo)}
                  <SelectValue placeholder="Seleccionar tipo" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                {Object.entries(TIPO_ACTIVIDAD_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-stone-900 dark:text-stone-100">
                    <div className="flex items-center gap-2">
                      {getTipoIcon(value as TipoActividad)}
                      <span>{label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300 font-semibold">Título *</Label>
            <Input
              {...register("titulo", { required: "El título es obligatorio" })}
              placeholder="Ej: Llamada de seguimiento"
              className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
            {errors.titulo && (
              <p className="text-sm text-red-600">{errors.titulo.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300 font-semibold">Descripción</Label>
            <Textarea
              {...register("descripcion")}
              placeholder="Detalles adicionales sobre la actividad..."
              className="min-h-[100px] bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>

          {/* Fecha de vencimiento */}
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300 font-semibold">
              Fecha de Vencimiento
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100",
                    !fechaVencimiento && "text-stone-500 dark:text-stone-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaVencimiento ? (
                    format(fechaVencimiento, "PPP", { locale: es })
                  ) : (
                    <span>Seleccionar fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700" align="start">
                <Calendar
                  mode="single"
                  selected={fechaVencimiento}
                  onSelect={setFechaVencimiento}
                  locale={es}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300 font-semibold">
              Cliente {!negocioId && "*"}
            </Label>
            <Select
              value={clienteId || ""}
              onValueChange={(value) => setValue('clienteId', value || undefined)}
            >
              <SelectTrigger className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100">
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id} className="text-stone-900 dark:text-stone-100">
                    {cliente.nombre} {cliente.empresa && `- ${cliente.empresa}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!clienteId && !negocioId && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Debe seleccionar un cliente o un negocio
              </p>
            )}
          </div>

          {/* Negocio */}
          <div className="space-y-2">
            <Label className="text-stone-700 dark:text-stone-300 font-semibold">
              Negocio (Opcional)
            </Label>
            <Select
              value={negocioId || ""}
              onValueChange={(value) => setValue('negocioId', value || undefined)}
            >
              <SelectTrigger className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100">
                <SelectValue placeholder="Seleccionar negocio" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
                {negocios.map((negocio) => (
                  <SelectItem key={negocio.id} value={negocio.id} className="text-stone-900 dark:text-stone-100">
                    {negocio.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : actividad ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
