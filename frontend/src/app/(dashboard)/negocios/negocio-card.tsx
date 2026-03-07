'use client';

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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: negocio.id,
  });

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
        bg-card
        backdrop-blur-sm
        rounded-xl
        border border-border
        hover:border-primary/20
        p-4
        shadow-md shadow-black/40
        hover:shadow-lg hover:shadow-black/50
        hover:-translate-y-1
        transition-all
        duration-300
        group
        ${isDragging ? 'opacity-50 rotate-2 scale-105 shadow-2xl' : 'cursor-grab active:cursor-grabbing'}
      `}
    >
      {/* Drag handle — 3 horizontal lines at top */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="w-8 h-0.5 bg-muted-foreground/40 hover:bg-foreground/60 rounded-full transition-colors"></div>
        <div className="w-8 h-0.5 bg-muted-foreground/40 hover:bg-foreground/60 rounded-full transition-colors"></div>
        <div className="w-8 h-0.5 bg-muted-foreground/40 hover:bg-foreground/60 rounded-full transition-colors"></div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 mt-2">
        <h4 className="font-medium text-lg text-foreground line-clamp-2 flex-1 leading-tight">
          {negocio.titulo}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-muted rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(negocio);
              }}
              className="text-foreground focus:bg-muted cursor-pointer"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(negocio);
              }}
              className="text-destructive focus:bg-destructive/10 cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Valor monetario — amber mono highlight */}
      <div className="mb-4">
        <p className="font-mono text-2xl font-semibold text-primary">
          {formatCurrency(negocio.valor, negocio.moneda)}
        </p>
      </div>

      {/* Cliente */}
      {negocio.cliente && (
        <div className="flex items-start gap-2 mb-3 p-2 rounded-lg bg-muted/50">
          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-foreground min-w-0">
            <p className="font-medium truncate">{negocio.cliente.nombre}</p>
            {negocio.cliente.empresa && (
              <p className="text-xs text-muted-foreground truncate">{negocio.cliente.empresa}</p>
            )}
          </div>
        </div>
      )}

      {/* Badge de probabilidad */}
      <div className="flex items-center gap-2 mb-3">
        <Badge
          className={`
            ${negocio.probabilidad >= 75 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : ''}
            ${negocio.probabilidad >= 50 && negocio.probabilidad < 75 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : ''}
            ${negocio.probabilidad < 50 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''}
            font-mono font-semibold border
          `}
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          {negocio.probabilidad}%
        </Badge>

        {/* Fecha de cierre esperada */}
        {negocio.fechaCierreEsperada && (
          <Badge
            variant="outline"
            className="border-border text-muted-foreground font-mono text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(negocio.fechaCierreEsperada)}
          </Badge>
        )}
      </div>

      {/* Propietario */}
      {negocio.propietario && (
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
            {negocio.propietario.nombre
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <span className="text-xs text-muted-foreground truncate font-medium">
            {negocio.propietario.nombre}
          </span>
        </div>
      )}
    </div>
  );
}

// Export memoized version - only re-render if negocio.id changes
export default memo(NegocioCard, (prevProps, nextProps) => {
  return (
    prevProps.negocio.id === nextProps.negocio.id &&
    prevProps.negocio.titulo === nextProps.negocio.titulo &&
    prevProps.negocio.etapa === nextProps.negocio.etapa &&
    prevProps.negocio.valor === nextProps.negocio.valor
  );
});
