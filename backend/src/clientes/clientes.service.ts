import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { ClienteResponseDto } from './dto/cliente-response.dto';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class ClientesService {
  constructor(private prisma: PrismaService) {}

  async create(createClienteDto: CreateClienteDto, usuarioId: string): Promise<ClienteResponseDto> {
    try {
      // Si no se proporciona propietarioId, usar el usuario autenticado
      const propietarioId = createClienteDto.propietarioId || usuarioId;

      // Verificar que el propietario existe
      const propietarioExiste = await this.prisma.usuario.findUnique({
        where: { id: propietarioId },
      });

      if (!propietarioExiste) {
        throw new BadRequestException('El propietario especificado no existe');
      }

      const cliente = await this.prisma.cliente.create({
        data: {
          nombre: createClienteDto.nombre,
          email: createClienteDto.email,
          telefono: createClienteDto.telefono,
          empresa: createClienteDto.empresa,
          puesto: createClienteDto.puesto,
          direccion: createClienteDto.direccion,
          ciudad: createClienteDto.ciudad,
          pais: createClienteDto.pais,
          sitioWeb: createClienteDto.sitioWeb,
          notas: createClienteDto.notas,
          propietarioId,
        },
        include: {
          propietario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });

      return this.mapToResponseDto(cliente);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el cliente');
    }
  }

  async findAll(page = 1, limit = 10, search?: string, user?: any) {
    const skip = (page - 1) * limit;

    // Construir filtro base
    const searchFilter = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { empresa: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // Si es VENDEDOR, solo ver sus propios clientes
    const roleFilter =
      user?.rol === RolUsuario.VENDEDOR
        ? { propietarioId: user.userId }
        : {};

    const where = { ...searchFilter, ...roleFilter };

    const [clientes, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        include: {
          propietario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
        orderBy: {
          creadoEn: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return {
      data: clientes.map((cliente) => this.mapToResponseDto(cliente)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user?: any): Promise<ClienteResponseDto> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: {
        propietario: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Si es VENDEDOR, solo puede ver sus propios clientes
    if (user?.rol === RolUsuario.VENDEDOR && cliente.propietarioId !== user.userId) {
      throw new ForbiddenException('No tienes permiso para ver este cliente');
    }

    return this.mapToResponseDto(cliente);
  }

  async update(id: string, updateClienteDto: UpdateClienteDto): Promise<ClienteResponseDto> {
    // Verificar que el cliente existe
    const clienteExiste = await this.prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExiste) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Si se proporciona un nuevo propietarioId, verificar que existe
    const updateData = updateClienteDto as any;
    if (updateData.propietarioId) {
      const propietarioExiste = await this.prisma.usuario.findUnique({
        where: { id: updateData.propietarioId },
      });

      if (!propietarioExiste) {
        throw new BadRequestException('El propietario especificado no existe');
      }
    }

    try {
      const cliente = await this.prisma.cliente.update({
        where: { id },
        data: {
          ...updateClienteDto,
        },
        include: {
          propietario: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      });

      return this.mapToResponseDto(cliente);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el cliente');
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    // Verificar que el cliente existe
    const clienteExiste = await this.prisma.cliente.findUnique({
      where: { id },
    });

    if (!clienteExiste) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    try {
      await this.prisma.cliente.delete({
        where: { id },
      });

      return { message: 'Cliente eliminado correctamente' };
    } catch (error) {
      throw new BadRequestException('Error al eliminar el cliente');
    }
  }

  private mapToResponseDto(cliente: any): ClienteResponseDto {
    return {
      id: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email ?? undefined,
      telefono: cliente.telefono ?? undefined,
      empresa: cliente.empresa ?? undefined,
      puesto: cliente.puesto ?? undefined,
      direccion: cliente.direccion ?? undefined,
      ciudad: cliente.ciudad ?? undefined,
      pais: cliente.pais ?? undefined,
      sitioWeb: cliente.sitioWeb ?? undefined,
      notas: cliente.notas ?? undefined,
      propietarioId: cliente.propietarioId,
      propietario: cliente.propietario
        ? {
            id: cliente.propietario.id,
            nombre: cliente.propietario.nombre,
            email: cliente.propietario.email,
          }
        : undefined,
      creadoEn: cliente.creadoEn,
      actualizadoEn: cliente.actualizadoEn,
    };
  }
}
