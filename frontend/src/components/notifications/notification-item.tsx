'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Bell, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  UserPlus, 
  AlertCircle,
  Briefcase,
  CalendarClock
} from 'lucide-react';
import { Notificacion, TipoNotificacion } from '@/types/notificacion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface NotificationItemProps {
  notificacion: Notificacion;
  onMarcarLeida?: (id: string) => void;
  onClose?: () => void;
}

// Configuración de iconos y colores por tipo de notificación
const TIPO_CONFIG: Record<TipoNotificacion, { icon: React.ElementType; color: string }> = {
  [TipoNotificacion.NEGOCIO_GANADO]: { icon: TrendingUp, color: 'text-lime-600' },
  [TipoNotificacion.NEGOCIO_PERDIDO]: { icon: TrendingDown, color: 'text-red-600' },
  [TipoNotificacion.NEGOCIO_ACTUALIZADO]: { icon: Briefcase, color: 'text-orange-600' },
  [TipoNotificacion.NEGOCIO_ASIGNADO]: { icon: Briefcase, color: 'text-blue-600' },
  [TipoNotificacion.ACTIVIDAD_VENCIDA]: { icon: AlertCircle, color: 'text-red-600' },
  [TipoNotificacion.ACTIVIDAD_COMPLETADA]: { icon: CheckCircle2, color: 'text-lime-600' },
  [TipoNotificacion.ACTIVIDAD_ASIGNADA]: { icon: CalendarClock, color: 'text-blue-600' },
  [TipoNotificacion.TAREA_VENCIMIENTO]: { icon: AlertCircle, color: 'text-yellow-600' },
  [TipoNotificacion.CLIENTE_NUEVO]: { icon: UserPlus, color: 'text-lime-600' },
  [TipoNotificacion.CLIENTE_ASIGNADO]: { icon: UserPlus, color: 'text-blue-600' },
  [TipoNotificacion.MENCION]: { icon: Bell, color: 'text-purple-600' },
  [TipoNotificacion.SISTEMA]: { icon: Bell, color: 'text-gray-600' },
};

export function NotificationItem({ notificacion, onMarcarLeida, onClose }: NotificationItemProps) {
  const router = useRouter();
  const config = TIPO_CONFIG[notificacion.tipo];
  const Icon = config.icon;

  const handleClick = () => {
    // Marcar como leída si no lo está
    if (!notificacion.leida && onMarcarLeida) {
      onMarcarLeida(notificacion.id);
    }

    // Navegar a la URL de acción si existe
    if (notificacion.urlAccion) {
      router.push(notificacion.urlAccion);
      onClose?.();
    }
  };

  const fechaRelativa = formatDistanceToNow(new Date(notificacion.creadoEn), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer',
        !notificacion.leida && 'bg-orange-50 hover:bg-orange-100',
        notificacion.leida && 'hover:bg-gray-50'
      )}
    >
      {/* Icono */}
      <div className={cn('flex-shrink-0 mt-1', config.color)}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            'text-sm font-medium text-stone-900',
            !notificacion.leida && 'font-semibold'
          )}>
            {notificacion.titulo}
          </h4>
          
          {/* Indicador de no leída */}
          {!notificacion.leida && (
            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-orange-600 mt-1.5" />
          )}
        </div>

        {notificacion.mensaje && (
          <p className="mt-1 text-xs text-stone-600 line-clamp-2">
            {notificacion.mensaje}
          </p>
        )}

        <p className="mt-1 text-xs text-stone-500">
          {fechaRelativa}
        </p>

        {/* Información adicional de relaciones */}
        {notificacion.negocioRelacionado && (
          <div className="mt-2 flex items-center gap-1 text-xs text-stone-600">
            <Briefcase className="h-3 w-3" />
            <span>{notificacion.negocioRelacionado.titulo}</span>
          </div>
        )}
      </div>
    </div>
  );
}
