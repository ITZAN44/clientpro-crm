import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const metricsStore = {
  totalRequests: 0,
  errors: 0,
  responseTimes: [] as number[],
  requestsByRoute: {} as Record<string, number>,
};

export function getMetrics() {
  const avgResponseTime =
    metricsStore.responseTimes.length > 0
      ? metricsStore.responseTimes.reduce((a, b) => a + b, 0) /
        metricsStore.responseTimes.length
      : 0;
  return {
    totalRequests: metricsStore.totalRequests,
    errors: metricsStore.errors,
    avgResponseTimeMs: Math.round(avgResponseTime),
    requestsByRoute: metricsStore.requestsByRoute,
    uptimeSecs: Math.floor(process.uptime()),
  };
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      route?: { path: string };
    }>();
    const route = `${req.method} ${req.route?.path ?? req.url}`;

    metricsStore.totalRequests++;
    metricsStore.requestsByRoute[route] =
      (metricsStore.requestsByRoute[route] ?? 0) + 1;

    return next.handle().pipe(
      tap({
        next: () => {
          metricsStore.responseTimes.push(Date.now() - start);
          if (metricsStore.responseTimes.length > 1000) {
            metricsStore.responseTimes.shift();
          }
        },
        error: () => {
          metricsStore.errors++;
          metricsStore.responseTimes.push(Date.now() - start);
          if (metricsStore.responseTimes.length > 1000) {
            metricsStore.responseTimes.shift();
          }
        },
      }),
    );
  }
}
