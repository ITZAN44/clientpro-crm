import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NotificacionesService } from './notificaciones.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';

/**
 * WebSocket Gateway para notificaciones en tiempo real
 * Puerto: 4000 (mismo que el backend HTTP)
 * CORS habilitado para frontend en puerto 3000
 */
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notificaciones',
})
export class NotificacionesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificacionesGateway.name);
  private connectedClients: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private notificacionesService: NotificacionesService,
  ) {}

  /**
   * Manejar nueva conexión de cliente
   */
  async handleConnection(client: Socket) {
    try {
      // Extraer token JWT del handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(`Cliente ${client.id} rechazado: sin token`);
        client.disconnect();
        return;
      }

      // Verificar token
      const payload = this.jwtService.verify(token);
      const userId = payload.userId;

      // Guardar mapeo socket -> usuario
      this.connectedClients.set(client.id, userId);

      // Unir al usuario a una room con su ID (para enviar notificaciones específicas)
      await client.join(`user:${userId}`);

      this.logger.log(`Cliente ${client.id} conectado (Usuario: ${userId})`);
      this.logger.log(`Total clientes conectados: ${this.connectedClients.size}`);

      // Enviar evento de bienvenida
      client.emit('conectado', {
        mensaje: 'Conectado al servidor de notificaciones',
        userId,
      });
    } catch (error) {
      this.logger.error(`Error en conexión: ${error.message}`);
      client.disconnect();
    }
  }

  /**
   * Manejar desconexión de cliente
   */
  handleDisconnect(client: Socket) {
    const userId = this.connectedClients.get(client.id);
    this.connectedClients.delete(client.id);
    this.logger.log(`Cliente ${client.id} desconectado (Usuario: ${userId})`);
    this.logger.log(`Total clientes conectados: ${this.connectedClients.size}`);
  }

  /**
   * Emitir notificación a un usuario específico
   */
  async emitirNotificacionAUsuario(usuarioId: string, notificacion: any) {
    this.server.to(`user:${usuarioId}`).emit('nuevaNotificacion', notificacion);
    this.logger.log(`Notificación emitida al usuario ${usuarioId}: ${notificacion.titulo}`);
  }

  /**
   * Emitir notificación a todos los usuarios conectados (broadcast)
   */
  async emitirNotificacionGlobal(notificacion: any) {
    this.server.emit('nuevaNotificacion', notificacion);
    this.logger.log(`Notificación global emitida: ${notificacion.titulo}`);
  }

  /**
   * Emitir evento de negocio actualizado
   */
  async emitirNegocioActualizado(negocioId: string, data: any) {
    this.server.emit('negocioActualizado', { negocioId, ...data });
    this.logger.log(`Evento negocioActualizado emitido para negocio ${negocioId}`);
  }

  /**
   * Emitir evento de actividad vencida
   */
  async emitirActividadVencida(actividadId: string, data: any) {
    this.server.emit('actividadVencida', { actividadId, ...data });
    this.logger.log(`Evento actividadVencida emitido para actividad ${actividadId}`);
  }

  /**
   * Listener: Cliente solicita marcar notificación como leída
   */
  @SubscribeMessage('marcarLeida')
  async handleMarcarLeida(
    @MessageBody() data: { notificacionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = this.connectedClients.get(client.id);
      if (!userId) {
        return { error: 'Usuario no autenticado' };
      }

      await this.notificacionesService.marcarComoLeida(data.notificacionId, userId);
      
      // Emitir confirmación
      client.emit('notificacionLeida', { notificacionId: data.notificacionId });
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error al marcar notificación como leída: ${error.message}`);
      return { error: error.message };
    }
  }

  /**
   * Listener: Cliente solicita contador de no leídas
   */
  @SubscribeMessage('obtenerContadorNoLeidas')
  async handleObtenerContador(@ConnectedSocket() client: Socket) {
    try {
      const userId = this.connectedClients.get(client.id);
      if (!userId) {
        return { error: 'Usuario no autenticado' };
      }

      const { count } = await this.notificacionesService.contarNoLeidas(userId);
      
      client.emit('contadorNoLeidas', { count });
      
      return { count };
    } catch (error) {
      this.logger.error(`Error al obtener contador: ${error.message}`);
      return { error: error.message };
    }
  }
}
