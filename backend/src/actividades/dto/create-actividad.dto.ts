import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, IsBoolean, IsDateString, MaxLength } from 'class-validator';

export enum TipoActividad {
  LLAMADA = 'LLAMADA',
  EMAIL = 'EMAIL',
  REUNION = 'REUNION',
  TAREA = 'TAREA',
  NOTA = 'NOTA',
}

export class CreateActividadDto {
  @IsEnum(TipoActividad, { message: 'El tipo debe ser LLAMADA, EMAIL, REUNION, TAREA o NOTA' })
  @IsNotEmpty({ message: 'El tipo de actividad es obligatorio' })
  tipo: TipoActividad;

  @IsString({ message: 'El título debe ser un texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(255, { message: 'El título no puede exceder 255 caracteres' })
  titulo: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;

  @IsDateString({}, { message: 'La fecha de vencimiento debe ser una fecha válida' })
  @IsOptional()
  fechaVencimiento?: string;

  @IsBoolean({ message: 'El campo completada debe ser verdadero o falso' })
  @IsOptional()
  completada?: boolean;

  @IsString({ message: 'El ID del negocio debe ser un UUID válido' })
  @IsOptional()
  negocioId?: string;

  @IsString({ message: 'El ID del cliente debe ser un UUID válido' })
  @IsOptional()
  clienteId?: string;

  @IsString({ message: 'El ID del asignado debe ser un UUID válido' })
  @IsOptional()
  asignadoA?: string;
}
