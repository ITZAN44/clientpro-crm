import { RolUsuario } from '@prisma/client';

export class UsuarioResponseDto {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  estaActivo: boolean;  // Cambiado de 'activo' a 'estaActivo' (coincide con Prisma)
  creadoEn: Date;
  actualizadoEn: Date;
}
