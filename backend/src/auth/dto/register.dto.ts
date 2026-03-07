import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsEnum(['ADMIN', 'MANAGER', 'VENDEDOR'], { message: 'Rol inválido' })
  @IsOptional()
  rol?: 'ADMIN' | 'MANAGER' | 'VENDEDOR';

  @IsString()
  @IsOptional()
  equipoId?: string;
}
