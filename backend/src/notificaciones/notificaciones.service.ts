import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { NotificacionResponseDto } from './dto/notificacion-response.dto';
import { QueryNotificacionesDto } from './dto/query-notificaciones.dto';
import { TipoNotificacion } from '@prisma/client';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una nueva notificación
   */
  async crear(dto: CreateNotificacionDto): Promise<NotificacionResponseDto> {
    const notificacion = await this.prisma.notificacion.create({
      data: {
        tipo: dto.tipo,
        titulo: dto.titulo,
        mensaje: dto.mensaje,
        usuarioId: dto.usuarioId,
        negocioRelacionadoId: dto.negocioRelacionadoId,
        clienteRelacionadoId: dto.clienteRelacionadoId,
        actividadRelacionadaId: dto.actividadRelacionadaId,
        urlAccion: dto.urlAccion,
      },
      include: {
        negocioRelacionado: {
          select: {
            id: true,
            titulo: true,
            etapa: true,
          },
        },
        clienteRelacionado: {
          select: {
            id: true,
            nombre: true,
          },
        },
        actividadRelacionada: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
          },
        },
      },
    });

    return this.mapToResponseDto(notificacion);
  }

  /**
   * Listar notificaciones del usuario autenticado
   */
  async listar(
    usuarioId: string,
    query: QueryNotificacionesDto,
  ): Promise<{ notificaciones: NotificacionResponseDto[]; total: number }> {
    const { pagina = 1, limite = 20, leida } = query;
    const skip = (pagina - 1) * limite;

    const where: any = { usuarioId };
    if (leida !== undefined) {
      where.leida = leida;
    }

    const [notificaciones, total] = await Promise.all([
      this.prisma.notificacion.findMany({
        where,
        skip,
        take: limite,
        orderBy: { creadoEn: 'desc' },
        include: {
          negocioRelacionado: {
            select: {
              id: true,
              titulo: true,
              etapa: true,
            },
          },
          clienteRelacionado: {
            select: {
              id: true,
              nombre: true,
            },
          },
          actividadRelacionada: {
            select: {
              id: true,
              titulo: true,
              tipo: true,
            },
          },
        },
      }),
      this.prisma.notificacion.count({ where }),
    ]);

    return {
      notificaciones: notificaciones.map(this.mapToResponseDto),
      total,
    };
  }

  /**
   * Obtener una notificación por ID
   */
  async obtenerPorId(id: string, usuarioId: string): Promise<NotificacionResponseDto> {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: { id, usuarioId },
      include: {
        negocioRelacionado: {
          select: {
            id: true,
            titulo: true,
            etapa: true,
          },
        },
        clienteRelacionado: {
          select: {
            id: true,
            nombre: true,
          },
        },
        actividadRelacionada: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
          },
        },
      },
    });

    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }

    return this.mapToResponseDto(notificacion);
  }

  /**
   * Marcar notificación como leída
   */
  async marcarComoLeida(id: string, usuarioId: string): Promise<NotificacionResponseDto> {
    const notificacion = await this.prisma.notificacion.updateMany({
      where: { id, usuarioId },
      data: { leida: true },
    });

    if (notificacion.count === 0) {
      throw new Error('Notificación no encontrada');
    }

    return this.obtenerPorId(id, usuarioId);
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(usuarioId: string): Promise<{ actualizado: number }> {
    const resultado = await this.prisma.notificacion.updateMany({
      where: { usuarioId, leida: false },
      data: { leida: true },
    });

    return { actualizado: resultado.count };
  }

  /**
   * Contar notificaciones no leídas
   */
  async contarNoLeidas(usuarioId: string): Promise<{ count: number }> {
    const count = await this.prisma.notificacion.count({
      where: { usuarioId, leida: false },
    });

    return { count };
  }

  /**
   * Eliminar notificaciones antiguas (limpieza)
   * @param dias Días de antigüedad (por defecto 30)
   */
  async limpiarAntiguas(dias: number = 30): Promise<{ eliminado: number }> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);

    const resultado = await this.prisma.notificacion.deleteMany({
      where: {
        creadoEn: {
          lt: fechaLimite,
        },
        leida: true,
      },
    });

    return { eliminado: resultado.count };
  }

  /**
   * Helper: Mapear entidad a DTO de respuesta
   */
  private mapToResponseDto(notificacion: any): NotificacionResponseDto {
    return {
      id: notificacion.id,
      tipo: notificacion.tipo as TipoNotificacion,
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      leida: notificacion.leida,
      usuarioId: notificacion.usuarioId,
      negocioRelacionadoId: notificacion.negocioRelacionadoId,
      clienteRelacionadoId: notificacion.clienteRelacionadoId,
      actividadRelacionadaId: notificacion.actividadRelacionadaId,
      urlAccion: notificacion.urlAccion,
      creadoEn: notificacion.creadoEn,
      negocioRelacionado: notificacion.negocioRelacionado,
      clienteRelacionado: notificacion.clienteRelacionado,
      actividadRelacionada: notificacion.actividadRelacionada,
    };
  }
}
