import axios from 'axios';
import type { Actividad, CreateActividadDto, UpdateActividadDto, ActividadesListResponse } from '@/types/actividad';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getActividades(
  token: string,
  params?: {
    page?: number;
    limit?: number;
    search?: string;
    tipo?: string;
    completada?: boolean;
    asignadoA?: string;
  }
): Promise<ActividadesListResponse> {
  const response = await axios.get(`${API_URL}/actividades`, {
    headers: { Authorization: `Bearer ${token}` },
    params,
  });
  return response.data;
}

export async function getActividad(token: string, id: string): Promise<Actividad> {
  const response = await axios.get(`${API_URL}/actividades/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createActividad(
  token: string,
  data: CreateActividadDto
): Promise<Actividad> {
  const response = await axios.post(`${API_URL}/actividades`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateActividad(
  token: string,
  id: string,
  data: UpdateActividadDto
): Promise<Actividad> {
  const response = await axios.patch(`${API_URL}/actividades/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function marcarActividadCompletada(
  token: string,
  id: string
): Promise<Actividad> {
  const response = await axios.patch(
    `${API_URL}/actividades/${id}/completar`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
}

export async function deleteActividad(token: string, id: string): Promise<void> {
  await axios.delete(`${API_URL}/actividades/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
