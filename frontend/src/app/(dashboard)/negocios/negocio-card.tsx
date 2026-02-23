"use client";

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Negocio } from '@/types/negocio';
import { Building2, Calendar, TrendingUp, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface NegocioCardProps {
  negocio: Negocio;
  onEdit: (negocio: Negocio) => void;
  onDelete: (negocio: Negocio) => void;
}

// Memoized component to prevent unnecessary re-renders
function NegocioCard({ negocio, onEdit, onDelete }: NegocioCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: negocio.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (valor: number, moneda: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const formatDate = (date?: Date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative
        bg-white/90 dark:bg-slate-900/90 
        backdrop-blur-sm
        rounded-xl 
        border border-slate-200 dark:border-slate-700 
        p-4 
        shadow-md 
        hover:shadow-lg 
        hover:-translate-y-1 
        transition-all 
        duration-300
        group
        ${isDragging ? 'opacity-50 rotate-2 scale-105 shadow-2xl' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      {/* Drag indicator - 3 líneas horizontales en top */}
      <div 
        {...attributes}
        {...listeners}
        className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
        <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
        <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 mt-2">
        <h4 className="font-semibold text-lg text-slate-900 dark:text-slate-100 line-clamp-2 flex-1 leading-tight">
          {negocio.titulo}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(negocio);
              }}
              className="text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-slate-700 cursor-pointer"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(negocio);
              }}
              className="text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Valor con gradiente verde */}
      <div className="mb-4">
        <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          {formatCurrency(negocio.valor, negocio.moneda)}
        </p>
      </div>

      {/* Cliente */}
      {negocio.cliente && (
        <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <Building2 className="h-4 w-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-600 dark:text-slate-300 min-w-0">
            <p className="font-medium truncate">{negocio.cliente.nombre}</p>
            {negocio.cliente.empresa && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{negocio.cliente.empresa}</p>
            )}
          </div>
        </div>
      )}

      {/* Badge de probabilidad con estado */}
      <div className="flex items-center gap-2 mb-3">
        <Badge 
          className={`
            ${negocio.probabilidad >= 75 ? 'bg-green-500' : ''}
            ${negocio.probabilidad >= 50 && negocio.probabilidad < 75 ? 'bg-yellow-500' : ''}
            ${negocio.probabilidad < 50 ? 'bg-orange-500' : ''}
            text-white font-semibold
          `}
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          {negocio.probabilidad}%
        </Badge>
        
        {/* Fecha de cierre esperada */}
        {negocio.fechaCierreEsperada && (
          <Badge variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(negocio.fechaCierreEsperada)}
          </Badge>
        )}
      </div>

      {/* Propietario */}
      {negocio.propietario && (
        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
            {negocio.propietario.nombre
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-300 truncate font-medium">
            {negocio.propietario.nombre}
          </span>
        </div>
      )}
    </div>
  );
}

// Export memoized version - only re-render if negocio.id changes
export default memo(NegocioCard, (prevProps, nextProps) => {
  return prevProps.negocio.id === nextProps.negocio.id &&
         prevProps.negocio.titulo === nextProps.negocio.titulo &&
         prevProps.negocio.etapa === nextProps.negocio.etapa &&
         prevProps.negocio.valor === nextProps.negocio.valor;
});
