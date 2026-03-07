import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisCacheService } from '../redis/redis-cache.service';
import { EtapaNegocio } from '@prisma/client';
import {
  createMockPrismaService,
  MockPrismaService,
} from '../testing/prisma.mock';

// Mock del RedisCacheService
const createMockCacheService = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  delPattern: jest.fn(),
  reset: jest.fn(),
  getStats: jest.fn(),
  isConnected: jest.fn(),
});

type MockCacheService = ReturnType<typeof createMockCacheService>;

describe('StatsService', () => {
  let service: StatsService;
  let prisma: MockPrismaService;
  let cache: MockCacheService;

  const mockUserId = 'user-1';

  beforeEach(async () => {
    const mockPrismaService = createMockPrismaService();
    const mockCacheService = createMockCacheService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisCacheService, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    prisma = module.get(PrismaService);
    cache = module.get(RedisCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ──────────────────────────────────────────────
  // getGeneralStats
  // ──────────────────────────────────────────────
  describe('getGeneralStats', () => {
    it('debe retornar el valor cacheado sin consultar la DB (cache hit)', async () => {
      // Arrange
      const cachedStats = {
        clientes: { total: 10, nuevosEsteMes: 3, porcentajeCrecimiento: 50 },
        negocios: {
          activos: 5,
          valorPipeline: 50000,
          porcentajeCrecimiento: 25,
        },
        ventas: {
          totalEsteMes: 20000,
          porcentajeCrecimiento: 100,
          objetivoMensual: 100000,
          porcentajeObjetivo: 20,
        },
      };
      cache.get.mockResolvedValue(cachedStats);

      // Act
      const result = await service.getGeneralStats(mockUserId);

      // Assert
      expect(result).toEqual(cachedStats);
      expect(cache.get).toHaveBeenCalledWith(`stats:general:${mockUserId}`);
      expect(prisma.cliente.count).not.toHaveBeenCalled();
      expect(prisma.negocio.count).not.toHaveBeenCalled();
    });

    it('debe consultar la DB y computar stats correctamente (cache miss)', async () => {
      // Arrange
      cache.get.mockResolvedValue(null);

      // Prisma: cliente.count llamado 3 veces (total, esteMes, mesPasado)
      prisma.cliente.count
        .mockResolvedValueOnce(10) // totalClientes
        .mockResolvedValueOnce(3) // clientesNuevosEsteMes
        .mockResolvedValueOnce(2); // clientesNuevosMesPasado

      // Prisma: negocio.count llamado 2 veces (activos, activosMesPasado)
      prisma.negocio.count
        .mockResolvedValueOnce(5) // negociosActivos
        .mockResolvedValueOnce(4); // negociosActivosMesPasado

      // Prisma: negocio.aggregate llamado 3 veces (pipeline, ventasEsteMes, ventasMesPasado)
      prisma.negocio.aggregate
        .mockResolvedValueOnce({ _sum: { valor: 50000 } }) // valorPipeline
        .mockResolvedValueOnce({ _sum: { valor: 20000 } }) // ventasDelMes
        .mockResolvedValueOnce({ _sum: { valor: 10000 } }); // ventasMesPasado

      // Act
      const result = (await service.getGeneralStats(mockUserId)) as any;

      // Assert — estructura y valores calculados
      expect(result.clientes.total).toBe(10);
      expect(result.clientes.nuevosEsteMes).toBe(3);
      // porcentaje = round((3-2)/2 * 100) = 50
      expect(result.clientes.porcentajeCrecimiento).toBe(50);

      expect(result.negocios.activos).toBe(5);
      expect(result.negocios.valorPipeline).toBe(50000);
      // porcentaje = round((5-4)/4 * 100) = 25
      expect(result.negocios.porcentajeCrecimiento).toBe(25);

      expect(result.ventas.totalEsteMes).toBe(20000);
      // porcentaje = round((20000-10000)/10000 * 100) = 100
      expect(result.ventas.porcentajeCrecimiento).toBe(100);
      expect(result.ventas.objetivoMensual).toBe(100000);
      // porcentajeObjetivo = round(20000/100000 * 100) = 20
      expect(result.ventas.porcentajeObjetivo).toBe(20);
    });

    it('debe guardar los stats en cache tras consultar la DB', async () => {
      // Arrange
      cache.get.mockResolvedValue(null);

      prisma.cliente.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1);
      prisma.negocio.count.mockResolvedValueOnce(2).mockResolvedValueOnce(2);
      prisma.negocio.aggregate
        .mockResolvedValueOnce({ _sum: { valor: 10000 } })
        .mockResolvedValueOnce({ _sum: { valor: 5000 } })
        .mockResolvedValueOnce({ _sum: { valor: 5000 } });

      // Act
      await service.getGeneralStats(mockUserId);

      // Assert
      expect(cache.set).toHaveBeenCalledWith(
        `stats:general:${mockUserId}`,
        expect.any(Object),
        120, // CACHE_TTL = 120s
      );
    });

    it('debe retornar porcentajeCrecimiento = 0 cuando el mes pasado no hubo clientes', async () => {
      // Arrange — clientesNuevosMesPasado = 0 (evitar división por cero)
      cache.get.mockResolvedValue(null);

      prisma.cliente.count
        .mockResolvedValueOnce(3) // totalClientes
        .mockResolvedValueOnce(3) // clientesNuevosEsteMes
        .mockResolvedValueOnce(0); // clientesNuevosMesPasado = 0

      prisma.negocio.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      prisma.negocio.aggregate
        .mockResolvedValueOnce({ _sum: { valor: null } })
        .mockResolvedValueOnce({ _sum: { valor: null } })
        .mockResolvedValueOnce({ _sum: { valor: null } });

      // Act
      const result = (await service.getGeneralStats(mockUserId)) as any;

      // Assert
      expect(result.clientes.porcentajeCrecimiento).toBe(0);
    });

    it('debe usar la clave de cache con el userId correcto', async () => {
      // Arrange
      const otherUserId = 'user-99';
      cache.get.mockResolvedValue(null);

      prisma.cliente.count.mockResolvedValue(0);
      prisma.negocio.count.mockResolvedValue(0);
      prisma.negocio.aggregate.mockResolvedValue({ _sum: { valor: null } });

      // Act
      await service.getGeneralStats(otherUserId);

      // Assert
      expect(cache.get).toHaveBeenCalledWith(`stats:general:${otherUserId}`);
      expect(cache.set).toHaveBeenCalledWith(
        `stats:general:${otherUserId}`,
        expect.any(Object),
        120,
      );
    });
  });

  // ──────────────────────────────────────────────
  // getDistribucionPorEtapa
  // ──────────────────────────────────────────────
  describe('getDistribucionPorEtapa', () => {
    it('debe retornar el valor cacheado sin consultar la DB (cache hit)', async () => {
      // Arrange
      const cachedDist = [
        { etapa: EtapaNegocio.PROSPECTO, cantidad: 3, valorTotal: 15000 },
        { etapa: EtapaNegocio.PROPUESTA, cantidad: 2, valorTotal: 30000 },
      ];
      cache.get.mockResolvedValue(cachedDist);

      // Act
      const result = await service.getDistribucionPorEtapa();

      // Assert
      expect(result).toEqual(cachedDist);
      expect(cache.get).toHaveBeenCalledWith('stats:distribucion_etapa');
      expect(prisma.negocio.groupBy).not.toHaveBeenCalled();
    });

    it('debe consultar groupBy y mapear el resultado correctamente (cache miss)', async () => {
      // Arrange
      cache.get.mockResolvedValue(null);

      const groupByResult = [
        {
          etapa: EtapaNegocio.PROSPECTO,
          _count: { id: 3 },
          _sum: { valor: 15000 },
        },
        {
          etapa: EtapaNegocio.GANADO,
          _count: { id: 1 },
          _sum: { valor: null }, // sin valor
        },
      ];
      prisma.negocio.groupBy.mockResolvedValue(groupByResult as any);

      // Act
      const result = (await service.getDistribucionPorEtapa()) as any[];

      // Assert
      expect(prisma.negocio.groupBy).toHaveBeenCalledWith({
        by: ['etapa'],
        _count: { id: true },
        _sum: { valor: true },
      });

      expect(result).toEqual([
        { etapa: EtapaNegocio.PROSPECTO, cantidad: 3, valorTotal: 15000 },
        { etapa: EtapaNegocio.GANADO, cantidad: 1, valorTotal: 0 }, // null → 0
      ]);
    });

    it('debe guardar la distribución en cache tras consultar la DB', async () => {
      // Arrange
      cache.get.mockResolvedValue(null);
      prisma.negocio.groupBy.mockResolvedValue([]);

      // Act
      await service.getDistribucionPorEtapa();

      // Assert
      expect(cache.set).toHaveBeenCalledWith(
        'stats:distribucion_etapa',
        expect.any(Array),
        120,
      );
    });
  });
});
