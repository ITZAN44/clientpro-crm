import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReporteQueryDto } from './dto/reporte-query.dto';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene métricas de conversión del pipeline
   * Calcula el porcentaje de conversión entre cada etapa
   */
  async getConversion(query: ReporteQueryDto) {
    const { fechaInicio, fechaFin } = query;

    // Construir filtro de fechas si se proporcionan
    const filtroFechas = this.construirFiltroFechas(fechaInicio, fechaFin);

    // Contar negocios por etapa
    const negociosPorEtapa = await this.prisma.negocio.groupBy({
      by: ['etapa'],
      _count: {
        etapa: true,
      },
      where: filtroFechas,
    });

    // Mapear resultados a objeto
    const etapas = {
      PROSPECTO: 0,
      CONTACTO_REALIZADO: 0,
      PROPUESTA: 0,
      NEGOCIACION: 0,
      GANADO: 0,
      PERDIDO: 0,
    };

    negociosPorEtapa.forEach((item) => {
      etapas[item.etapa] = item._count.etapa;
    });

    // Calcular total y tasas de conversión
    const total = Object.values(etapas).reduce((sum, count) => sum + count, 0);
    
    const conversion = [
      {
        etapa: 'PROSPECTO',
        cantidad: etapas.PROSPECTO,
        porcentaje: total > 0 ? (etapas.PROSPECTO / total) * 100 : 0,
      },
      {
        etapa: 'CONTACTO_REALIZADO',
        cantidad: etapas.CONTACTO_REALIZADO,
        porcentaje: etapas.PROSPECTO > 0 
          ? (etapas.CONTACTO_REALIZADO / etapas.PROSPECTO) * 100 
          : 0,
        conversionDesdeInicio: total > 0 ? (etapas.CONTACTO_REALIZADO / total) * 100 : 0,
      },
      {
        etapa: 'PROPUESTA',
        cantidad: etapas.PROPUESTA,
        porcentaje: etapas.CONTACTO_REALIZADO > 0 
          ? (etapas.PROPUESTA / etapas.CONTACTO_REALIZADO) * 100 
          : 0,
        conversionDesdeInicio: total > 0 ? (etapas.PROPUESTA / total) * 100 : 0,
      },
      {
        etapa: 'NEGOCIACION',
        cantidad: etapas.NEGOCIACION,
        porcentaje: etapas.PROPUESTA > 0 
          ? (etapas.NEGOCIACION / etapas.PROPUESTA) * 100 
          : 0,
        conversionDesdeInicio: total > 0 ? (etapas.NEGOCIACION / total) * 100 : 0,
      },
      {
        etapa: 'GANADO',
        cantidad: etapas.GANADO,
        porcentaje: etapas.NEGOCIACION > 0 
          ? (etapas.GANADO / etapas.NEGOCIACION) * 100 
          : 0,
        conversionDesdeInicio: total > 0 ? (etapas.GANADO / total) * 100 : 0,
      },
      {
        etapa: 'PERDIDO',
        cantidad: etapas.PERDIDO,
        porcentaje: total > 0 ? (etapas.PERDIDO / total) * 100 : 0,
      },
    ];

    // Tasa de cierre general (PROSPECTO -> GANADO)
    const tasaCierre = etapas.PROSPECTO > 0 
      ? (etapas.GANADO / etapas.PROSPECTO) * 100 
      : 0;

    return {
      total,
      tasaCierre,
      conversion,
      periodo: {
        inicio: fechaInicio || null,
        fin: fechaFin || null,
      },
    };
  }

  /**
   * Compara métricas del mes actual vs mes anterior
   */
  async getComparativas() {
    const hoy = new Date();
    
    // Mes actual
    const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMesActual = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
    
    // Mes anterior
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 23, 59, 59);

    // Métricas mes actual
    const [
      clientesActual,
      negociosGanadosActual,
      valorTotalActual,
      actividadesActual,
    ] = await Promise.all([
      // Clientes nuevos
      this.prisma.cliente.count({
        where: {
          creadoEn: {
            gte: inicioMesActual,
            lte: finMesActual,
          },
        },
      }),
      // Negocios ganados
      this.prisma.negocio.count({
        where: {
          etapa: 'GANADO',
          cerradoEn: {
            gte: inicioMesActual,
            lte: finMesActual,
          },
        },
      }),
      // Valor total de negocios ganados
      this.prisma.negocio.aggregate({
        where: {
          etapa: 'GANADO',
          cerradoEn: {
            gte: inicioMesActual,
            lte: finMesActual,
          },
        },
        _sum: {
          valor: true,
        },
      }),
      // Actividades completadas
      this.prisma.actividad.count({
        where: {
          completada: true,
          completadaEn: {
            gte: inicioMesActual,
            lte: finMesActual,
          },
        },
      }),
    ]);

    // Métricas mes anterior
    const [
      clientesAnterior,
      negociosGanadosAnterior,
      valorTotalAnterior,
      actividadesAnterior,
    ] = await Promise.all([
      this.prisma.cliente.count({
        where: {
          creadoEn: {
            gte: inicioMesAnterior,
            lte: finMesAnterior,
          },
        },
      }),
      this.prisma.negocio.count({
        where: {
          etapa: 'GANADO',
          cerradoEn: {
            gte: inicioMesAnterior,
            lte: finMesAnterior,
          },
        },
      }),
      this.prisma.negocio.aggregate({
        where: {
          etapa: 'GANADO',
          cerradoEn: {
            gte: inicioMesAnterior,
            lte: finMesAnterior,
          },
        },
        _sum: {
          valor: true,
        },
      }),
      this.prisma.actividad.count({
        where: {
          completada: true,
          completadaEn: {
            gte: inicioMesAnterior,
            lte: finMesAnterior,
          },
        },
      }),
    ]);

    // Calcular porcentajes de cambio
    const calcularCambio = (actual: number, anterior: number) => {
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return ((actual - anterior) / anterior) * 100;
    };

    return {
      clientes: {
        actual: clientesActual,
        anterior: clientesAnterior,
        cambio: calcularCambio(clientesActual, clientesAnterior),
      },
      negociosGanados: {
        actual: negociosGanadosActual,
        anterior: negociosGanadosAnterior,
        cambio: calcularCambio(negociosGanadosActual, negociosGanadosAnterior),
      },
      valorTotal: {
        actual: Number(valorTotalActual._sum.valor) || 0,
        anterior: Number(valorTotalAnterior._sum.valor) || 0,
        cambio: calcularCambio(
          Number(valorTotalActual._sum.valor) || 0,
          Number(valorTotalAnterior._sum.valor) || 0,
        ),
      },
      actividades: {
        actual: actividadesActual,
        anterior: actividadesAnterior,
        cambio: calcularCambio(actividadesActual, actividadesAnterior),
      },
      periodo: {
        mesActual: {
          inicio: inicioMesActual,
          fin: finMesActual,
        },
        mesAnterior: {
          inicio: inicioMesAnterior,
          fin: finMesAnterior,
        },
      },
    };
  }

  /**
   * Obtiene métricas de rendimiento por usuario
   */
  async getRendimientoUsuarios(query: ReporteQueryDto) {
    const { fechaInicio, fechaFin } = query;
    const filtroFechas = this.construirFiltroFechas(fechaInicio, fechaFin, 'cerradoEn');

    // Obtener usuarios activos
    const usuarios = await this.prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
      },
    });

    // Para cada usuario, obtener sus métricas
    const rendimiento = await Promise.all(
      usuarios.map(async (usuario) => {
        const [
          negociosGanados,
          negociosPerdidos,
          valorGenerado,
          actividadesCompletadas,
          totalNegocios,
        ] = await Promise.all([
          // Negocios ganados
          this.prisma.negocio.count({
            where: {
              propietarioId: usuario.id,
              etapa: 'GANADO',
              ...filtroFechas,
            },
          }),
          // Negocios perdidos
          this.prisma.negocio.count({
            where: {
              propietarioId: usuario.id,
              etapa: 'PERDIDO',
              ...filtroFechas,
            },
          }),
          // Valor total generado
          this.prisma.negocio.aggregate({
            where: {
              propietarioId: usuario.id,
              etapa: 'GANADO',
              ...filtroFechas,
            },
            _sum: {
              valor: true,
            },
          }),
          // Actividades completadas
          this.prisma.actividad.count({
            where: {
              asignadoA: usuario.id,
              completada: true,
              completadaEn: fechaInicio || fechaFin 
                ? {
                    ...(fechaInicio && { gte: new Date(fechaInicio) }),
                    ...(fechaFin && { lte: new Date(fechaFin) }),
                  }
                : undefined,
            },
          }),
          // Total de negocios
          this.prisma.negocio.count({
            where: {
              propietarioId: usuario.id,
              ...filtroFechas,
            },
          }),
        ]);

        // Calcular tasa de conversión
        const tasaConversion = totalNegocios > 0 
          ? (negociosGanados / totalNegocios) * 100 
          : 0;

        return {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
          },
          metricas: {
            negociosGanados,
            negociosPerdidos,
            valorGenerado: Number(valorGenerado._sum.valor) || 0,
            actividadesCompletadas,
            totalNegocios,
            tasaConversion,
          },
        };
      }),
    );

    // Ordenar por valor generado (mayor a menor)
    rendimiento.sort((a, b) => 
      b.metricas.valorGenerado - a.metricas.valorGenerado
    );

    return {
      rendimiento,
      periodo: {
        inicio: fechaInicio || null,
        fin: fechaFin || null,
      },
    };
  }

  /**
   * Helper para construir filtro de fechas
   */
  private construirFiltroFechas(
    fechaInicio?: string,
    fechaFin?: string,
    campo: string = 'creadoEn',
  ) {
    if (!fechaInicio && !fechaFin) {
      return {};
    }

    const filtro: any = {};
    
    if (fechaInicio || fechaFin) {
      filtro[campo] = {};
      if (fechaInicio) {
        filtro[campo].gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        filtro[campo].lte = new Date(fechaFin);
      }
    }

    return filtro;
  }
}
