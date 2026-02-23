export type TipoActividad = 'LLAMADA' | 'EMAIL' | 'REUNION' | 'TAREA' | 'NOTA';

export interface Actividad {
  id: string;
  tipo: TipoActividad;
  titulo: string;
  descripcion?: string;
  fechaVencimiento?: Date | string;
  completada: boolean;
  completadaEn?: Date | string;
  negocioId?: string;
  clienteId?: string;
  asignadoA: string;
  creadoPor: string;
  creadoEn: Date | string;
  actualizadoEn: Date | string;
  
  // Relaciones opcionales
  negocio?: {
    id: string;
    titulo: string;
    valor: number;
    etapa: string;
  };
  cliente?: {
    id: string;
    nombre: string;
    empresa?: string;
    email?: string;
  };
  asignado?: {
    id: string;
    nombre: string;
    email: string;
  };
  creador?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export interface CreateActividadDto {
  tipo: TipoActividad;
  titulo: string;
  descripcion?: string;
  fechaVencimiento?: string;
  completada?: boolean;
  negocioId?: string;
  clienteId?: string;
  asignadoA?: string;
}

export interface UpdateActividadDto {
  tipo?: TipoActividad;
  titulo?: string;
  descripcion?: string;
  fechaVencimiento?: string;
  completada?: boolean;
  negocioId?: string;
  clienteId?: string;
  asignadoA?: string;
}

export interface ActividadesListResponse {
  data: Actividad[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Configuración de colores para cada tipo de actividad
export const TIPO_ACTIVIDAD_CONFIG: Record<TipoActividad, { color: string; bgColor: string; icon: string }> = {
  LLAMADA: {
    color: '#3B82F6', // blue-500
    bgColor: '#EFF6FF', // blue-50
    icon: 'Phone',
  },
  EMAIL: {
    color: '#8B5CF6', // violet-500
    bgColor: '#F5F3FF', // violet-50
    icon: 'Mail',
  },
  REUNION: {
    color: '#F59E0B', // amber-500
    bgColor: '#FFFBEB', // amber-50
    icon: 'Users',
  },
  TAREA: {
    color: '#84CC16', // lime-500
    bgColor: '#F7FEE7', // lime-50
    icon: 'CheckSquare',
  },
  NOTA: {
    color: '#6B7280', // gray-500
    bgColor: '#F9FAFB', // gray-50
    icon: 'FileText',
  },
};

// Labels en español
export const TIPO_ACTIVIDAD_LABELS: Record<TipoActividad, string> = {
  LLAMADA: 'Llamada',
  EMAIL: 'Email',
  REUNION: 'Reunión',
  TAREA: 'Tarea',
  NOTA: 'Nota',
};
