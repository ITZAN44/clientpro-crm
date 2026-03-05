import {
  IsString,
  IsEmail,
  IsOptional,
  IsNotEmpty,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClienteDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value,
  )
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  nombre: string;

  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsOptional()
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value,
  )
  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsOptional()
  @MaxLength(50, { message: 'El teléfono no puede exceder 50 caracteres' })
  telefono?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value,
  )
  @IsString({ message: 'La empresa debe ser un texto' })
  @IsOptional()
  @MaxLength(255, { message: 'La empresa no puede exceder 255 caracteres' })
  empresa?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value,
  )
  @IsString({ message: 'El puesto debe ser un texto' })
  @IsOptional()
  @MaxLength(255, { message: 'El puesto no puede exceder 255 caracteres' })
  puesto?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value,
  )
  @IsString({ message: 'La dirección debe ser un texto' })
  @IsOptional()
  direccion?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value,
  )
  @IsString({ message: 'La ciudad debe ser un texto' })
  @IsOptional()
  @MaxLength(100, { message: 'La ciudad no puede exceder 100 caracteres' })
  ciudad?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value,
  )
  @IsString({ message: 'El país debe ser un texto' })
  @IsOptional()
  @MaxLength(100, { message: 'El país no puede exceder 100 caracteres' })
  pais?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value,
  )
  @IsString({ message: 'El sitio web debe ser un texto' })
  @IsOptional()
  @MaxLength(255, { message: 'El sitio web no puede exceder 255 caracteres' })
  sitioWeb?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : value,
  )
  @IsString({ message: 'Las notas deben ser un texto' })
  @IsOptional()
  notas?: string;

  @IsUUID('4', { message: 'El propietario debe ser un UUID válido' })
  @IsOptional()
  propietarioId?: string;
}
