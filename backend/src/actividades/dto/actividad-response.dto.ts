import { TipoActividad } from './create-actividad.dto';

export interface ActividadResponseDto {
  id: string;
  tipo: TipoActividad;
  titulo: string;
  descripcion?: string;
  fechaVencimiento?: Date;
  completada: boolean;
  completadaEn?: Date;
  negocioId?: string;
  clienteId?: string;
  asignadoA: string;
  creadoPor: string;
  creadoEn: Date;
  actualizadoEn: Date;
  
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
