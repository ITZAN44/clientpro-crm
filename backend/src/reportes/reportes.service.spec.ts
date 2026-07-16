import { Test, TestingModule } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService, MockPrismaService } from '../testing/prisma.mock';

describe('ReportesService', () => {
  let service: ReportesService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ReportesService>(ReportesService);
  });

  // Helper: build the groupBy payload the service expects
  const groupByResult = (counts: Record<string, number>) =>
    Object.entries(counts).map(([etapa, n]) => ({
      etapa,
      _count: { etapa: n },
    }));

  describe('getConversion — tasaCierre (win rate)', () => {
    it('computes win rate as ganados / (ganados + perdidos)', async () => {
      prisma.negocio.groupBy.mockResolvedValue(
        groupByResult({ GANADO: 7, PERDIDO: 3 }),
      );

      const result = await service.getConversion({});

      expect(result.tasaCierre).toBe(70);
    });

    it('ignores open deals so the rate never exceeds 100% (REM-004 regression)', async () => {
      // 7 ganados, 3 perdidos, 5 aún abiertos en PROSPECTO.
      // La fórmula vieja (ganados/prospectos) daba 700%.
      prisma.negocio.groupBy.mockResolvedValue(
        groupByResult({ GANADO: 7, PERDIDO: 3, PROSPECTO: 5 }),
      );

      const result = await service.getConversion({});

      expect(result.tasaCierre).toBe(70);
      expect(result.tasaCierre).toBeLessThanOrEqual(100);
    });

    it('returns 0 when there are no closed deals (division guard)', async () => {
      prisma.negocio.groupBy.mockResolvedValue(
        groupByResult({ PROSPECTO: 4, NEGOCIACION: 2 }),
      );

      const result = await service.getConversion({});

      expect(result.tasaCierre).toBe(0);
    });
  });
});
