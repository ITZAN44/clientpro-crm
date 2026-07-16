import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { CreateNegocioDto } from './create-negocio.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { EtapaNegocio } from '@prisma/client';

export class UpdateNegocioDto extends PartialType(CreateNegocioDto) {
  @IsEnum(EtapaNegocio, { message: 'Etapa inválida' })
  @IsOptional()
  etapa?: EtapaNegocio;

  // Misma normalización que fechaCierreEsperada: "" -> undefined.
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsDateString({}, { message: 'Fecha de cierre real inválida' })
  @IsOptional()
  fechaCierreReal?: string;
}
