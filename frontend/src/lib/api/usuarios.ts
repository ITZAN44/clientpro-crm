import axios from 'axios';
import { Usuario, UpdateRolDto } from '@/types/usuario';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Obtener todos los usuarios (solo ADMIN)
 */
export async function getUsuarios(token: string): Promise<Usuario[]> {
  const response = await axios.get<Usuario[]>(`${API_URL}/usuarios`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

/**
 * Actualizar el rol de un usuario (solo ADMIN)
 */
export async function updateUsuarioRol(
  token: string,
  id: string,
  data: UpdateRolDto,
): Promise<Usuario> {
  const response = await axios.patch<Usuario>(
    `${API_URL}/usuarios/${id}/rol`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}
