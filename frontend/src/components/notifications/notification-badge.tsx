'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/providers/notification-provider';

interface NotificationBadgeProps {
  onClick?: () => void;
}

export function NotificationBadge({ onClick }: NotificationBadgeProps) {
  const { contadorNoLeidas, isConnected } = useNotifications();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      onClick={onClick}
      aria-label={`Notificaciones${contadorNoLeidas > 0 ? ` (${contadorNoLeidas} sin leer)` : ''}`}
    >
      <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors" />
      
      {contadorNoLeidas > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
          <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white dark:border-slate-900">
            {contadorNoLeidas > 9 ? '9+' : contadorNoLeidas}
          </span>
        </span>
      )}

      {/* Indicador de conexión WebSocket */}
      {isConnected && (
        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
      )}
    </Button>
  );
}
