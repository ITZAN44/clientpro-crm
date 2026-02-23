export enum TipoNotificacion {
  NEGOCIO_ASIGNADO = 'NEGOCIO_ASIGNADO',
  TAREA_VENCIMIENTO = 'TAREA_VENCIMIENTO',
  NEGOCIO_GANADO = 'NEGOCIO_GANADO',
  NEGOCIO_PERDIDO = 'NEGOCIO_PERDIDO',
  CLIENTE_ASIGNADO = 'CLIENTE_ASIGNADO',
  MENCION = 'MENCION',
  ACTIVIDAD_ASIGNADA = 'ACTIVIDAD_ASIGNADA',
  NEGOCIO_ACTUALIZADO = 'NEGOCIO_ACTUALIZADO',
  ACTIVIDAD_VENCIDA = 'ACTIVIDAD_VENCIDA',
  ACTIVIDAD_COMPLETADA = 'ACTIVIDAD_COMPLETADA',
  CLIENTE_NUEVO = 'CLIENTE_NUEVO',
  SISTEMA = 'SISTEMA',
}

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string | null;
  leida: boolean;
  usuarioId: string;
  negocioRelacionadoId: string | null;
  clienteRelacionadoId: string | null;
  actividadRelacionadaId: string | null;
  urlAccion: string | null;
  creadoEn: Date | string;

  // Relaciones opcionales
  negocioRelacionado?: {
    id: string;
    titulo: string;
    etapa: string;
  };
  clienteRelacionado?: {
    id: string;
    nombre: string;
  };
  actividadRelacionada?: {
    id: string;
    titulo: string;
    tipo: string;
  };
}

export interface NotificacionesResponse {
  notificaciones: Notificacion[];
  total: number;
  pagina: number;
  limite: number;
}

export interface ContadorNoLeidasResponse {
  count: number;
}
