'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Cliente } from '@/types/cliente';
import { RolUsuario } from '@/types/rol';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Mail, Phone, Building2, MapPin, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

/**
 * Función que genera las columnas de la tabla de clientes
 * con permisos basados en el rol del usuario
 */
export const getColumns = (userRol?: RolUsuario): ColumnDef<Cliente>[] => [
  {
    accessorKey: 'nombre',
    header: () => (
      <span className="text-muted-foreground uppercase text-xs tracking-wider">Cliente</span>
    ),
    cell: ({ row }) => {
      const nombre = row.getValue('nombre') as string;
      const email = row.original.email;
      const empresa = row.original.empresa;

      return (
        <div className="flex flex-col gap-1">
          <div className="font-medium text-foreground">{nombre}</div>
          {empresa && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              {empresa}
            </div>
          )}
          {email && (
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {email}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'puesto',
    header: () => (
      <span className="text-muted-foreground uppercase text-xs tracking-wider">Puesto</span>
    ),
    cell: ({ row }) => {
      const puesto = row.getValue('puesto') as string | undefined;
      return puesto ? (
        <span className="text-sm text-foreground">{puesto}</span>
      ) : (
        <span className="text-sm text-muted-foreground/50">-</span>
      );
    },
  },
  {
    accessorKey: 'telefono',
    header: () => (
      <span className="text-muted-foreground uppercase text-xs tracking-wider">Teléfono</span>
    ),
    cell: ({ row }) => {
      const telefono = row.getValue('telefono') as string | undefined;
      return telefono ? (
        <div className="flex items-center gap-1.5 font-mono text-sm">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          {telefono}
        </div>
      ) : (
        <span className="text-sm text-muted-foreground/50">-</span>
      );
    },
  },
  {
    accessorKey: 'ciudad',
    header: () => (
      <span className="text-muted-foreground uppercase text-xs tracking-wider">Ubicación</span>
    ),
    cell: ({ row }) => {
      const ciudad = row.original.ciudad;
      const pais = row.original.pais;

      if (!ciudad && !pais) {
        return <span className="text-sm text-muted-foreground/50">-</span>;
      }

      return (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{[ciudad, pais].filter(Boolean).join(', ')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'propietario',
    header: () => (
      <span className="text-muted-foreground uppercase text-xs tracking-wider">Propietario</span>
    ),
    cell: ({ row }) => {
      const propietario = row.original.propietario;

      return (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
            {propietario.nombre
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">{propietario.nombre}</span>
            <span className="font-mono text-xs text-muted-foreground">{propietario.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'creadoEn',
    header: () => (
      <span className="text-muted-foreground uppercase text-xs tracking-wider">Fecha Creación</span>
    ),
    cell: ({ row }) => {
      const fecha = new Date(row.getValue('creadoEn'));
      return (
        <span className="font-mono text-sm text-muted-foreground">
          {fecha.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const cliente = row.original;
      const meta = table.options.meta as any;

      // Verificar permisos
      const canEdit = userRol === RolUsuario.ADMIN || userRol === RolUsuario.MANAGER;
      const canDelete = userRol === RolUsuario.ADMIN;

      // Si no tiene permisos, no mostrar acciones
      if (!canEdit && !canDelete) {
        return null;
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 hover:text-primary">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
            <DropdownMenuLabel className="text-foreground">Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            {canEdit && (
              <DropdownMenuItem
                onClick={() => meta?.onEdit?.(cliente)}
                className="gap-2 cursor-pointer text-foreground focus:bg-accent hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={() => meta?.onDelete?.(cliente)}
                className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// Para compatibilidad con código existente (por defecto muestra todas las acciones)
export const columns = getColumns();
