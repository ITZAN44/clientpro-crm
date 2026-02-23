import { RolUsuario } from './rol';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  estaActivo: boolean;  // Cambiado de 'activo' a 'estaActivo' (coincide con backend)
  creadoEn: string;
  actualizadoEn: string;
}

export interface UpdateRolDto {
  rol: RolUsuario;
}
