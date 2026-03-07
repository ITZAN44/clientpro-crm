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
    color: 'violet',
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-400',
    borderClass: 'border-violet-500/30',
    iconClass: 'text-violet-400',
    description: 'Acceso total al sistema. Puede gestionar usuarios, ver y modificar todo.',
  },
  [RolUsuario.MANAGER]: {
    label: 'Manager',
    icon: Users,
    color: 'emerald',
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    iconClass: 'text-emerald-400',
    description: 'Puede ver todos los registros y editar clientes, pero no eliminar.',
  },
  [RolUsuario.VENDEDOR]: {
    label: 'Vendedor',
    icon: User,
    color: 'blue',
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
    iconClass: 'text-blue-400',
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
      <DialogContent className="sm:max-w-[550px] bg-popover border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-serif">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="text-foreground">Cambiar Rol de Usuario</span>
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Modifica el rol y permisos de{' '}
            <span className="font-semibold text-foreground">{usuario?.nombre}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Usuario Info Card */}
          <div className="rounded-xl bg-muted border border-border p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-border">
                <span className="text-primary font-bold text-lg">
                  {usuario?.nombre ? getInitials(usuario.nombre) : 'U'}
                </span>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-medium text-foreground text-lg">{usuario?.nombre}</h3>
                  <p className="text-sm font-mono text-muted-foreground">{usuario?.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Rol actual:</span>
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
            <label className="text-sm font-semibold text-foreground">Seleccionar Nuevo Rol</label>
            <Select
              value={nuevoRol}
              onValueChange={(value) => setNuevoRol(value as RolUsuario)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-12 bg-input border-border focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {Object.entries(ROL_CONFIG).map(([rol, config]) => {
                  const RolIcon = config.icon;
                  return (
                    <SelectItem key={rol} value={rol} className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgClass}`}
                        >
                          <RolIcon className={`h-4 w-4 ${config.iconClass}`} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{config.label}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1">
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
            <div
              className={`rounded-xl ${newRolConfig.bgClass} border ${newRolConfig.borderClass} p-4 transition-all duration-300`}
            >
              <div className="flex gap-3">
                <NewRolIcon className={`h-5 w-5 ${newRolConfig.iconClass} mt-0.5 flex-shrink-0`} />
                <div>
                  <h4 className={`font-semibold ${newRolConfig.textClass} mb-1`}>
                    Permisos de {newRolConfig.label}
                  </h4>
                  <p className={`text-sm ${newRolConfig.textClass}`}>{newRolConfig.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Advertencia si cambia el rol */}
          {cambioRol && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Cambio Inmediato</h4>
                  <p className="text-sm text-muted-foreground">
                    Este cambio tendrá efecto inmediato. El usuario verá cambios en sus permisos al
                    recargar la página.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!cambioRol || isLoading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
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
