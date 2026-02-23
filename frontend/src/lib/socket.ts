import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Crear conexión Socket.io para notificaciones en tiempo real
 * @param token - JWT token para autenticación
 * @returns Socket instance
 */
export function createSocketConnection(token: string): Socket {
  const socket = io(`${SOCKET_URL}/notificaciones`, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

/**
 * Eventos disponibles del servidor
 */
export const SOCKET_EVENTS = {
  // Eventos del servidor
  CONECTADO: 'conectado',
  NUEVA_NOTIFICACION: 'nuevaNotificacion',
  NEGOCIO_ACTUALIZADO: 'negocioActualizado',
  ACTIVIDAD_VENCIDA: 'actividadVencida',
  NOTIFICACION_LEIDA: 'notificacionLeida',
  CONTADOR_NO_LEIDAS: 'contadorNoLeidas',

  // Eventos al servidor
  MARCAR_LEIDA: 'marcarLeida',
  OBTENER_CONTADOR: 'obtenerContadorNoLeidas',
} as const;
