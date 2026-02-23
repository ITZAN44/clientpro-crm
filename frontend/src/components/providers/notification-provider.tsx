'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Socket } from 'socket.io-client';
import { createSocketConnection, SOCKET_EVENTS } from '@/lib/socket';
import { Notificacion } from '@/types/notificacion';
import { getContadorNoLeidas, marcarNotificacionLeida } from '@/lib/api/notificaciones';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface NotificationContextType {
  notificaciones: Notificacion[];
  contadorNoLeidas: number;
  isConnected: boolean;
  marcarComoLeida: (notificacionId: string) => Promise<void>;
  actualizarContador: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [contadorNoLeidas, setContadorNoLeidas] = useState(0);

  // Conectar al WebSocket cuando hay sesión
  useEffect(() => {
    if (!session?.accessToken) {
      return;
    }

    const newSocket = createSocketConnection(session.accessToken);

    // Eventos de conexión
    newSocket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      // Solo mostrar error si el usuario está autenticado (evita spam en login)
      if (session?.accessToken) {
        console.error('Error de conexión WebSocket:', error.message);
      }
      setIsConnected(false);
    });

    // Evento de bienvenida
    newSocket.on(SOCKET_EVENTS.CONECTADO, (data) => {
      console.log('🎉 Conectado al servidor de notificaciones:', data);
    });

    // Evento de nueva notificación
    newSocket.on(SOCKET_EVENTS.NUEVA_NOTIFICACION, (notificacion: Notificacion) => {
      console.log('🔔 Nueva notificación recibida:', notificacion);
      
      // Agregar notificación a la lista
      setNotificaciones((prev) => [notificacion, ...prev]);
      
      // Incrementar contador si no está leída
      if (!notificacion.leida) {
        setContadorNoLeidas((prev) => prev + 1);
      }

      // Mostrar toast
      toast.info(notificacion.titulo, {
        description: notificacion.mensaje || undefined,
        duration: 5000,
      });

      // Invalidar queries relacionadas (incluye dashboard stats)
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
      queryClient.invalidateQueries({ queryKey: ['contador-no-leidas'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['negocios'] });
    });

    // Evento de negocio actualizado
    newSocket.on(SOCKET_EVENTS.NEGOCIO_ACTUALIZADO, (data) => {
      console.log('📊 Negocio actualizado:', data);
      
      // Invalidar queries de negocios
      queryClient.invalidateQueries({ queryKey: ['negocios'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['reportes'] });
    });

    // Evento de actividad vencida
    newSocket.on(SOCKET_EVENTS.ACTIVIDAD_VENCIDA, (data) => {
      console.log('⏰ Actividad vencida:', data);
      
      // Invalidar queries de actividades
      queryClient.invalidateQueries({ queryKey: ['actividades'] });
    });

    // Evento de notificación marcada como leída
    newSocket.on(SOCKET_EVENTS.NOTIFICACION_LEIDA, (data) => {
      console.log('✅ Notificación marcada como leída:', data);
      
      // Actualizar estado local
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === data.notificacionId ? { ...n, leida: true } : n))
      );
      setContadorNoLeidas((prev) => Math.max(0, prev - 1));
    });

    // Evento de contador actualizado
    newSocket.on(SOCKET_EVENTS.CONTADOR_NO_LEIDAS, (data) => {
      console.log('🔢 Contador actualizado:', data);
      setContadorNoLeidas(data.count);
    });

    setSocket(newSocket);

    // Obtener contador inicial
    if (session.accessToken) {
      getContadorNoLeidas(session.accessToken)
        .then((response) => setContadorNoLeidas(response.count))
        .catch((error) => {
          // Solo mostrar error si no es un problema de autenticación
          if (error.message !== 'Error al obtener contador de notificaciones') {
            console.error('Error al obtener contador:', error);
          }
        });
    }

    // Cleanup
    return () => {
      console.log('🔌 Cerrando conexión WebSocket');
      newSocket.close();
    };
  }, [session?.accessToken, queryClient]);

  // Función para marcar notificación como leída
  const marcarComoLeida = useCallback(
    async (notificacionId: string) => {
      if (!session?.accessToken) {
        return;
      }

      try {
        await marcarNotificacionLeida(session.accessToken, notificacionId);
        
        // Emitir evento al servidor
        socket?.emit(SOCKET_EVENTS.MARCAR_LEIDA, { notificacionId });
        
        // Actualizar estado local
        setNotificaciones((prev) =>
          prev.map((n) => (n.id === notificacionId ? { ...n, leida: true } : n))
        );
        setContadorNoLeidas((prev) => Math.max(0, prev - 1));

        // Invalidar queries
        queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
        queryClient.invalidateQueries({ queryKey: ['contador-no-leidas'] });
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        toast.error('Error al marcar notificación como leída');
      }
    },
    [session?.accessToken, socket, queryClient]
  );

  // Función para actualizar contador
  const actualizarContador = useCallback(async () => {
    if (!session?.accessToken) {
      return;
    }

    try {
      const response = await getContadorNoLeidas(session.accessToken);
      setContadorNoLeidas(response.count);
    } catch (error) {
      console.error('Error al actualizar contador:', error);
    }
  }, [session?.accessToken]);

  const value: NotificationContextType = {
    notificaciones,
    contadorNoLeidas,
    isConnected,
    marcarComoLeida,
    actualizarContador,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de notificaciones
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  
  return context;
}
