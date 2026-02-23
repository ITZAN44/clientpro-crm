import { PartialType } from '@nestjs/mapped-types';
import { CreateNegocioDto } from './create-negocio.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { EtapaNegocio } from '@prisma/client';

export class UpdateNegocioDto extends PartialType(CreateNegocioDto) {
  @IsEnum(EtapaNegocio, { message: 'Etapa inválida' })
  @IsOptional()
  etapa?: EtapaNegocio;

  @IsDateString({}, { message: 'Fecha de cierre real inválida' })
  @IsOptional()
  fechaCierreReal?: string;
}
