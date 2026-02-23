import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ClientesModule } from './clientes/clientes.module';
import { NegociosModule } from './negocios/negocios.module';
import { StatsModule } from './stats/stats.module';
import { ActividadesModule } from './actividades/actividades.module';
import { ReportesModule } from './reportes/reportes.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    ClientesModule,    // Módulo de gestión de clientes
    NegociosModule,    // Módulo de gestión de negocios (pipeline)
    StatsModule,       // Módulo de estadísticas del dashboard
    ActividadesModule, // Módulo de gestión de actividades
    ReportesModule,    // Módulo de reportes avanzados
    NotificacionesModule, // Módulo de notificaciones real-time
    UsuariosModule,    // Módulo de administración de usuarios (ADMIN)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
