import { TipoNotificacion } from '@prisma/client';

export class NotificacionResponseDto {
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
  creadoEn: Date;

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
