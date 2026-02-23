/**
 * Tipos para módulo de Reportes Avanzados
 */

// ============================================
// CONVERSIÓN DEL PIPELINE
// ============================================

export interface ConversionEtapa {
  etapa: string;
  cantidad: number;
  porcentaje: number;
  conversionDesdeInicio?: number;
}

export interface ReporteConversion {
  total: number;
  tasaCierre: number;
  conversion: ConversionEtapa[];
  periodo: {
    inicio: string | null;
    fin: string | null;
  };
}

// ============================================
// COMPARATIVAS MENSUALES
// ============================================

export interface MetricaComparativa {
  actual: number;
  anterior: number;
  cambio: number;
}

export interface ReporteComparativas {
  clientes: MetricaComparativa;
  negociosGanados: MetricaComparativa;
  valorTotal: MetricaComparativa;
  actividades: MetricaComparativa;
  periodo: {
    mesActual: {
      inicio: string;
      fin: string;
    };
    mesAnterior: {
      inicio: string;
      fin: string;
    };
  };
}

// ============================================
// RENDIMIENTO POR USUARIO
// ============================================

export interface UsuarioInfo {
  id: string;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'MANAGER' | 'VENDEDOR';
}

export interface MetricasUsuario {
  negociosGanados: number;
  negociosPerdidos: number;
  valorGenerado: number;
  actividadesCompletadas: number;
  totalNegocios: number;
  tasaConversion: number;
}

export interface RendimientoUsuario {
  usuario: UsuarioInfo;
  metricas: MetricasUsuario;
}

export interface ReporteRendimiento {
  rendimiento: RendimientoUsuario[];
  periodo: {
    inicio: string | null;
    fin: string | null;
  };
}

// ============================================
// QUERY PARAMS
// ============================================

export interface ReporteQueryParams {
  fechaInicio?: string;
  fechaFin?: string;
}
