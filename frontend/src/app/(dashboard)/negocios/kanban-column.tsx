'use client';

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

// Border-top color per stage (Trading Floor identity)
const ETAPA_BORDER_COLOR: Record<EtapaNegocio, string> = {
  PROSPECTO: 'border-t-amber-500',
  CONTACTO_REALIZADO: 'border-t-blue-500',
  PROPUESTA: 'border-t-violet-500',
  NEGOCIACION: 'border-t-orange-500',
  GANADO: 'border-t-emerald-500',
  PERDIDO: 'border-t-rose-500',
};

// Label color per stage for header text
const ETAPA_TEXT_COLOR: Record<EtapaNegocio, string> = {
  PROSPECTO: 'text-amber-400',
  CONTACTO_REALIZADO: 'text-blue-400',
  PROPUESTA: 'text-violet-400',
  NEGOCIACION: 'text-orange-400',
  GANADO: 'text-emerald-400',
  PERDIDO: 'text-rose-400',
};

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
      {/* Column header — dark card with stage border-top identity */}
      <div
        className={`rounded-xl p-4 mb-3 bg-card border border-border border-t-2 ${ETAPA_BORDER_COLOR[etapa]} shadow-md shadow-black/30 transition-all duration-300`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-semibold text-base ${ETAPA_TEXT_COLOR[etapa]}`}>{config.label}</h3>
          <Badge className="bg-muted text-muted-foreground font-mono border-0 hover:bg-muted/80">
            {negocios.length}
          </Badge>
        </div>
        <p className="font-mono text-sm text-primary font-semibold">{formatCurrency(totalValor)}</p>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-xl p-4 transition-all duration-300 min-h-[500px] ${
          isOver ? 'bg-primary/5 ring-2 ring-primary/30 shadow-lg scale-[1.02]' : 'bg-background/50'
        }`}
      >
        <SortableContext items={negocios.map((n) => n.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {negocios.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-sm font-medium">
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
