import { EtapaNegocio, TipoMoneda } from '@prisma/client';

export class NegocioResponseDto {
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

  // Relaciones incluidas
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

export class NegociosResponseDto {
  data: NegocioResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
