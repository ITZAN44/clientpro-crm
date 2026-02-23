import { Notificacion, NotificacionesResponse, ContadorNoLeidasResponse } from '@/types/notificacion';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Listar notificaciones del usuario
 */
export async function getNotificaciones(
  token: string,
  params?: {
    leida?: boolean;
    pagina?: number;
    limite?: number;
  }
): Promise<NotificacionesResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.leida !== undefined) {
    queryParams.append('leida', String(params.leida));
  }
  if (params?.pagina) {
    queryParams.append('pagina', String(params.pagina));
  }
  if (params?.limite) {
    queryParams.append('limite', String(params.limite));
  }

  const url = `${API_URL}/notificaciones${queryParams.toString() ? `?${queryParams}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener notificaciones');
  }

  return response.json();
}

/**
 * Obtener contador de notificaciones no leídas
 */
export async function getContadorNoLeidas(token: string): Promise<ContadorNoLeidasResponse> {
  try {
    const response = await fetch(`${API_URL}/notificaciones/no-leidas/count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Si es error de autenticación, devolver contador en 0 sin error
      if (response.status === 401) {
        return { count: 0 };
      }
      throw new Error('Error al obtener contador de notificaciones');
    }

    return response.json();
  } catch (error) {
    // Si es error de red (backend no disponible), devolver 0 silenciosamente
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return { count: 0 };
    }
    throw error;
  }
}

/**
 * Obtener una notificación específica
 */
export async function getNotificacion(token: string, id: string): Promise<Notificacion> {
  const response = await fetch(`${API_URL}/notificaciones/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener notificación');
  }

  return response.json();
}

/**
 * Marcar notificación como leída
 */
export async function marcarNotificacionLeida(token: string, id: string): Promise<Notificacion> {
  const response = await fetch(`${API_URL}/notificaciones/${id}/marcar-leida`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al marcar notificación como leída');
  }

  return response.json();
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function marcarTodasLeidas(token: string): Promise<{ actualizado: number }> {
  const response = await fetch(`${API_URL}/notificaciones/marcar-todas-leidas`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al marcar todas las notificaciones como leídas');
  }

  return response.json();
}
