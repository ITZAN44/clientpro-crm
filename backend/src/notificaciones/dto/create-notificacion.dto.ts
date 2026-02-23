import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { TipoNotificacion } from '@prisma/client';

export class CreateNotificacionDto {
  @IsEnum(TipoNotificacion, { message: 'El tipo de notificación debe ser válido' })
  tipo: TipoNotificacion;

  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo: string;

  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @IsOptional()
  mensaje?: string;

  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  usuarioId: string;

  @IsUUID('4', { message: 'El ID del negocio debe ser un UUID válido' })
  @IsOptional()
  negocioRelacionadoId?: string;

  @IsUUID('4', { message: 'El ID del cliente debe ser un UUID válido' })
  @IsOptional()
  clienteRelacionadoId?: string;

  @IsUUID('4', { message: 'El ID de la actividad debe ser un UUID válido' })
  @IsOptional()
  actividadRelacionadaId?: string;

  @IsString({ message: 'La URL de acción debe ser una cadena de texto' })
  @IsOptional()
  urlAccion?: string;
}
