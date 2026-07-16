'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NotificationBadge } from './notification-badge';
import { NotificationItem } from './notification-item';
import { useNotifications } from '@/components/providers/notification-provider';
import { getNotificaciones, marcarTodasLeidas } from '@/lib/api/notificaciones';
import { CheckCheck, Inbox } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationDropdown() {
  const { data: session } = useSession();
  const { marcarComoLeida, actualizarContador } = useNotifications();
  const [open, setOpen] = useState(false);

  // Obtener notificaciones (solo las últimas 10)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notificaciones', 'dropdown'],
    queryFn: () =>
      getNotificaciones(session!.accessToken, {
        limite: 10,
        pagina: 1,
      }),
    enabled: !!session?.accessToken && open,
    refetchOnMount: 'always',
  });

  const handleMarcarTodasLeidas = async () => {
    if (!session?.accessToken) return;

    try {
      await marcarTodasLeidas(session.accessToken);
      await refetch();
      await actualizarContador();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      toast.error('Error al marcar notificaciones como leídas');
    }
  };

  const handleMarcarLeida = async (id: string) => {
    await marcarComoLeida(id);
    await refetch();
  };

  const notificaciones = data?.notificaciones || [];
  const hayNotificaciones = notificaciones.length > 0;
  const hayNoLeidas = notificaciones.some((n) => !n.leida);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div>
          <NotificationBadge />
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 backdrop-blur-md bg-popover border-border shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
            <CheckCheck className="h-4 w-4 text-primary" />
            Notificaciones
          </h3>
          {hayNoLeidas && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasLeidas}
              className="h-8 text-xs hover:bg-muted transition-colors"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Marcar todas
            </Button>
          )}
        </div>

        {/* Lista de notificaciones */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <div className="absolute top-0 left-0 animate-ping rounded-full h-8 w-8 border-b-2 border-primary opacity-20" />
              </div>
            </div>
          ) : hayNotificaciones ? (
            <div className="p-2 space-y-1">
              {notificaciones.map((notificacion) => (
                <NotificationItem
                  key={notificacion.id}
                  notificacion={notificacion}
                  onMarcarLeida={handleMarcarLeida}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center px-4">
              <Inbox className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No tienes notificaciones</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {hayNotificaciones && (
          <>
            <DropdownMenuSeparator className="bg-border" />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-primary hover:text-primary hover:bg-muted transition-colors"
                onClick={() => {
                  setOpen(false);
                  // TODO: Navegar a página de notificaciones completa
                }}
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
