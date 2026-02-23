import { IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryNotificacionesDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'El campo leida debe ser un booleano' })
  leida?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La página debe ser un número' })
  @Min(1, { message: 'La página debe ser al menos 1' })
  pagina?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El límite debe ser un número' })
  @Min(1, { message: 'El límite debe ser al menos 1' })
  limite?: number = 20;
}
