"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Cliente, CreateClienteDto, UpdateClienteDto } from "@/types/cliente";
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
import { Loader2, User, Mail, Phone, Building2, Briefcase, MapPin, Globe, FileText } from "lucide-react";

interface ClienteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente;
  onSubmit: (data: CreateClienteDto | UpdateClienteDto) => Promise<void>;
  isLoading?: boolean;
}

export function ClienteFormDialog({
  open,
  onOpenChange,
  cliente,
  onSubmit,
  isLoading = false,
}: ClienteFormDialogProps) {
  const isEditing = !!cliente;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClienteDto>({
    defaultValues: cliente
      ? {
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono,
          empresa: cliente.empresa,
          puesto: cliente.puesto,
          direccion: cliente.direccion,
          ciudad: cliente.ciudad,
          pais: cliente.pais,
          sitioWeb: cliente.sitioWeb,
          notas: cliente.notas,
        }
      : {},
  });

  React.useEffect(() => {
    if (open && cliente) {
      reset({
        nombre: cliente.nombre,
        email: cliente.email || "",
        telefono: cliente.telefono || "",
        empresa: cliente.empresa || "",
        puesto: cliente.puesto || "",
        direccion: cliente.direccion || "",
        ciudad: cliente.ciudad || "",
        pais: cliente.pais || "",
        sitioWeb: cliente.sitioWeb || "",
        notas: cliente.notas || "",
      });
    } else if (open && !cliente) {
      reset({});
    }
  }, [open, cliente, reset]);

  const onSubmitForm = async (data: CreateClienteDto) => {
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error al guardar cliente:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription className="text-stone-600 dark:text-stone-400">
            {isEditing
              ? "Actualiza la información del cliente"
              : "Completa el formulario para agregar un nuevo cliente"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <User className="h-4 w-4" />
              Información Personal
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nombre" className="text-stone-700 dark:text-stone-300">
                  Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  {...register("nombre", { required: "El nombre es requerido" })}
                  placeholder="Juan Pérez"
                  className="mt-1.5 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
                {errors.nombre && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.nombre.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-stone-700 dark:text-stone-300">
                  Email
                </Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="juan@empresa.com"
                    className="pl-9 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telefono" className="text-stone-700 dark:text-stone-300">
                  Teléfono
                </Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <Input
                    id="telefono"
                    {...register("telefono")}
                    placeholder="+52 55 1234 5678"
                    className="pl-9 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información Empresarial */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Información Empresarial
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="empresa" className="text-stone-700 dark:text-stone-300">
                  Empresa
                </Label>
                <Input
                  id="empresa"
                  {...register("empresa")}
                  placeholder="Acme Corporation"
                  className="mt-1.5 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <Label htmlFor="puesto" className="text-stone-700 dark:text-stone-300">
                  Puesto
                </Label>
                <div className="relative mt-1.5">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <Input
                    id="puesto"
                    {...register("puesto")}
                    placeholder="Director General"
                    className="pl-9 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="sitioWeb" className="text-stone-700 dark:text-stone-300">
                  Sitio Web
                </Label>
                <div className="relative mt-1.5">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <Input
                    id="sitioWeb"
                    {...register("sitioWeb")}
                    placeholder="https://www.ejemplo.com"
                    className="pl-9 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ubicación
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="direccion" className="text-stone-700 dark:text-stone-300">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  {...register("direccion")}
                  placeholder="Av. Reforma 123"
                  className="mt-1.5 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <Label htmlFor="ciudad" className="text-stone-700 dark:text-stone-300">
                  Ciudad
                </Label>
                <Input
                  id="ciudad"
                  {...register("ciudad")}
                  placeholder="Ciudad de México"
                  className="mt-1.5 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <Label htmlFor="pais" className="text-stone-700 dark:text-stone-300">
                  País
                </Label>
                <Input
                  id="pais"
                  {...register("pais")}
                  placeholder="México"
                  className="mt-1.5 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notas Adicionales
            </h3>
            
            <div>
              <Textarea
                id="notas"
                {...register("notas")}
                placeholder="Agrega notas o comentarios sobre el cliente..."
                rows={4}
                className="resize-none bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100"
              />
            </div>
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
              disabled={isLoading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEditing ? (
                "Actualizar Cliente"
              ) : (
                "Crear Cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
