import { IsEnum } from 'class-validator';
import { RolUsuario } from '@prisma/client';

export class UpdateRolDto {
  @IsEnum(RolUsuario, {
    message: 'El rol debe ser ADMIN, MANAGER o VENDEDOR',
  })
  rol: RolUsuario;
}
