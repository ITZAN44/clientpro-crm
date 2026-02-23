"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Cliente } from "@/types/cliente";
import { RolUsuario } from "@/types/rol";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  Building2,
  MapPin,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

/**
 * Función que genera las columnas de la tabla de clientes
 * con permisos basados en el rol del usuario
 */
export const getColumns = (userRol?: RolUsuario): ColumnDef<Cliente>[] => [
  {
    accessorKey: "nombre",
    header: "Cliente",
    cell: ({ row }) => {
      const nombre = row.getValue("nombre") as string;
      const email = row.original.email;
      const empresa = row.original.empresa;
      
      return (
        <div className="flex flex-col gap-1">
          <div className="font-medium text-stone-900 dark:text-stone-100">{nombre}</div>
          {empresa && (
            <div className="flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
              <Building2 className="h-3.5 w-3.5" />
              {empresa}
            </div>
          )}
          {email && (
            <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
              <Mail className="h-3 w-3" />
              {email}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "puesto",
    header: "Puesto",
    cell: ({ row }) => {
      const puesto = row.getValue("puesto") as string | undefined;
      return puesto ? (
        <span className="text-sm text-stone-600 dark:text-stone-300">{puesto}</span>
      ) : (
        <span className="text-sm text-stone-400 dark:text-stone-500">-</span>
      );
    },
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }) => {
      const telefono = row.getValue("telefono") as string | undefined;
      return telefono ? (
        <div className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-300">
          <Phone className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
          {telefono}
        </div>
      ) : (
        <span className="text-sm text-stone-400 dark:text-stone-500">-</span>
      );
    },
  },
  {
    accessorKey: "ciudad",
    header: "Ubicación",
    cell: ({ row }) => {
      const ciudad = row.original.ciudad;
      const pais = row.original.pais;
      
      if (!ciudad && !pais) {
        return <span className="text-sm text-stone-400 dark:text-stone-500">-</span>;
      }
      
      return (
        <div className="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-300">
          <MapPin className="h-3.5 w-3.5 text-stone-400 dark:text-stone-500" />
          <span>{[ciudad, pais].filter(Boolean).join(", ")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "propietario",
    header: "Propietario",
    cell: ({ row }) => {
      const propietario = row.original.propietario;
      
      return (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-medium">
            {propietario.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
              {propietario.nombre}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {propietario.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "creadoEn",
    header: "Fecha Creación",
    cell: ({ row }) => {
      const fecha = new Date(row.getValue("creadoEn"));
      return (
        <span className="text-sm text-stone-600 dark:text-stone-300">
          {fecha.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      );
    },
  },
  {
    id: "actions",
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
            <DropdownMenuLabel className="text-stone-900 dark:text-stone-100">Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-stone-200 dark:bg-stone-700" />
            {canEdit && (
              <DropdownMenuItem
                onClick={() => meta?.onEdit?.(cliente)}
                className="gap-2 cursor-pointer text-stone-700 dark:text-stone-200 focus:bg-stone-100 dark:focus:bg-stone-700"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={() => meta?.onDelete?.(cliente)}
                className="gap-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
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
