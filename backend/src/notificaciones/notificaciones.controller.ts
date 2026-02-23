import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificacionesService } from './notificaciones.service';
import { QueryNotificacionesDto } from './dto/query-notificaciones.dto';
import { NotificacionResponseDto } from './dto/notificacion-response.dto';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  /**
   * GET /notificaciones - Listar notificaciones del usuario
   */
  @Get()
  async listar(
    @Request() req,
    @Query() query: QueryNotificacionesDto,
  ): Promise<{ notificaciones: NotificacionResponseDto[]; total: number; pagina: number; limite: number }> {
    const usuarioId = req.user.userId;
    const { notificaciones, total } = await this.notificacionesService.listar(usuarioId, query);

    return {
      notificaciones,
      total,
      pagina: query.pagina || 1,
      limite: query.limite || 20,
    };
  }

  /**
   * GET /notificaciones/no-leidas/count - Contar notificaciones no leídas
   */
  @Get('no-leidas/count')
  async contarNoLeidas(@Request() req): Promise<{ count: number }> {
    const usuarioId = req.user.userId;
    return this.notificacionesService.contarNoLeidas(usuarioId);
  }

  /**
   * GET /notificaciones/:id - Obtener notificación por ID
   */
  @Get(':id')
  async obtenerPorId(
    @Param('id') id: string,
    @Request() req,
  ): Promise<NotificacionResponseDto> {
    const usuarioId = req.user.userId;
    return this.notificacionesService.obtenerPorId(id, usuarioId);
  }

  /**
   * PATCH /notificaciones/:id/marcar-leida - Marcar notificación como leída
   */
  @Patch(':id/marcar-leida')
  @HttpCode(HttpStatus.OK)
  async marcarComoLeida(
    @Param('id') id: string,
    @Request() req,
  ): Promise<NotificacionResponseDto> {
    const usuarioId = req.user.userId;
    return this.notificacionesService.marcarComoLeida(id, usuarioId);
  }

  /**
   * PATCH /notificaciones/marcar-todas-leidas - Marcar todas las notificaciones como leídas
   */
  @Patch('marcar-todas-leidas')
  @HttpCode(HttpStatus.OK)
  async marcarTodasComoLeidas(@Request() req): Promise<{ actualizado: number }> {
    const usuarioId = req.user.userId;
    return this.notificacionesService.marcarTodasComoLeidas(usuarioId);
  }
}
