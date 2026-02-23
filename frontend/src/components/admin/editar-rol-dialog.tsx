'use client';

import { useState, useEffect } from 'react';
import { Usuario } from '@/types/usuario';
import { RolUsuario } from '@/types/rol';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Shield, AlertCircle, Crown, Users, User, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EditarRolDialogProps {
  usuario: Usuario | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (nuevoRol: RolUsuario) => void;
  isLoading?: boolean;
}

const ROL_CONFIG = {
  [RolUsuario.ADMIN]: {
    label: 'Administrador',
    icon: Crown,
    color: 'purple',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-300 dark:border-purple-700',
    iconClass: 'text-purple-600 dark:text-purple-400',
    description: 'Acceso total al sistema. Puede gestionar usuarios, ver y modificar todo.',
  },
  [RolUsuario.MANAGER]: {
    label: 'Manager',
    icon: Users,
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-300 dark:border-green-700',
    iconClass: 'text-green-600 dark:text-green-400',
    description: 'Puede ver todos los registros y editar clientes, pero no eliminar.',
  },
  [RolUsuario.VENDEDOR]: {
    label: 'Vendedor',
    icon: User,
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/30',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-300 dark:border-blue-700',
    iconClass: 'text-blue-600 dark:text-blue-400',
    description: 'Solo puede ver y gestionar sus propios registros.',
  },
};

export function EditarRolDialog({
  usuario,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: EditarRolDialogProps) {
  const [nuevoRol, setNuevoRol] = useState<RolUsuario | undefined>(undefined);

  // Sincronizar el rol cuando cambia el usuario o se abre el dialog
  useEffect(() => {
    if (usuario && open) {
      setNuevoRol(usuario.rol);
    }
  }, [usuario, open]);

  const handleConfirm = () => {
    if (nuevoRol) {
      onConfirm(nuevoRol);
    }
  };

  const cambioRol = nuevoRol !== usuario?.rol;
  const currentRolConfig = usuario?.rol ? ROL_CONFIG[usuario.rol] : null;
  const newRolConfig = nuevoRol ? ROL_CONFIG[nuevoRol] : null;
  const CurrentRolIcon = currentRolConfig?.icon;
  const NewRolIcon = newRolConfig?.icon;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Cambiar Rol de Usuario
            </span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Modifica el rol y permisos de{' '}
            <span className="font-semibold text-slate-900 dark:text-slate-100">{usuario?.nombre}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Usuario Info Card */}
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-800 border border-blue-200 dark:border-slate-700 p-5">
            <div className="flex items-start gap-4">
              {/* Avatar con gradiente */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full blur-sm opacity-50" />
                <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <span className="text-white font-bold text-lg">
                    {usuario?.nombre ? getInitials(usuario.nombre) : 'U'}
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                    {usuario?.nombre}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{usuario?.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Rol actual:</span>
                  {currentRolConfig && CurrentRolIcon && (
                    <Badge 
                      className={`${currentRolConfig.bgClass} ${currentRolConfig.textClass} border ${currentRolConfig.borderClass} font-medium px-3 py-1`}
                    >
                      <CurrentRolIcon className="h-3.5 w-3.5 mr-1.5" />
                      {currentRolConfig.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Selector de Rol */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Seleccionar Nuevo Rol
            </label>
            <Select
              value={nuevoRol}
              onValueChange={(value) => setNuevoRol(value as RolUsuario)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-12 border-2 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROL_CONFIG).map(([rol, config]) => {
                  const RolIcon = config.icon;
                  return (
                    <SelectItem key={rol} value={rol} className="py-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgClass}`}>
                          <RolIcon className={`h-4 w-4 ${config.iconClass}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">{config.label}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {config.description}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Descripción del Rol Seleccionado */}
          {nuevoRol && newRolConfig && NewRolIcon && (
            <div className={`rounded-xl ${newRolConfig.bgClass} border ${newRolConfig.borderClass} p-4 transition-all duration-300`}>
              <div className="flex gap-3">
                <NewRolIcon className={`h-5 w-5 ${newRolConfig.iconClass} mt-0.5 flex-shrink-0`} />
                <div>
                  <h4 className={`font-semibold ${newRolConfig.textClass} mb-1`}>
                    Permisos de {newRolConfig.label}
                  </h4>
                  <p className={`text-sm ${newRolConfig.textClass}`}>
                    {newRolConfig.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Advertencia si cambia el rol */}
          {cambioRol && (
            <div className="rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-1">
                    Cambio Inmediato
                  </h4>
                  <p className="text-sm text-orange-800 dark:text-orange-400">
                    Este cambio tendrá efecto inmediato. El usuario verá cambios en sus permisos
                    al recargar la página.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!cambioRol || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
