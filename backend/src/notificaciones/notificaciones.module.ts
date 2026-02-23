import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesGateway } from './notificaciones.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'desarrollo_secret_key_2025',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [NotificacionesController],
  providers: [NotificacionesService, NotificacionesGateway],
  exports: [NotificacionesService, NotificacionesGateway],
})
export class NotificacionesModule {}
