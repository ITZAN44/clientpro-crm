import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActividadDto, TipoActividad } from './dto/create-actividad.dto';
import { UpdateActividadDto } from './dto/update-actividad.dto';

@Injectable()
export class ActividadesService {
  constructor(private prisma: PrismaService) {}

  async create(createActividadDto: CreateActividadDto, userId: string) {
    // Validar que tenga al menos negocioId o clienteId
    if (!createActividadDto.negocioId && !createActividadDto.clienteId) {
      throw new BadRequestException('La actividad debe estar asociada a un negocio o a un cliente');
    }

    // Si se proporciona negocioId, validar que existe
    if (createActividadDto.negocioId) {
      const negocio = await this.prisma.negocio.findUnique({
        where: { id: createActividadDto.negocioId },
      });
      if (!negocio) {
        throw new NotFoundException(`Negocio con ID ${createActividadDto.negocioId} no encontrado`);
      }
    }

    // Si se proporciona clienteId, validar que existe
    if (createActividadDto.clienteId) {
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: createActividadDto.clienteId },
      });
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${createActividadDto.clienteId} no encontrado`);
      }
    }

    // Si se proporciona asignadoA, validar que existe, sino usar userId
    const asignadoA = createActividadDto.asignadoA || userId;
    if (createActividadDto.asignadoA) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: createActividadDto.asignadoA },
      });
      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${createActividadDto.asignadoA} no encontrado`);
      }
    }

    const actividad = await this.prisma.actividad.create({
      data: {
        tipo: createActividadDto.tipo as any,
        titulo: createActividadDto.titulo,
        descripcion: createActividadDto.descripcion,
        fechaVencimiento: createActividadDto.fechaVencimiento,
        completada: createActividadDto.completada || false,
        negocioId: createActividadDto.negocioId,
        clienteId: createActividadDto.clienteId,
        asignadoA: asignadoA,
        creadoPor: userId,
      },
      include: {
        negocio: {
          select: {
            id: true,
            titulo: true,
            valor: true,
            etapa: true,
          },
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            empresa: true,
            email: true,
          },
        },
        usuarioAsignado: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return this.mapActividadToResponse(actividad);
  }

  async findAll(userId: string, query: {
    page?: number;
    limit?: number;
    search?: string;
    tipo?: string;
    completada?: string;
    asignadoA?: string;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {};

    // Filtro de búsqueda por título o descripción
    if (query.search) {
      where.OR = [
        { titulo: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Filtro por tipo
    if (query.tipo) {
      where.tipo = query.tipo;
    }

    // Filtro por completada
    if (query.completada !== undefined) {
      where.completada = query.completada === 'true';
    }

    // Filtro por asignado
    if (query.asignadoA) {
      where.asignadoA = query.asignadoA;
    }

    const [actividades, total] = await Promise.all([
      this.prisma.actividad.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { completada: 'asc' }, // Pendientes primero
          { fechaVencimiento: 'asc' }, // Próximas a vencer primero
        ],
        include: {
          negocio: {
            select: {
              id: true,
              titulo: true,
              valor: true,
              etapa: true,
            },
          },
          cliente: {
            select: {
              id: true,
              nombre: true,
              empresa: true,
              email: true,
            },
          },
          usuarioAsignado: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
          usuarioCreador: {
            select: {
              id: true,
              nombre: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.actividad.count({ where }),
    ]);

    return {
      data: actividades.map(act => this.mapActividadToResponse(act)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const actividad = await this.prisma.actividad.findUnique({
      where: { id },
      include: {
        negocio: {
          select: {
            id: true,
            titulo: true,
            valor: true,
            etapa: true,
          },
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            empresa: true,
            email: true,
          },
        },
        usuarioAsignado: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    if (!actividad) {
      throw new NotFoundException(`Actividad con ID ${id} no encontrada`);
    }

    return this.mapActividadToResponse(actividad);
  }

  async update(id: string, updateActividadDto: UpdateActividadDto, userId: string) {
    // Verificar que existe
    await this.findOne(id);

    // Si se actualiza negocioId o clienteId, validar
    if (updateActividadDto.negocioId) {
      const negocio = await this.prisma.negocio.findUnique({
        where: { id: updateActividadDto.negocioId },
      });
      if (!negocio) {
        throw new NotFoundException(`Negocio con ID ${updateActividadDto.negocioId} no encontrado`);
      }
    }

    if (updateActividadDto.clienteId) {
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: updateActividadDto.clienteId },
      });
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${updateActividadDto.clienteId} no encontrado`);
      }
    }

    if (updateActividadDto.asignadoA) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: updateActividadDto.asignadoA },
      });
      if (!usuario) {
        throw new NotFoundException(`Usuario con ID ${updateActividadDto.asignadoA} no encontrado`);
      }
    }

    const actividad = await this.prisma.actividad.update({
      where: { id },
      data: {
        tipo: updateActividadDto.tipo as any,
        titulo: updateActividadDto.titulo,
        descripcion: updateActividadDto.descripcion,
        fechaVencimiento: updateActividadDto.fechaVencimiento,
        completada: updateActividadDto.completada,
        negocioId: updateActividadDto.negocioId,
        clienteId: updateActividadDto.clienteId,
        asignadoA: updateActividadDto.asignadoA,
      },
      include: {
        negocio: {
          select: {
            id: true,
            titulo: true,
            valor: true,
            etapa: true,
          },
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            empresa: true,
            email: true,
          },
        },
        usuarioAsignado: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return this.mapActividadToResponse(actividad);
  }

  async marcarCompletada(id: string) {
    // Verificar que existe
    await this.findOne(id);

    const actividad = await this.prisma.actividad.update({
      where: { id },
      data: {
        completada: true,
        completadaEn: new Date(),
      },
      include: {
        negocio: {
          select: {
            id: true,
            titulo: true,
            valor: true,
            etapa: true,
          },
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            empresa: true,
            email: true,
          },
        },
        usuarioAsignado: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
        usuarioCreador: {
          select: {
            id: true,
            nombre: true,
            email: true,
          },
        },
      },
    });

    return this.mapActividadToResponse(actividad);
  }

  async remove(id: string) {
    // Verificar que existe
    await this.findOne(id);

    await this.prisma.actividad.delete({
      where: { id },
    });

    return { message: 'Actividad eliminada correctamente' };
  }

  // Método auxiliar para mapear a response DTO
  private mapActividadToResponse(actividad: any) {
    return {
      id: actividad.id,
      tipo: actividad.tipo,
      titulo: actividad.titulo,
      descripcion: actividad.descripcion,
      fechaVencimiento: actividad.fechaVencimiento,
      completada: actividad.completada,
      completadaEn: actividad.completadaEn,
      negocioId: actividad.negocioId,
      clienteId: actividad.clienteId,
      asignadoA: actividad.asignadoA,
      creadoPor: actividad.creadoPor,
      creadoEn: actividad.creadoEn,
      actualizadoEn: actividad.actualizadoEn,
      negocio: actividad.negocio,
      cliente: actividad.cliente,
      asignado: actividad.usuarioAsignado,
      creador: actividad.usuarioCreador,
    };
  }
}
