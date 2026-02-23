import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<string> {
    try {
      const usuariosCount = await this.prisma.usuario.count();
      const clientesCount = await this.prisma.cliente.count();
      const negociosCount = await this.prisma.negocio.count();

      return `🚀 ClientPro CRM API - Conectado a PostgreSQL ✅\n📊 Base de datos: ${usuariosCount} usuarios, ${clientesCount} clientes, ${negociosCount} negocios`;
    } catch (error) {
      return `🚀 ClientPro CRM API\n⚠️ Backend funcionando correctamente\n❌ Error de conexión a PostgreSQL: ${error.code || error.message}\n💡 Verifica que PostgreSQL esté corriendo y el puerto sea correcto`;
    }
  }
}
