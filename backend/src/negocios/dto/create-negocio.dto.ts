import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsDateString, Min, Max, IsDecimal } from 'class-validator';
import { EtapaNegocio, TipoMoneda } from '@prisma/client';

export class CreateNegocioDto {
  @IsString({ message: 'El título debe ser un texto' })
  @IsNotEmpty({ message: 'El título es requerido' })
  titulo: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;

  @IsNumber({}, { message: 'El valor debe ser un número' })
  @Min(0, { message: 'El valor no puede ser negativo' })
  @IsOptional()
  valor?: number;

  @IsEnum(TipoMoneda, { message: 'Moneda inválida (MXN, USD, EUR)' })
  @IsOptional()
  moneda?: TipoMoneda;

  @IsEnum(EtapaNegocio, { message: 'Etapa inválida' })
  @IsOptional()
  etapa?: EtapaNegocio;

  @IsNumber({}, { message: 'La probabilidad debe ser un número' })
  @Min(0, { message: 'La probabilidad no puede ser menor a 0' })
  @Max(100, { message: 'La probabilidad no puede ser mayor a 100' })
  @IsOptional()
  probabilidad?: number;

  @IsDateString({}, { message: 'Fecha de cierre esperada inválida' })
  @IsOptional()
  fechaCierreEsperada?: string;

  @IsString({ message: 'El ID del cliente debe ser un texto' })
  @IsNotEmpty({ message: 'El ID del cliente es requerido' })
  clienteId: string;

  @IsString({ message: 'El ID del propietario debe ser un texto' })
  @IsOptional()
  propietarioId?: string;
}
