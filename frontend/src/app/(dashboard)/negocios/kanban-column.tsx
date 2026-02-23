"use client";

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Negocio, EtapaNegocio, ETAPAS_CONFIG } from '@/types/negocio';
import { Badge } from '@/components/ui/badge';
import NegocioCard from './negocio-card';

interface KanbanColumnProps {
  etapa: EtapaNegocio;
  negocios: Negocio[];
  onEdit: (negocio: Negocio) => void;
  onDelete: (negocio: Negocio) => void;
}

export default function KanbanColumn({ etapa, negocios, onEdit, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: etapa,
  });

  const config = ETAPAS_CONFIG[etapa];

  const totalValor = negocios.reduce((sum, n) => sum + n.valor, 0);

  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor);
  };

  return (
    <div className="flex flex-col h-full min-w-[320px] w-[320px]">
      {/* Header con gradiente */}
      <div
        className={`rounded-xl p-4 mb-3 bg-gradient-to-r ${config.gradient} shadow-md transition-all duration-300 hover:shadow-lg`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white text-base">
            {config.label}
          </h3>
          <Badge className="bg-white/20 backdrop-blur-sm text-white font-semibold border-0 hover:bg-white/30">
            {negocios.length}
          </Badge>
        </div>
        <p className="text-sm font-bold text-white/90">
          {formatCurrency(totalValor)}
        </p>
      </div>

      {/* Drop zone con glassmorphism */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-4 transition-all duration-300 min-h-[500px] ${
          isOver 
            ? 'bg-slate-100 dark:bg-slate-700/50 ring-2 ring-blue-500 ring-opacity-50 shadow-lg scale-[1.02]' 
            : 'bg-slate-50 dark:bg-slate-800/50'
        }`}
      >
        <SortableContext
          items={negocios.map((n) => n.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {negocios.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-slate-400 dark:text-slate-500 text-sm font-medium">
                Sin negocios
              </div>
            ) : (
              negocios.map((negocio) => (
                <NegocioCard
                  key={negocio.id}
                  negocio={negocio}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
