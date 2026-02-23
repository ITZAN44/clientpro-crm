import { IsOptional, IsDateString } from 'class-validator';

export class ReporteQueryDto {
  @IsOptional()
  @IsDateString({}, { message: 'La fecha inicial debe ser una fecha válida' })
  fechaInicio?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha final debe ser una fecha válida' })
  fechaFin?: string;
}
