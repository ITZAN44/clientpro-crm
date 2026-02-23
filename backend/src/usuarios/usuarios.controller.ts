import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';
import { RolUsuario } from '@prisma/client';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * GET /usuarios
   * Obtener todos los usuarios
   * Solo para ADMIN
   */
  @Get()
  @Roles(RolUsuario.ADMIN)
  async findAll(): Promise<UsuarioResponseDto[]> {
    return this.usuariosService.findAll();
  }

  /**
   * PATCH /usuarios/:id/rol
   * Actualizar el rol de un usuario
   * Solo para ADMIN
   */
  @Patch(':id/rol')
  @Roles(RolUsuario.ADMIN)
  async updateRol(
    @Param('id') id: string,
    @Body() updateRolDto: UpdateRolDto,
  ): Promise<UsuarioResponseDto> {
    return this.usuariosService.updateRol(id, updateRolDto);
  }
}
