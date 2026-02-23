import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNegocioDto } from './dto/create-negocio.dto';
import { UpdateNegocioDto } from './dto/update-negocio.dto';
import { NegocioResponseDto, NegociosResponseDto } from './dto/negocio-response.dto';
import { EtapaNegocio, Prisma, TipoNotificacion } from '@prisma/client';
import { NotificacionesGateway } from '../notificaciones/notificaciones.gateway';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

@Injectable()
export class NegociosService {
  constructor(
    private prisma: PrismaService,
    private notificacionesGateway: NotificacionesGateway,
    private notificacionesService: NotificacionesService,
  ) {}

  /**
   * Crear un nuevo negocio
   */
  async create(createNegocioDto: CreateNegocioDto, userId: string): Promise<NegocioResponseDto> {
    try {
      // Si no se especifica propietario, asignar al usuario actual
      const propietarioId = createNegocioDto.propietarioId || userId;

      // Verificar que el cliente existe
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: createNegocioDto.clienteId },
      });

      if (!cliente) {
        throw new BadRequestException('El cliente especificado no existe');
      }

      // Convertir fechaCierreEsperada a Date si existe
      const fechaCierreEsperada = createNegocioDto.fechaCierreEsperada
        ? new Date(createNegocioDto.fechaCierreEsperada)
        : undefined;

      const negocio = await this.prisma.negocio.create({
        data: {
          titulo: createNegocioDto.titulo,
          descripcion: createNegocioDto.descripcion,
          valor: createNegocioDto.valor || 0,
          moneda: createNegocioDto.moneda || 'MXN',
          etapa: createNegocioDto.etapa || 'PROSPECTO',
          probabilidad: createNegocioDto.probabilidad || 0,
          fechaCierreEsperada,
          clienteId: createNegocioDto.clienteId,
          propietarioId,
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              email: true,
              empresa: true,
            },
          },
          propietario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      return this.mapToResponseDto(negocio);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al crear el negocio: ' + error.message);
    }
  }

  /**
   * Listar todos los negocios con paginación y filtros
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    etapa?: EtapaNegocio,
    propietarioId?: string,
  ): Promise<NegociosResponseDto> {
    const skip = (page - 1) * limit;
    
    // Construir filtros
    const where: Prisma.NegocioWhereInput = {};

    // Filtro de búsqueda (título o descripción)
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } },
        { cliente: { nombre: { contains: search, mode: 'insensitive' } } },
        { cliente: { empresa: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Filtro por etapa
    if (etapa) {
      where.etapa = etapa;
    }

    // Filtro por propietario
    if (propietarioId) {
      where.propietarioId = propietarioId;
    }

    const [negocios, total] = await Promise.all([
      this.prisma.negocio.findMany({
        where,
        skip,
        take: limit,
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              email: true,
              empresa: true,
            },
          },
          propietario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { creadoEn: 'desc' },
      }),
      this.prisma.negocio.count({ where }),
    ]);

    return {
      data: negocios.map(this.mapToResponseDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un negocio por ID
   */
  async findOne(id: string): Promise<NegocioResponseDto> {
    const negocio = await this.prisma.negocio.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            email: true,
            empresa: true,
          },
        },
        propietario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!negocio) {
      throw new NotFoundException(`Negocio con ID ${id} no encontrado`);
    }

    return this.mapToResponseDto(negocio);
  }

  /**
   * Actualizar un negocio
   */
  async update(id: string, updateNegocioDto: UpdateNegocioDto, userId: string): Promise<NegocioResponseDto> {
    // Verificar que el negocio existe
    const negocioExistente = await this.prisma.negocio.findUnique({
      where: { id },
    });

    if (!negocioExistente) {
      throw new NotFoundException(`Negocio con ID ${id} no encontrado`);
    }

    try {
      const updateData = updateNegocioDto as any;

      // Convertir fechas si existen
      if (updateNegocioDto.fechaCierreEsperada) {
        updateData.fechaCierreEsperada = new Date(updateNegocioDto.fechaCierreEsperada);
      }

      if (updateNegocioDto.fechaCierreReal) {
        updateData.fechaCierreReal = new Date(updateNegocioDto.fechaCierreReal);
      }

      // Si se cambia a GANADO o PERDIDO, actualizar cerradoEn
      if (
        updateNegocioDto.etapa &&
        (updateNegocioDto.etapa === 'GANADO' || updateNegocioDto.etapa === 'PERDIDO') &&
        negocioExistente.etapa !== updateNegocioDto.etapa
      ) {
        updateData.cerradoEn = new Date();
      }

      const negocio = await this.prisma.negocio.update({
        where: { id },
        data: updateData,
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              email: true,
              empresa: true,
            },
          },
          propietario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      return this.mapToResponseDto(negocio);
    } catch (error) {
      throw new BadRequestException('Error al actualizar el negocio: ' + error.message);
    }
  }

  /**
   * Eliminar un negocio
   */
  async remove(id: string): Promise<void> {
    // Verificar que el negocio existe
    const negocio = await this.prisma.negocio.findUnique({
      where: { id },
    });

    if (!negocio) {
      throw new NotFoundException(`Negocio con ID ${id} no encontrado`);
    }

    await this.prisma.negocio.delete({
      where: { id },
    });
  }

  /**
   * Cambiar etapa de un negocio
   */
  async cambiarEtapa(id: string, etapa: EtapaNegocio, usuarioActualId?: string): Promise<NegocioResponseDto> {
    try {
      const negocio = await this.prisma.negocio.findUnique({
        where: { id },
      });

      if (!negocio) {
        throw new NotFoundException(`Negocio con ID ${id} no encontrado`);
      }

      const updateData: any = { etapa };

      // Si se mueve a GANADO o PERDIDO, registrar fecha de cierre
      if ((etapa === 'GANADO' || etapa === 'PERDIDO') && negocio.etapa !== etapa) {
        updateData.cerradoEn = new Date();
      }

      // Si se reabre un negocio cerrado, limpiar cerradoEn
      if (
        (negocio.etapa === 'GANADO' || negocio.etapa === 'PERDIDO') &&
        etapa !== 'GANADO' &&
        etapa !== 'PERDIDO'
      ) {
        updateData.cerradoEn = null;
      }

      const negocioActualizado = await this.prisma.negocio.update({
        where: { id },
        data: updateData,
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              email: true,
              empresa: true,
            },
          },
          propietario: {
            select: {
              id: true,
              nombre: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      // Emitir evento WebSocket de negocio actualizado
      await this.notificacionesGateway.emitirNegocioActualizado(id, {
        etapa: etapa,
        etapaAnterior: negocio.etapa,
        titulo: negocioActualizado.titulo,
      });

      // Crear notificaciones para el cambio de etapa
      const esGanadoOPerdido = etapa === 'GANADO' || etapa === 'PERDIDO';
      
      // Solo crear notificaciones si se cambia la etapa
      if (negocio.etapa !== etapa) {
        // Determinar tipo de notificación y mensajes
        let tipoPropietario: TipoNotificacion;
        let tipoUsuario: TipoNotificacion;
        let accion: string;
        
        if (etapa === 'GANADO') {
          tipoPropietario = TipoNotificacion.NEGOCIO_GANADO;
          tipoUsuario = TipoNotificacion.NEGOCIO_GANADO;
          accion = 'ganado';
        } else if (etapa === 'PERDIDO') {
          tipoPropietario = TipoNotificacion.NEGOCIO_PERDIDO;
          tipoUsuario = TipoNotificacion.NEGOCIO_PERDIDO;
          accion = 'perdido';
        } else {
          // Usar NEGOCIO_ASIGNADO temporalmente hasta que TypeScript recargue
          tipoPropietario = 'NEGOCIO_ACTUALIZADO' as TipoNotificacion;
          tipoUsuario = 'NEGOCIO_ACTUALIZADO' as TipoNotificacion;
          accion = `actualizado a ${this.formatearEtapa(etapa)}`;
        }

        // 1. Notificación para el propietario del negocio
        const notificacionPropietario = await this.notificacionesService.crear({
          tipo: tipoPropietario,
          titulo: esGanadoOPerdido 
            ? `Negocio ${accion}: ${negocioActualizado.titulo}`
            : `Negocio movido a ${this.formatearEtapa(etapa)}: ${negocioActualizado.titulo}`,
          mensaje: esGanadoOPerdido
            ? `Tu negocio "${negocioActualizado.titulo}" ha sido marcado como ${accion}`
            : `Tu negocio "${negocioActualizado.titulo}" fue movido de ${this.formatearEtapa(negocio.etapa)} a ${this.formatearEtapa(etapa)}`,
          usuarioId: negocioActualizado.propietarioId,
          negocioRelacionadoId: id,
          urlAccion: `/negocios`,
        });

        // Emitir notificación al propietario
        await this.notificacionesGateway.emitirNotificacionAUsuario(
          negocioActualizado.propietarioId,
          notificacionPropietario,
        );

        // 2. Notificación para el usuario que hizo el cambio (si es diferente del propietario)
        if (usuarioActualId && usuarioActualId !== negocioActualizado.propietarioId) {
          const notificacionUsuario = await this.notificacionesService.crear({
            tipo: tipoUsuario,
            titulo: esGanadoOPerdido
              ? `Negocio actualizado: ${negocioActualizado.titulo}`
              : `Negocio movido: ${negocioActualizado.titulo}`,
            mensaje: esGanadoOPerdido
              ? `Marcaste el negocio "${negocioActualizado.titulo}" de ${negocioActualizado.propietario.nombre} como ${accion}`
              : `Moviste el negocio "${negocioActualizado.titulo}" de ${negocioActualizado.propietario.nombre} a ${this.formatearEtapa(etapa)}`,
            usuarioId: usuarioActualId,
            negocioRelacionadoId: id,
            urlAccion: `/negocios`,
          });

          // Emitir notificación al usuario que hizo el cambio
          await this.notificacionesGateway.emitirNotificacionAUsuario(
            usuarioActualId,
            notificacionUsuario,
          );
        }
      }

      return this.mapToResponseDto(negocioActualizado);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al cambiar etapa del negocio: ${error.message}`);
    }
  }

  /**
   * Formatear nombre de etapa para mensajes
   */
  private formatearEtapa(etapa: EtapaNegocio): string {
    const nombres = {
      PROSPECTO: 'Prospecto',
      CONTACTO_REALIZADO: 'Contacto Realizado',
      PROPUESTA: 'Propuesta',
      NEGOCIACION: 'Negociación',
      GANADO: 'Ganado',
      PERDIDO: 'Perdido',
    };
    return nombres[etapa] || etapa;
  }

  /**
   * Mapear de Prisma a DTO de respuesta
   */
  private mapToResponseDto(negocio: any): NegocioResponseDto {
    return {
      id: negocio.id,
      titulo: negocio.titulo,
      descripcion: negocio.descripcion ?? undefined,
      valor: Number(negocio.valor), // Convertir Decimal a número
      moneda: negocio.moneda,
      etapa: negocio.etapa,
      probabilidad: negocio.probabilidad,
      fechaCierreEsperada: negocio.fechaCierreEsperada ?? undefined,
      fechaCierreReal: negocio.fechaCierreReal ?? undefined,
      clienteId: negocio.clienteId,
      propietarioId: negocio.propietarioId,
      creadoEn: negocio.creadoEn,
      actualizadoEn: negocio.actualizadoEn,
      cerradoEn: negocio.cerradoEn ?? undefined,
      cliente: negocio.cliente,
      propietario: negocio.propietario,
    };
  }
}
