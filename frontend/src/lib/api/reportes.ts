/**
 * API client para endpoints de Reportes
 */

import type {
  ReporteConversion,
  ReporteComparativas,
  ReporteRendimiento,
  ReporteQueryParams,
} from '@/types/reporte';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Obtiene métricas de conversión del pipeline
 */
export async function getConversion(
  token: string,
  params?: ReporteQueryParams
): Promise<ReporteConversion> {
  const queryParams = new URLSearchParams();
  
  if (params?.fechaInicio) {
    queryParams.append('fechaInicio', params.fechaInicio);
  }
  
  if (params?.fechaFin) {
    queryParams.append('fechaFin', params.fechaFin);
  }

  const url = queryParams.toString()
    ? `${API_URL}/reportes/conversion?${queryParams.toString()}`
    : `${API_URL}/reportes/conversion`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener métricas de conversión');
  }

  return response.json();
}

/**
 * Obtiene comparativas del mes actual vs mes anterior
 */
export async function getComparativas(token: string): Promise<ReporteComparativas> {
  const response = await fetch(`${API_URL}/reportes/comparativas`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener comparativas mensuales');
  }

  return response.json();
}

/**
 * Obtiene rendimiento por usuario/vendedor
 */
export async function getRendimientoUsuarios(
  token: string,
  params?: ReporteQueryParams
): Promise<ReporteRendimiento> {
  const queryParams = new URLSearchParams();
  
  if (params?.fechaInicio) {
    queryParams.append('fechaInicio', params.fechaInicio);
  }
  
  if (params?.fechaFin) {
    queryParams.append('fechaFin', params.fechaFin);
  }

  const url = queryParams.toString()
    ? `${API_URL}/reportes/rendimiento-usuarios?${queryParams.toString()}`
    : `${API_URL}/reportes/rendimiento-usuarios`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener rendimiento de usuarios');
  }

  return response.json();
}
