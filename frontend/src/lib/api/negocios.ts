import axios from 'axios';
import {
  Negocio,
  NegociosResponse,
  CreateNegocioDto,
  UpdateNegocioDto,
  EtapaNegocio,
} from '@/types/negocio';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getNegocios(
  token: string,
  page: number = 1,
  limit: number = 100,
  search?: string,
  etapa?: EtapaNegocio,
  propietarioId?: string,
): Promise<NegociosResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search) params.append('search', search);
  if (etapa) params.append('etapa', etapa);
  if (propietarioId) params.append('propietarioId', propietarioId);

  const response = await axios.get(`${API_URL}/negocios?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function getNegocio(token: string, id: string): Promise<Negocio> {
  const response = await axios.get(`${API_URL}/negocios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export async function createNegocio(
  token: string,
  data: CreateNegocioDto,
): Promise<Negocio> {
  const response = await axios.post(`${API_URL}/negocios`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function updateNegocio(
  token: string,
  id: string,
  data: UpdateNegocioDto,
): Promise<Negocio> {
  const response = await axios.patch(`${API_URL}/negocios/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function deleteNegocio(token: string, id: string): Promise<void> {
  await axios.delete(`${API_URL}/negocios/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function cambiarEtapaNegocio(
  token: string,
  id: string,
  etapa: EtapaNegocio,
): Promise<Negocio> {
  const response = await axios.patch(
    `${API_URL}/negocios/${id}/etapa`,
    { etapa },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
}
