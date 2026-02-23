import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todos los usuarios del sistema
   * Solo para ADMIN
   */
  async findAll(): Promise<UsuarioResponseDto[]> {
    const usuarios = await this.prisma.usuario.findMany({
      orderBy: {
        creadoEn: 'desc',
      },
    });

    return usuarios;
  }

  /**
   * Actualizar el rol de un usuario
   * Solo para ADMIN
   */
  async updateRol(id: string, updateRolDto: UpdateRolDto): Promise<UsuarioResponseDto> {
    // Verificar que el usuario existe
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    // Actualizar el rol
    const updatedUsuario = await this.prisma.usuario.update({
      where: { id },
      data: {
        rol: updateRolDto.rol,
      },
    });

    return updatedUsuario;
  }
}
