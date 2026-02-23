import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface StatsGenerales {
  clientes: {
    total: number;
    nuevosEsteMes: number;
    porcentajeCrecimiento: number;
  };
  negocios: {
    activos: number;
    valorPipeline: number;
    porcentajeCrecimiento: number;
  };
  ventas: {
    totalEsteMes: number;
    porcentajeCrecimiento: number;
    objetivoMensual: number;
    porcentajeObjetivo: number;
  };
}

export interface DistribucionEtapa {
  etapa: string;
  cantidad: number;
  valorTotal: number;
}

export async function getStatsGenerales(token: string): Promise<StatsGenerales> {
  const response = await axios.get(`${API_URL}/stats/general`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getDistribucionEtapas(token: string): Promise<DistribucionEtapa[]> {
  const response = await axios.get(`${API_URL}/stats/distribucion-etapas`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}
