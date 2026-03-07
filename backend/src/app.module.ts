import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { NegociosModule } from './negocios/negocios.module';
import { StatsModule } from './stats/stats.module';
import { ActividadesModule } from './actividades/actividades.module';
import { ReportesModule } from './reportes/reportes.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),
    WinstonModule.forRoot({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      transports: [new winston.transports.Console()],
    }),
    RedisModule,
    PrismaModule,
    AuthModule,
    ClientesModule, // Módulo de gestión de clientes
    NegociosModule, // Módulo de gestión de negocios (pipeline)
    StatsModule, // Módulo de estadísticas del dashboard
    ActividadesModule, // Módulo de gestión de actividades
    ReportesModule, // Módulo de reportes avanzados
    NotificacionesModule, // Módulo de notificaciones real-time
    UsuariosModule, // Módulo de administración de usuarios (ADMIN)
    HealthModule, // Health check endpoint (GET /health)
    MetricsModule, // Metrics endpoint (GET /metrics)
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule {}
