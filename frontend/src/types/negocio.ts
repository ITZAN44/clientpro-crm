export type EtapaNegocio =
  | 'PROSPECTO'
  | 'CONTACTO_REALIZADO'
  | 'PROPUESTA'
  | 'NEGOCIACION'
  | 'GANADO'
  | 'PERDIDO';

export type TipoMoneda = 'MXN' | 'USD' | 'EUR';

export interface Negocio {
  id: string;
  titulo: string;
  descripcion?: string;
  valor: number;
  moneda: TipoMoneda;
  etapa: EtapaNegocio;
  probabilidad: number;
  fechaCierreEsperada?: Date;
  fechaCierreReal?: Date;
  clienteId: string;
  propietarioId: string;
  creadoEn: Date;
  actualizadoEn: Date;
  cerradoEn?: Date;
  cliente?: {
    id: string;
    nombre: string;
    email?: string;
    empresa?: string;
  };
  propietario?: {
    id: string;
    nombre: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateNegocioDto {
  titulo: string;
  descripcion?: string;
  valor?: number;
  moneda?: TipoMoneda;
  etapa?: EtapaNegocio;
  probabilidad?: number;
  fechaCierreEsperada?: string;
  clienteId: string;
  propietarioId?: string;
}

export interface UpdateNegocioDto {
  titulo?: string;
  descripcion?: string;
  valor?: number;
  moneda?: TipoMoneda;
  etapa?: EtapaNegocio;
  probabilidad?: number;
  fechaCierreEsperada?: string;
  fechaCierreReal?: string;
  clienteId?: string;
  propietarioId?: string;
}

export interface NegociosResponse {
  data: Negocio[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const ETAPAS_CONFIG = {
  PROSPECTO: {
    label: 'Prospecto',
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    bgDark: 'bg-blue-900/20',
    textLight: 'text-blue-700',
    textDark: 'text-blue-300',
    badgeBg: 'bg-blue-500',
  },
  CONTACTO_REALIZADO: {
    label: 'Contacto',
    gradient: 'from-cyan-500 to-cyan-600',
    bgLight: 'bg-cyan-50',
    bgDark: 'bg-cyan-900/20',
    textLight: 'text-cyan-700',
    textDark: 'text-cyan-300',
    badgeBg: 'bg-cyan-500',
  },
  PROPUESTA: {
    label: 'Propuesta',
    gradient: 'from-yellow-500 to-yellow-600',
    bgLight: 'bg-yellow-50',
    bgDark: 'bg-yellow-900/20',
    textLight: 'text-yellow-700',
    textDark: 'text-yellow-300',
    badgeBg: 'bg-yellow-500',
  },
  NEGOCIACION: {
    label: 'Negociación',
    gradient: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-50',
    bgDark: 'bg-orange-900/20',
    textLight: 'text-orange-700',
    textDark: 'text-orange-300',
    badgeBg: 'bg-orange-500',
  },
  GANADO: {
    label: 'Ganado',
    gradient: 'from-green-500 to-green-600',
    bgLight: 'bg-green-50',
    bgDark: 'bg-green-900/20',
    textLight: 'text-green-700',
    textDark: 'text-green-300',
    badgeBg: 'bg-green-500',
  },
  PERDIDO: {
    label: 'Perdido',
    gradient: 'from-red-500 to-red-600',
    bgLight: 'bg-red-50',
    bgDark: 'bg-red-900/20',
    textLight: 'text-red-700',
    textDark: 'text-red-300',
    badgeBg: 'bg-red-500',
  },
} as const;
