import { of, throwError, lastValueFrom } from 'rxjs';
import { ExecutionContext, CallHandler } from '@nestjs/common';

// Helpers para construir mocks de contexto NestJS
const buildMockContext = (
  method = 'GET',
  url = '/test',
  routePath = '/test',
): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        method,
        url,
        route: { path: routePath },
      }),
    }),
  }) as unknown as ExecutionContext;

const buildSuccessHandler = (
  response: unknown = { ok: true },
): CallHandler => ({
  handle: () => of(response),
});

const buildErrorHandler = (error = new Error('test error')): CallHandler => ({
  handle: () => throwError(() => error),
});

// ──────────────────────────────────────────────────────────────────────────────
// El metricsStore es estado a nivel de módulo: se comparte entre tests del mismo
// archivo. Los tests usan deltas (antes/después) para ser independientes del
// orden de ejecución y del estado acumulado entre suites.
// ──────────────────────────────────────────────────────────────────────────────
import { MetricsInterceptor, getMetrics } from './metrics.interceptor';

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor;

  beforeEach(() => {
    interceptor = new MetricsInterceptor();
  });

  describe('intercept — conteo de requests', () => {
    it('debe incrementar totalRequests en cada solicitud exitosa', async () => {
      // Arrange
      const before = getMetrics().totalRequests;
      const ctx = buildMockContext();
      const handler = buildSuccessHandler();

      // Act
      await lastValueFrom(interceptor.intercept(ctx, handler));

      // Assert
      expect(getMetrics().totalRequests).toBe(before + 1);
    });

    it('debe incrementar totalRequests incluso cuando la solicitud falla', async () => {
      // Arrange
      const before = getMetrics().totalRequests;
      const ctx = buildMockContext();
      const handler = buildErrorHandler();

      // Act — el observable lanzará, se captura
      await expect(
        lastValueFrom(interceptor.intercept(ctx, handler)),
      ).rejects.toThrow('test error');

      // Assert
      expect(getMetrics().totalRequests).toBe(before + 1);
    });

    it('debe incrementar errors cuando la solicitud falla', async () => {
      // Arrange
      const before = getMetrics().errors;
      const ctx = buildMockContext();
      const handler = buildErrorHandler();

      // Act
      await expect(
        lastValueFrom(interceptor.intercept(ctx, handler)),
      ).rejects.toThrow();

      // Assert
      expect(getMetrics().errors).toBe(before + 1);
    });

    it('no debe incrementar errors cuando la solicitud es exitosa', async () => {
      // Arrange
      const before = getMetrics().errors;
      const ctx = buildMockContext();
      const handler = buildSuccessHandler();

      // Act
      await lastValueFrom(interceptor.intercept(ctx, handler));

      // Assert
      expect(getMetrics().errors).toBe(before); // sin cambio
    });
  });

  describe('intercept — conteo por ruta', () => {
    it('debe registrar la ruta usando method + route.path', async () => {
      // Arrange
      const ctx = buildMockContext('POST', '/api/clientes', '/clientes');
      const before = getMetrics().requestsByRoute['POST /clientes'] ?? 0;

      // Act
      await lastValueFrom(interceptor.intercept(ctx, buildSuccessHandler()));

      // Assert
      expect(getMetrics().requestsByRoute['POST /clientes']).toBe(before + 1);
    });

    it('debe usar req.url como fallback cuando route.path no existe', async () => {
      // Arrange
      const ctx = {
        switchToHttp: () => ({
          getRequest: () => ({
            method: 'GET',
            url: '/fallback-url',
            route: undefined,
          }),
        }),
      } as unknown as ExecutionContext;
      const before = getMetrics().requestsByRoute['GET /fallback-url'] ?? 0;

      // Act
      await lastValueFrom(interceptor.intercept(ctx, buildSuccessHandler()));

      // Assert
      expect(getMetrics().requestsByRoute['GET /fallback-url']).toBe(
        before + 1,
      );
    });
  });

  describe('getMetrics — cálculo de métricas', () => {
    it('debe retornar avgResponseTimeMs >= 0 tras una solicitud exitosa', async () => {
      // Act
      await lastValueFrom(
        interceptor.intercept(buildMockContext(), buildSuccessHandler()),
      );

      // Assert
      expect(getMetrics().avgResponseTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('debe retornar uptimeSecs como número positivo', () => {
      expect(getMetrics().uptimeSecs).toBeGreaterThanOrEqual(0);
    });

    it('debe incluir todos los campos esperados en la respuesta', () => {
      const metrics = getMetrics();

      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('errors');
      expect(metrics).toHaveProperty('avgResponseTimeMs');
      expect(metrics).toHaveProperty('requestsByRoute');
      expect(metrics).toHaveProperty('uptimeSecs');
    });
  });
});
