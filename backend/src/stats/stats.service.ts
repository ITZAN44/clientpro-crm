import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EtapaNegocio } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener estadísticas generales del dashboard
   */
  async getGeneralStats(userId: string) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total de clientes
    const totalClientes = await this.prisma.cliente.count();

    // Clientes nuevos este mes
    const clientesNuevosEsteMes = await this.prisma.cliente.count({
      where: {
        creadoEn: {
          gte: firstDayOfMonth,
        },
      },
    });

    // Clientes nuevos mes pasado (para calcular porcentaje)
    const clientesNuevosMesPasado = await this.prisma.cliente.count({
      where: {
        creadoEn: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
    });

    // Calcular porcentaje de crecimiento de clientes
    const porcentajeCrecimientoClientes = clientesNuevosMesPasado > 0
      ? Math.round(((clientesNuevosEsteMes - clientesNuevosMesPasado) / clientesNuevosMesPasado) * 100)
      : 0;

    // Total de negocios activos (no GANADO ni PERDIDO)
    const negociosActivos = await this.prisma.negocio.count({
      where: {
        etapa: {
          notIn: [EtapaNegocio.GANADO, EtapaNegocio.PERDIDO],
        },
      },
    });

    // Valor total en pipeline (negocios activos)
    const valorPipeline = await this.prisma.negocio.aggregate({
      where: {
        etapa: {
          notIn: [EtapaNegocio.GANADO, EtapaNegocio.PERDIDO],
        },
      },
      _sum: {
        valor: true,
      },
    });

    // Negocios activos mes pasado
    const negociosActivosMesPasado = await this.prisma.negocio.count({
      where: {
        AND: [
          {
            etapa: {
              notIn: [EtapaNegocio.GANADO, EtapaNegocio.PERDIDO],
            },
          },
          {
            creadoEn: {
              gte: firstDayOfLastMonth,
              lte: lastDayOfLastMonth,
            },
          },
        ],
      },
    });

    // Calcular porcentaje de crecimiento de negocios
    const porcentajeCrecimientoNegocios = negociosActivosMesPasado > 0
      ? Math.round(((negociosActivos - negociosActivosMesPasado) / negociosActivosMesPasado) * 100)
      : 0;

    // Ventas del mes (negocios GANADOS este mes)
    const ventasDelMes = await this.prisma.negocio.aggregate({
      where: {
        etapa: EtapaNegocio.GANADO,
        cerradoEn: {
          gte: firstDayOfMonth,
        },
      },
      _sum: {
        valor: true,
      },
    });

    // Ventas mes pasado
    const ventasMesPasado = await this.prisma.negocio.aggregate({
      where: {
        etapa: EtapaNegocio.GANADO,
        cerradoEn: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastMonth,
        },
      },
      _sum: {
        valor: true,
      },
    });

    // Calcular porcentaje de crecimiento de ventas
    const ventasEsteMesValor = Number(ventasDelMes._sum.valor || 0);
    const ventasMesPasadoValor = Number(ventasMesPasado._sum.valor || 0);
    const porcentajeCrecimientoVentas = ventasMesPasadoValor > 0
      ? Math.round(((ventasEsteMesValor - ventasMesPasadoValor) / ventasMesPasadoValor) * 100)
      : 0;

    // Objetivo mensual (hardcoded por ahora, se puede hacer configurable)
    const objetivoMensual = 100000; // $100,000
    const porcentajeObjetivo = Math.round((ventasEsteMesValor / objetivoMensual) * 100);

    return {
      clientes: {
        total: totalClientes,
        nuevosEsteMes: clientesNuevosEsteMes,
        porcentajeCrecimiento: porcentajeCrecimientoClientes,
      },
      negocios: {
        activos: negociosActivos,
        valorPipeline: Number(valorPipeline._sum.valor || 0),
        porcentajeCrecimiento: porcentajeCrecimientoNegocios,
      },
      ventas: {
        totalEsteMes: ventasEsteMesValor,
        porcentajeCrecimiento: porcentajeCrecimientoVentas,
        objetivoMensual,
        porcentajeObjetivo,
      },
    };
  }

  /**
   * Obtener distribución de negocios por etapa
   */
  async getDistribucionPorEtapa() {
    const negocios = await this.prisma.negocio.groupBy({
      by: ['etapa'],
      _count: {
        id: true,
      },
      _sum: {
        valor: true,
      },
    });

    return negocios.map((item) => ({
      etapa: item.etapa,
      cantidad: item._count.id,
      valorTotal: Number(item._sum.valor || 0),
    }));
  }
}
